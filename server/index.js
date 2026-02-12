import express from "express";
import { createServer } from "http";
import { Server } from "socket.io"; 
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

// add middleware to parse cookies and JSON bodies
app.use(cookieParser());
app.use(express.json());

// --- Routes ---
// app.use("/api/auth", authRoutes); 

// Temporary test route so you can verify the server is up
app.get("/", (req, res) => {
    res.send("RescueNet API is running!");
});

// --- Socket.IO Setup ---
const io = new Server(httpServer, {
    cors: {
        origin: CLIENT_URL,
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("A user connected to RescueNet:", socket.id);
    
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

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