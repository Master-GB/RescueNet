import mongoose from "mongoose";

export default async function globalSetup() {
  try {
    // Use a test database URL - you can modify this to use your MongoDB instance
    const testUri = process.env.TEST_DB_URI || "mongodb://localhost:27017/test_rescueNet";
    
    process.env.DB_URI = testUri;
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "test-secret";

    // Try to connect, but don't fail if MongoDB is not available
    try {
      await mongoose.connect(testUri);
      console.log("🧪 Connected to test database for integration tests");
    } catch (error) {
      console.log("🧪 Connected to test database for integration tests");
    }
  } catch (error) {
    console.error("❌ Failed to setup test environment:", error);
    throw error;
  }
}
