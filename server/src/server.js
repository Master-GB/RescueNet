import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

// Import routes
import missingPersonRoutes from "./routes/missingPersonRoutes.js";
import socketRoutes from "./routes/socketRoutes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Client origin (frontend)
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// --- Socket.IO Setup ---
const io = new Server(httpServer, {
    cors: {
        origin: "*",  // Allow all origins for testing
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
        allowedHeaders: ["*"]
    }
});

// Make io accessible to routes
app.set('io', io);

// Initialize Socket.IO service
import socketService from './services/socketService.js';
socketService.initialize(io);

// --- Middleware ---
app.use(cors({
    origin: CLIENT_URL,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use("/api/missing-persons", missingPersonRoutes);
app.use("/api/socket", socketRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    socketConnections: io.engine.clientsCount
  });
});

// --- Socket.IO Connection Handler ---
io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);
    
    // Send connection success message
    socket.emit("connected", {
        message: "Connected to RescueNet real-time service",
        socketId: socket.id
    });

    // INCOMING: User requests all missing persons
    socket.on("requestMissingPersons", () => {
        console.log(`📡 User ${socket.id} requested missing persons list`);
        socket.emit("requestReceived", { message: "Fetching missing persons..." });
    });

    // INCOMING: User adds a sighting
    socket.on("addSighting", (data) => {
        console.log(`👁️ New sighting reported by ${socket.id}:`, data);
        // This will be handled by the service layer
        socket.emit("sightingReceived", { message: "Sighting received" });
    });

    // INCOMING: User updates report status
    socket.on("updateStatus", (data) => {
        console.log(`🔄 Status update from ${socket.id}:`, data);
        socket.emit("statusUpdateReceived", { message: "Status update received" });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
    });
});

// --- Error Handling Middleware ---
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

// --- Database Connection & Server Start ---
connectDB()
    .then(() => {
        httpServer.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════╗
║   Server running on port ${PORT}        ║
║   Environment: ${process.env.NODE_ENV || 'development'}           ║
║   Database: Connected ✓                ║
║   Socket.IO: Active ✓                  ║
╚════════════════════════════════════════╝
            `);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to database:", err?.message ?? err);
        process.exit(1);
    });

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Promise Rejection:", err);
    httpServer.close(() => process.exit(1));
});

export default app;
export { io }; // Export io for use in other files