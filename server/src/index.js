import express from "express";
import { createServer } from "http";
import { setupSocketIO } from "./lib/socket.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";

// Import routes
import missingPersonRoutes from "./routes/missingPersonRoutes.js";
// import authRoutes from "./routes/authRoutes.js"; 

dotenv.config();
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Client origin (frontend) - make configurable via .env
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// --- allow CORS for the frontend ---
app.use(cors({
    origin: CLIENT_URL,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use("/api/missing-persons", missingPersonRoutes);
// app.use("/api/auth", authRoutes); 

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// --- Error Handling ---
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


// Start socketio, commented it out since we dont use socketIO yet
// setupSocketIO(httpServer, CLIENT_URL);

// --- Database Connection & Server Start ---
connectDB()
    .then(() => {
        // Only start the server if the database connects successfully
        httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error(err?.message ?? err);
        process.exit(1);
    });

process.on("unhandledRejection", (err) => {
    console.error("Unhandled Promise Rejection:", err);
    httpServer.close(() => process.exit(1));
});

export default app;