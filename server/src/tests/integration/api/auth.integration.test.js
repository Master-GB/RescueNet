import { jest } from "@jest/globals";
import { startTestServer, stopTestServer, clearDatabase } from "../setup/testEnv.js";
import { resetAllMocks } from "../setup/mocks.js";
import User from "../../models/user.js";

describe("Auth API Integration", () => {
  let agent, server;

  beforeAll(async () => {
    ({ agent, server } = await startTestServer());
  });

  afterAll(async () => {
    await stopTestServer(server);
  });

  beforeEach(async () => {
    await clearDatabase();
    resetAllMocks();
  });

  it("should register a new user", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "CITIZEN"
    };

    const response = await agent
      .post("/api/auth/register")
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe(userData.email);
    expect(response.body.user.role).toBe(userData.role);
  });

  it("should not register user with existing email", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "CITIZEN"
    };

    // First registration
    await agent.post("/api/auth/register").send(userData);

    // Second registration with same email
    const response = await agent
      .post("/api/auth/register")
      .send(userData);

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.isUserExists).toBe(true);
  });

  it("should login with valid credentials", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "CITIZEN"
    };

    // Register user
    await agent.post("/api/auth/register").send(userData);

    // Mark user as verified (bypass email verification for testing)
    await User.findOneAndUpdate(
      { email: userData.email },
      { isAccountVerified: true }
    );

    // Login
    const loginResponse = await agent
      .post("/api/auth/login")
      .send({
        email: userData.email,
        password: userData.password
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.user.email).toBe(userData.email);
    expect(loginResponse.body.token).toBeDefined();
  });

  it("should not login with invalid credentials", async () => {
    const response = await agent
      .post("/api/auth/login")
      .send({
        email: "nonexistent@example.com",
        password: "wrongpassword"
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should get current user profile", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "CITIZEN"
    };

    // Register and verify user
    await agent.post("/api/auth/register").send(userData);
    await User.findOneAndUpdate(
      { email: userData.email },
      { isAccountVerified: true }
    );

    // Login
    const loginResponse = await agent
      .post("/api/auth/login")
      .send({
        email: userData.email,
        password: userData.password
      });

    // Get current user
    const meResponse = await agent
      .get("/api/auth/me")
      .set("Cookie", loginResponse.headers["set-cookie"]);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.email).toBe(userData.email);
    expect(meResponse.body.role).toBe(userData.role);
  });

  it("should logout successfully", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "CITIZEN"
    };

    // Register and verify user
    await agent.post("/api/auth/register").send(userData);
    await User.findOneAndUpdate(
      { email: userData.email },
      { isAccountVerified: true }
    );

    // Login
    await agent
      .post("/api/auth/login")
      .send({
        email: userData.email,
        password: userData.password
      });

    // Logout
    const logoutResponse = await agent.post("/api/auth/logout");

    expect(logoutResponse.status).toBe(200);
  });
});
