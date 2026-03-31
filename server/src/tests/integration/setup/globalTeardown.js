import mongoose from "mongoose";

let mongod;

export default async function globalTeardown() {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
  console.log("🧪 In-memory MongoDB stopped");
}

export function setMongodInstance(instance) {
  mongod = instance;
}
