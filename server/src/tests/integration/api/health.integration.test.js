import { jest } from "@jest/globals";
import { startTestServer, stopTestServer, clearDatabase } from "../setup/testEnv.js";

describe("Health API Integration", () => {
  let agent, server;

  beforeAll(async () => {
    ({ agent, server } = await startTestServer());
  });

  afterAll(async () => {
    await stopTestServer(server);
  });

  it("should return 200 and server health status", async () => {
    const response = await agent.get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: "Test server is running"
    });
  });
});
