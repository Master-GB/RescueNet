import request from "supertest";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { mockHelpers } from "./testMocks.js";

let server;

export async function startTestServer() {
  try {
    // Set dummy env variables for Cloudinary to suppress warnings
    process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "test_cloud";
    process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "test_key";
    process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "test_secret";

    // Clear all mock data before starting server
    mockHelpers.clearAllData();
    
    // Create a minimal Express app for testing
    const app = express();
    
    // Basic middleware
    app.use(cookieParser());
    app.use(express.json({ limit: "25mb" }));
    app.use(cors({
      origin: "http://localhost:5173",
      credentials: true,
    }));

    // Health check endpoint
    app.get("/api/health", (req, res) => {
      res.status(200).json({ success: true, message: "Test server is running" });
    });

    // Import and use all routes
    try {
      // Auth routes
      const authRoutes = await import("../../../routes/authRoutes.js");
      app.use("/api/auth", authRoutes.default);

      // Missing person routes
      const missingPersonRoutes = await import("../../../routes/missingPersonRoutes.js");
      app.use("/api/missing-persons", missingPersonRoutes.default);

      // Campaign routes
      const campaignRoutes = await import("../../../routes/campaignRoutes.js");
      app.use("/api/campaigns", campaignRoutes.default);

      // Donation routes
      const donationRoutes = await import("../../../routes/donationRoutes.js");
      app.use("/api/donations", donationRoutes.default);

      // Shelter routes
      const shelterRoutes = await import("../../../routes/shelterRoutes.js");
      app.use("/api/shelters", shelterRoutes.default);

      // Help request routes
      const helpRoutes = await import("../../../routes/helpRoutes.js");
      app.use("/api/help", helpRoutes.default);

      // Geo routes
      const geoRoutes = await import("../../../routes/geoRoutes.js");
      app.use("/api/geo", geoRoutes.default);

      // Disaster routes
      const disasterRoutes = await import("../../../routes/disastersRoutes.js");
      app.use("/api/disasters", disasterRoutes.default);

      console.log("✅ All routes loaded successfully");
    } catch (error) {
      console.error('Failed to load routes:', error);
      throw error;
    }

    // Start server
    server = app.listen(0, () => {
      const port = server.address().port;
      console.log(`Test server started on port ${port}`);
    });

    // Wait for server to start
    await new Promise((resolve) => {
      server.once('listening', resolve);
    });

    const port = server.address().port;
    const agent = request.agent(`http://localhost:${port}`);
    return { agent, server, port };
  } catch (error) {
    console.error('Failed to start test server:', error);
    throw error;
  }
}

export async function stopTestServer(server) {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
}

export function clearDatabase() {
  // Clear mock data instead of database
  mockHelpers.clearAllData();
  console.log("🧹data cleared");
}
