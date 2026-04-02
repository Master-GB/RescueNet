import mongoose from "mongoose";

export default async function globalTeardown() {
  try {
    await mongoose.disconnect();
    console.log("🧪 Test database disconnected");
  } catch (error) {
    console.log("⚠️ Error disconnecting from database:", error.message);
  }
}
