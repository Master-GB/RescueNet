import express from "express";
import { createServer } from "http";
import { Server } from "socket.io"; 
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose"; 

// Import routes
// import authRoutes from "./routes/authRoutes.js"; 

dotenv.config();
const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;

// --- DB URI Checks ---
if (!process.env.DB_URI) {
    console.error("DB_URI is not defined in the environment variables.");
    process.exit(1);
}

// just in case the user forgets to set the DB_URI
if (process.env.DB_URI == "mongodb+srv://<your_connection_string>"){
    console.error("🚨 Your mongodb URL is a blank placeholder, please change it now 🚨🤣");
    process.exit(1);
}

const DB_URI = process.env.DB_URI;

// Client origin (frontend) - make configurable via .env
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// --- Middleware ---
app.use(cors({
    origin: CLIENT_URL,
    credentials: true
}));

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
mongoose
  .connect(DB_URI)
  .then(() => {
      console.log("DB Connected");
      // Only start the server if the database connects successfully
      httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log(err.message));