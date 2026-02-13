import express from "express";
import { createServer } from "http";
import { setupSocketIO } from "./lib/socket.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import helpRoutes from "./routes/HelpRoutes.js";
import weatherRoutes from "./routes/WeatherRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";

// Import routes
// import authRoutes from "./routes/authRoutes.js"; 

// Load env from multiple locations: root and src
dotenv.config({ path: [".env.local", ".env", "./src/.env"] });
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
// Increase JSON body limit to allow base64 media payloads
app.use(express.json({ limit: "25mb" }));

// --- Routes ---
// app.use("/api/auth", authRoutes); 


// Start socketio for real-time location tracking
setupSocketIO(httpServer, CLIENT_URL);

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

// --- API Routes ---
app.use("/api/help", helpRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/location", locationRoutes);