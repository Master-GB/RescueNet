import mongoose from "mongoose";

export async function connectDB(dbUri = process.env.DB_URI) {
  if (!dbUri) {
    throw new Error("DB_URI is not defined in the environment variables.");
  }

  // just in case the user forgets to set the DB_URI
  if (dbUri === "mongodb+srv://<your_connection_string>") {
    throw new Error(
      "Your mongodb URL is a blank placeholder, please change it now",
    );
  }

  try {
    await mongoose.connect(dbUri);
    console.log("DB Connected");
  } catch (err) {
    const msg = err?.message ?? String(err);
    throw new Error(`Failed to connect to MongoDB: ${msg}`, { cause: err });
  }
}
