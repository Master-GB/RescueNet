import "./config/env.js";
import express from "express";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";
import { registerShelterSocket } from "./sockets/shelter.socket.js";
import { registerVolunteerSocket } from "./sockets/volunteer.socket.js";

// Routes
import adminHelpRoutes from "./routes/adminHelpRoutes.js";
import adminNgoRoutes from "./routes/adminNgoRoutes.js";
import helpRoutes from "./routes/helpRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import ngoHelpRoutes from "./routes/ngoHelpRoutes.js";
import areaSituationRoutes from "./routes/areaSituationRoutes.js";

import authRoutes from "./routes/authRoutes.js";
import citizenProfileRoutes from "./routes/userManagementRoutes/citizenProfileRoutes.js";
import volunteerProfileRoutes from "./routes/userManagementRoutes/volunteerProfileRoutes.js";
import ngoProfileRoutes from "./routes/userManagementRoutes/ngoProfileRoutes.js";
import adminUserRoutes from "./routes/userManagementRoutes/adminUserRoutes.js";
import shelterRouter from "./routes/shelterRoutes.js";
import geoRoutes from "./routes/geoRoutes.js";
import disastersRoutes from "./routes/disastersRoutes.js";

import missingPersonRoutes from "./routes/missingPersonRoutes.js";
import socketRoutes from "./routes/socketRoutes.js";
import socketService from './services/socketService.js';
import campaignRoutes from "./routes/campaignRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "test") {
    process.env.JWT_SECRET = "test-secret";
  } else {
    console.error("FATAL ERROR: JWT_SECRET is not defined");
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cookieParser());
app.use(express.json({ limit: "25mb" }));

const server = http.createServer(app);

// ✅ Socket.IO attached to server
const io = new Server(server, {
  cors: {
    origin: [ CLIENT_URL],
    credentials: true,
  },
});

registerShelterSocket(io);
registerVolunteerSocket(io);
socketService.initialize(io);

// ✅ make io available in controllers
app.use("/api/shelters", (req, res, next) => {
  req.io = io;
  next();
}, shelterRouter);


// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173", CLIENT_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Routes 
app.use("/api/auth", authRoutes);
app.use("/api/citizen", citizenProfileRoutes);
app.use("/api/volunteer", volunteerProfileRoutes);
app.use("/api/ngo", ngoProfileRoutes);
app.use("/api/adminUser", adminUserRoutes);

app.use("/api/shelters", shelterRouter);
app.use("/api/geo", geoRoutes);
app.use("/api/disasters", disastersRoutes);
app.use("/api/area", areaSituationRoutes);

app.use("/api/help", helpRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/admin/help-requests", adminHelpRoutes);
app.use("/api/admin/ngos", adminNgoRoutes);
app.use("/api/ngo/help-requests", ngoHelpRoutes);

app.use("/api/missing-persons", missingPersonRoutes);
app.use("/api/socket", socketRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/donations", donationRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

// Start
if (process.env.NODE_ENV !== "test") {
  connectDB()
    .then(() => {
      server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error(err?.message ?? err);
      process.exit(1);
    });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "An unexpected error occurred",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;
