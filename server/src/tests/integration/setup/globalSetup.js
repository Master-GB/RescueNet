import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongod;

export default async function globalSetup() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.DB_URI = uri;
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-secret";

  await mongoose.connect(uri);
  console.log("🧪 In-memory MongoDB started for integration tests");
}
