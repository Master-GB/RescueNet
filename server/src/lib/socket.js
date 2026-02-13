import { Server } from "socket.io";
import Location from "../models/Location.js";

// Store active socket connections mapped to session IDs
const activeConnections = new Map();

/**
 * Initialize Socket.IO on the provided HTTP server.
 * @param {import("http").Server} httpServer - Node HTTP server instance.
 * @param {string} clientUrl - Allowed client origin for CORS.
 * @returns {Server} The configured Socket.IO server instance.
 */
export function setupSocketIO(httpServer, clientUrl = process.env.CLIENT_URL) {
  if (!httpServer) {
    console.error("Socket.IO init skipped: HTTP server instance is missing");
    return null;
  }

  const origin = clientUrl || "http://localhost:5173";

  let io;
  try {
    io = new Server(httpServer, {
      cors: {
        origin,
        credentials: true,
      },
    });
  } catch (err) {
    console.error("Failed to configure Socket.IO:", err?.message ?? err);
    return null;
  }

  io.on("connection", (socket) => {
    console.log("User connected to RescueNet:", socket.id);

    /**
     * Join a location tracking room to receive updates
     * Used by responders/viewers to watch a specific user's location
     */
    socket.on("watch:location", (sessionId) => {
      socket.join(`location:${sessionId}`);
      console.log(`Socket ${socket.id} watching location: ${sessionId}`);
    });

    /**
     * Stop watching a location
     */
    socket.on("unwatch:location", (sessionId) => {
      socket.leave(`location:${sessionId}`);
      console.log(`Socket ${socket.id} stopped watching: ${sessionId}`);
    });

    /**
     * Join emergency broadcast room to receive all emergency alerts
     */
    socket.on("watch:emergencies", () => {
      socket.join("emergencies");
      console.log(`Socket ${socket.id} watching all emergencies`);
    });

    /**
     * Start sharing location via socket (real-time)
     */
    socket.on("location:start", async (data) => {
      try {
        const {
          sessionId,
          latitude,
          longitude,
          accuracy,
          altitude,
          speed,
          heading,
          userName,
          contactNumber,
          isEmergency,
          emergencyType,
          emergencyMessage,
        } = data;

        if (!sessionId || latitude == null || longitude == null) {
          socket.emit("location:error", { error: "Missing required fields" });
          return;
        }

        // Store socket-session mapping
        activeConnections.set(socket.id, sessionId);
        socket.join(`location:${sessionId}`);

        const locationPoint = {
          latitude,
          longitude,
          accuracy,
          altitude,
          speed,
          heading,
          timestamp: new Date(),
        };

        // Create or update location in database
        let location = await Location.findOne({ sessionId });
        if (location) {
          await location.addLocationPoint(locationPoint);
        } else {
          location = await Location.create({
            sessionId,
            userName,
            contactNumber,
            currentLocation: locationPoint,
            locationHistory: [locationPoint],
            isEmergency: isEmergency || false,
            emergencyType,
            emergencyMessage,
            isSharing: true,
            isOnline: true,
          });
        }

        socket.emit("location:started", { sessionId, location });

        // Broadcast to watchers
        io.to(`location:${sessionId}`).emit("location:update", {
          sessionId,
          location: locationPoint,
          isEmergency: location.isEmergency,
          isOnline: true,
        });

        // Broadcast emergency to emergency watchers
        if (isEmergency) {
          io.to("emergencies").emit("emergency:new", {
            sessionId,
            location: locationPoint,
            emergencyType,
            emergencyMessage,
            userName,
            contactNumber,
          });
        }
      } catch (error) {
        console.error("Socket location:start error:", error);
        socket.emit("location:error", { error: "Failed to start sharing" });
      }
    });

    /**
     * Update location (real-time streaming)
     */
    socket.on("location:update", async (data) => {
      try {
        const { sessionId, latitude, longitude, accuracy, altitude, speed, heading } = data;

        if (!sessionId || latitude == null || longitude == null) {
          socket.emit("location:error", { error: "Missing required fields" });
          return;
        }

        const location = await Location.findOne({ sessionId, isSharing: true });
        if (!location) {
          socket.emit("location:error", { error: "Session not found" });
          return;
        }

        const locationPoint = {
          latitude,
          longitude,
          accuracy,
          altitude,
          speed,
          heading,
          timestamp: new Date(),
        };

        await location.addLocationPoint(locationPoint);

        // Broadcast to all watchers of this session
        io.to(`location:${sessionId}`).emit("location:update", {
          sessionId,
          location: locationPoint,
          isEmergency: location.isEmergency,
          isOnline: true,
        });
      } catch (error) {
        console.error("Socket location:update error:", error);
        socket.emit("location:error", { error: "Failed to update location" });
      }
    });

    /**
     * Activate emergency mode
     */
    socket.on("location:emergency", async (data) => {
      try {
        const { sessionId, emergencyType, emergencyMessage } = data;

        const location = await Location.findOneAndUpdate(
          { sessionId },
          {
            isEmergency: true,
            emergencyType: emergencyType || "other",
            emergencyMessage,
          },
          { new: true }
        );

        if (!location) {
          socket.emit("location:error", { error: "Session not found" });
          return;
        }

        // Notify watchers of this session
        io.to(`location:${sessionId}`).emit("location:emergency", {
          sessionId,
          emergencyType,
          emergencyMessage,
          location: location.currentLocation,
        });

        // Broadcast to emergency room
        io.to("emergencies").emit("emergency:new", {
          sessionId,
          location: location.currentLocation,
          emergencyType,
          emergencyMessage,
          userName: location.userName,
          contactNumber: location.contactNumber,
        });

        socket.emit("location:emergency:confirmed", { sessionId });
      } catch (error) {
        console.error("Socket location:emergency error:", error);
        socket.emit("location:error", { error: "Failed to activate emergency" });
      }
    });

    /**
     * Mark as safe (deactivate emergency)
     */
    socket.on("location:safe", async (data) => {
      try {
        const { sessionId } = data;

        const location = await Location.findOneAndUpdate(
          { sessionId },
          { isEmergency: false },
          { new: true }
        );

        if (location) {
          io.to(`location:${sessionId}`).emit("location:safe", { sessionId });
          io.to("emergencies").emit("emergency:resolved", { sessionId });
        }
      } catch (error) {
        console.error("Socket location:safe error:", error);
      }
    });

    /**
     * Stop sharing location
     */
    socket.on("location:stop", async (data) => {
      try {
        const { sessionId } = data;

        const location = await Location.findOneAndUpdate(
          { sessionId },
          { isSharing: false, isOnline: false },
          { new: true }
        );

        if (location) {
          // Notify watchers with last known location
          io.to(`location:${sessionId}`).emit("location:stopped", {
            sessionId,
            lastLocation: location.currentLocation,
            message: "User stopped sharing location",
          });
        }

        activeConnections.delete(socket.id);
        socket.leave(`location:${sessionId}`);
      } catch (error) {
        console.error("Socket location:stop error:", error);
      }
    });

    /**
     * Handle disconnect - mark user as offline but keep last location
     */
    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);

      const sessionId = activeConnections.get(socket.id);
      if (sessionId) {
        try {
          const location = await Location.findOneAndUpdate(
            { sessionId },
            { isOnline: false },
            { new: true }
          );

          if (location) {
            // Notify watchers that user went offline
            io.to(`location:${sessionId}`).emit("location:offline", {
              sessionId,
              lastLocation: location.currentLocation,
              lastSignalAt: location.lastSignalAt,
              message: "Signal lost - showing last known location",
            });
          }
        } catch (error) {
          console.error("Error handling disconnect:", error);
        }

        activeConnections.delete(socket.id);
      }
    });
  });

  return io;
}
