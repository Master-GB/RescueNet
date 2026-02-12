import express from "express";
import { createServer } from "http";
import { setupSocketIO } from "./lib/socket.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";

// Import routes
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

// --- Routes ---
// app.use("/api/auth", authRoutes); 


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