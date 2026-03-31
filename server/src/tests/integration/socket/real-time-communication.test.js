import { jest } from "@jest/globals";
import { startTestServer, stopTestServer, clearDatabase } from "../setup/testEnv.js";
import { resetAllMocks } from "../setup/mocks.js";
import { Server } from "socket.io";
import { io as ClientIO } from "socket.io-client";
import User from "../../models/user.js";

describe("Real-time Communication Integration", () => {
  let server, ioServer, clientSocket, agent, authCookie;

  beforeAll(async () => {
    // Start test server
    ({ agent, server } = await startTestServer());
    
    // Create Socket.IO server for testing
    ioServer = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Setup socket event handlers
    ioServer.on("connection", (socket) => {
      socket.on("location:start", (data) => {
        socket.emit("location:started", {
          sessionId: data.sessionId,
          location: data,
          timestamp: new Date()
        });
      });

      socket.on("location:update", (data) => {
        socket.broadcast.emit("location:updated", {
          sessionId: data.sessionId,
          location: data,
          timestamp: new Date()
        });
      });

      socket.on("emergency:alert", (data) => {
        socket.broadcast.emit("emergency:broadcast", {
          ...data,
          timestamp: new Date()
        });
      });

      socket.on("disconnect", () => {
        // Handle disconnection
      });
    });

    // Create authenticated user for socket tests
    const userData = {
      name: "Test User",
      email: "socket@example.com",
      password: "password123",
      role: "CITIZEN"
    };

    await agent.post("/api/auth/register").send(userData);
    await User.findOneAndUpdate(
      { email: userData.email },
      { isAccountVerified: true }
    );

    const loginResponse = await agent
      .post("/api/auth/login")
      .send({
        email: userData.email,
        password: userData.password
      });

    authCookie = loginResponse.headers["set-cookie"];
  });

  afterAll(async () => {
    if (clientSocket) {
      clientSocket.disconnect();
    }
    if (ioServer) {
      ioServer.close();
    }
    await stopTestServer(server);
  });

  beforeEach(async () => {
    await clearDatabase();
    resetAllMocks();
  });

  afterEach(async () => {
    if (clientSocket) {
      clientSocket.disconnect();
    }
  });

  it("should establish socket connection", (done) => {
    clientSocket = ClientIO(`http://localhost:${server.address().port}`, {
      auth: {
        token: authCookie
      }
    });

    clientSocket.on("connect", () => {
      expect(clientSocket.connected).toBe(true);
      done();
    });

    clientSocket.on("connect_error", (error) => {
      done(error);
    });
  });

  it("should handle location sharing start event", (done) => {
    clientSocket = ClientIO(`http://localhost:${server.address().port}`);

    clientSocket.on("connect", () => {
      const locationData = {
        sessionId: "test-session-123",
        latitude: 6.9271,
        longitude: 79.8612,
        accuracy: 10,
        userName: "Test User",
        contactNumber: "+94123456789",
        isEmergency: true,
        emergencyType: "flood",
        emergencyMessage: "Need immediate help!"
      };

      clientSocket.emit("location:start", locationData);
    });

    clientSocket.on("location:started", (data) => {
      expect(data.sessionId).toBe("test-session-123");
      expect(data.location.latitude).toBe(6.9271);
      expect(data.location.longitude).toBe(79.8612);
      expect(data.timestamp).toBeDefined();
      done();
    });

    clientSocket.on("connect_error", (error) => {
      done(error);
    });
  });

  it("should handle location update events", (done) => {
    let secondClient;

    clientSocket = ClientIO(`http://localhost:${server.address().port}`);

    clientSocket.on("connect", () => {
      // Start location sharing
      const locationData = {
        sessionId: "test-session-456",
        latitude: 6.9271,
        longitude: 79.8612,
        userName: "Test User"
      };

      clientSocket.emit("location:start", locationData);

      // Create second client to receive broadcasts
      secondClient = ClientIO(`http://localhost:${server.address().port}`);

      secondClient.on("connect", () => {
        // Update location from first client
        const updateData = {
          sessionId: "test-session-456",
          latitude: 6.9272,
          longitude: 79.8613,
          accuracy: 8
        };

        clientSocket.emit("location:update", updateData);
      });

      secondClient.on("location:updated", (data) => {
        expect(data.sessionId).toBe("test-session-456");
        expect(data.location.latitude).toBe(6.9272);
        expect(data.location.longitude).toBe(79.8613);
        expect(data.timestamp).toBeDefined();
        
        secondClient.disconnect();
        done();
      });
    });

    clientSocket.on("connect_error", (error) => {
      done(error);
    });

    secondClient = ClientIO(`http://localhost:${server.address().port}`);
  });

  it("should handle emergency alert broadcasting", (done) => {
    let secondClient;

    clientSocket = ClientIO(`http://localhost:${server.address().port}`);

    clientSocket.on("connect", () => {
      // Create second client to receive broadcasts
      secondClient = ClientIO(`http://localhost:${server.address().port}`);

      secondClient.on("connect", () => {
        // Send emergency alert from first client
        const alertData = {
          type: "flood",
          severity: "high",
          location: {
            latitude: 6.9271,
            longitude: 79.8612
          },
          message: "Flash flood warning in Colombo area",
          affectedRadius: 5 // km
        };

        clientSocket.emit("emergency:alert", alertData);
      });

      secondClient.on("emergency:broadcast", (data) => {
        expect(data.type).toBe("flood");
        expect(data.severity).toBe("high");
        expect(data.location.latitude).toBe(6.9271);
        expect(data.message).toContain("flash flood");
        expect(data.timestamp).toBeDefined();
        
        secondClient.disconnect();
        done();
      });
    });

    clientSocket.on("connect_error", (error) => {
      done(error);
    });

    secondClient = ClientIO(`http://localhost:${server.address().port}`);
  });

  it("should handle multiple concurrent connections", (done) => {
    const clients = [];
    const connectedCount = 3;
    let connectedClients = 0;

    for (let i = 0; i < connectedCount; i++) {
      const client = ClientIO(`http://localhost:${server.address().port}`);
      clients.push(client);

      client.on("connect", () => {
        connectedClients++;
        if (connectedClients === connectedCount) {
          // All clients connected
          expect(connectedClients).toBe(connectedCount);
          
          // Disconnect all clients
          clients.forEach(c => c.disconnect());
          done();
        }
      });

      client.on("connect_error", (error) => {
        clients.forEach(c => c.disconnect());
        done(error);
      });
    }
  });

  it("should handle disconnection gracefully", (done) => {
    clientSocket = ClientIO(`http://localhost:${server.address().port}`);

    clientSocket.on("connect", () => {
      expect(clientSocket.connected).toBe(true);
      
      // Disconnect the client
      clientSocket.disconnect();
      
      // Verify client is disconnected
      setTimeout(() => {
        expect(clientSocket.connected).toBe(false);
        done();
      }, 100);
    });

    clientSocket.on("connect_error", (error) => {
      done(error);
    });
  });

  it("should handle invalid socket events gracefully", (done) => {
    clientSocket = ClientIO(`http://localhost:${server.address().port}`);

    clientSocket.on("connect", () => {
      // Send invalid event data
      clientSocket.emit("invalid:event", { invalid: "data" });
      
      // Server should handle gracefully without crashing
      setTimeout(() => {
        expect(clientSocket.connected).toBe(true);
        done();
      }, 100);
    });

    clientSocket.on("connect_error", (error) => {
      done(error);
    });
  });

  it("should handle emergency location sharing workflow", (done) => {
    let secondClient;

    clientSocket = ClientIO(`http://localhost:${server.address().port}`);

    clientSocket.on("connect", () => {
      // Create second client (responder)
      secondClient = ClientIO(`http://localhost:${server.address().port}`);

      secondClient.on("connect", () => {
        // Start emergency location sharing
        const emergencyLocation = {
          sessionId: "emergency-session-789",
          latitude: 6.9271,
          longitude: 79.8612,
          accuracy: 5,
          userName: "Emergency User",
          contactNumber: "+94123456789",
          isEmergency: true,
          emergencyType: "flood",
          emergencyMessage: "Trapped in flood waters!"
        };

        clientSocket.emit("location:start", emergencyLocation);
      });

      secondClient.on("location:started", (data) => {
        expect(data.sessionId).toBe("emergency-session-789");
        expect(data.location.isEmergency).toBe(true);
        expect(data.location.emergencyType).toBe("flood");
        
        // Update emergency location
        const updateData = {
          sessionId: "emergency-session-789",
          latitude: 6.9272,
          longitude: 79.8613,
          isEmergency: true,
          emergencyMessage: "Moving to higher ground!"
        };

        clientSocket.emit("location:update", updateData);
      });

      secondClient.on("location:updated", (data) => {
        expect(data.sessionId).toBe("emergency-session-789");
        expect(data.location.isEmergency).toBe(true);
        expect(data.location.emergencyMessage).toContain("higher ground");
        
        secondClient.disconnect();
        done();
      });
    });

    clientSocket.on("connect_error", (error) => {
      done(error);
    });

    secondClient = ClientIO(`http://localhost:${server.address().port}`);
  });
});
