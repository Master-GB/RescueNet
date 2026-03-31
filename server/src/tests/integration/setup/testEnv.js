import request from "supertest";
import { connectDB } from "../../../config/db.js";
import app from "../../../server.js";
import { setMongodInstance } from "./globalTeardown.js";

let server;

export async function startTestServer() {
  // Ensure DB is connected (globalSetup already connected)
  await connectDB();

  // Start Express server on a random port
  server = app.listen(0);
  const port = server.address().port;
  const agent = request.agent(`http://localhost:${port}`);
  return { agent, server, port };
}

export async function stopTestServer(server) {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
}

export async function clearDatabase() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

// Optional: expose in-memory server instance for teardown
export function setGlobalMongod(instance) {
  setMongodInstance(instance);
}
