import { Server } from "socket.io";

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

  // Basic connection logging so you can confirm sockets are working.
  io.on("connection", (socket) => {
    console.log("A user connected to RescueNet:", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}
