import { jest } from "@jest/globals";
import { startTestServer, stopTestServer, clearDatabase } from "../setup/testEnv.js";
import { resetAllMocks, mockSendEmail } from "../setup/mocks.js";
import User from "../../models/user.js";

describe("User Registration Workflow Integration", () => {
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

  describe("Citizen Registration Workflow", () => {
    it("should complete full citizen registration and verification workflow", async () => {
      // Step 1: User registers as citizen
      const citizenData = {
        name: "John Citizen",
        email: "john.citizen@example.com",
        password: "SecurePass123!",
        role: "CITIZEN"
      };

      const registerResponse = await agent
        .post("/api/auth/register")
        .send(citizenData);

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.user.email).toBe(citizenData.email);
      expect(registerResponse.body.user.role).toBe("CITIZEN");
      expect(registerResponse.body.user.isAccountVerified).toBe(false);

      // Step 2: User tries to login without verification (should fail)
      const loginBeforeVerificationResponse = await agent
        .post("/api/auth/login")
        .send({
          email: citizenData.email,
          password: citizenData.password
        });

      expect(loginBeforeVerificationResponse.status).toBe(400);
      expect(loginBeforeVerificationResponse.body.success).toBe(false);
      expect(loginBeforeVerificationResponse.body.message).toContain("not verified");

      // Step 3: User sends verification OTP
      const sendOtpResponse = await agent
        .post("/api/auth/send-otp")
        .set("Cookie", registerResponse.headers["set-cookie"])
        .send({ email: citizenData.email });

      expect(sendOtpResponse.status).toBe(200);
      expect(sendOtpResponse.body.success).toBe(true);

      // Step 4: User verifies account with OTP (simulate OTP)
      // Get the user from database to extract the OTP
      const user = await User.findOne({ email: citizenData.email });
      const otp = user.verifyOtp;

      const verifyResponse = await agent
        .post("/api/auth/verify-account")
        .set("Cookie", registerResponse.headers["set-cookie"])
        .send({ otp });

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.success).toBe(true);
      expect(verifyResponse.body.message).toContain("verified");

      // Step 5: User logs in successfully after verification
      const loginAfterVerificationResponse = await agent
        .post("/api/auth/login")
        .send({
          email: citizenData.email,
          password: citizenData.password
        });

      expect(loginAfterVerificationResponse.status).toBe(200);
      expect(loginAfterVerificationResponse.body.success).toBe(true);
      expect(loginAfterVerificationResponse.body.user.email).toBe(citizenData.email);
      expect(loginAfterVerificationResponse.body.token).toBeDefined();

      // Step 6: User accesses protected route (/me)
      const meResponse = await agent
        .get("/api/auth/me")
        .set("Cookie", loginAfterVerificationResponse.headers["set-cookie"]);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body.email).toBe(citizenData.email);
      expect(meResponse.body.role).toBe("CITIZEN");

      // Step 7: User logs out
      const logoutResponse = await agent
        .post("/api/auth/logout")
        .set("Cookie", loginAfterVerificationResponse.headers["set-cookie"]);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.success).toBe(true);
    });

    it("should handle citizen registration with profile creation", async () => {
      // Register citizen
      const citizenData = {
        name: "Jane Citizen",
        email: "jane.citizen@example.com",
        password: "SecurePass123!",
        role: "CITIZEN"
      };

      const registerResponse = await agent
        .post("/api/auth/register")
        .send(citizenData);

      expect(registerResponse.status).toBe(201);

      // Verify account
      const user = await User.findOne({ email: citizenData.email });
      await User.findByIdAndUpdate(user._id, { isAccountVerified: true });

      // Login
      const loginResponse = await agent
        .post("/api/auth/login")
        .send({
          email: citizenData.email,
          password: citizenData.password
        });

      // Create citizen profile
      const profileData = {
        firstName: "Jane",
        lastName: "Citizen",
        dateOfBirth: "1990-01-01",
        gender: "Female",
        address: {
          street: "123 Main St",
          city: "Colombo",
          province: "Western",
      postalCode: "00100"
        },
        contactInfo: {
          phone: "+94123456789",
          alternatePhone: "+94123456790",
          email: citizenData.email
        },
        emergencyContact: {
          name: "John Citizen",
          relationship: "Spouse",
          phone: "+94123456791"
        },
        skills: ["First Aid", "Cooking"],
        availability: "Weekends",
        preferences: {
          preferredDisasterTypes: ["FLOOD", "LANDSLIDE"],
          maxTravelDistance: 50
        }
      };

      const profileResponse = await agent
        .post("/api/citizen/create-profile")
        .set("Cookie", loginResponse.headers["set-cookie"])
        .send(profileData);

      expect(profileResponse.status).toBe(201);
      expect(profileResponse.body.success).toBe(true);
      expect(profileResponse.body.profile.firstName).toBe(profileData.firstName);
      expect(profileResponse.body.profile.lastName).toBe(profileData.lastName);

      // Get profile
      const getProfileResponse = await agent
        .get("/api/citizen/get-profile")
        .set("Cookie", loginResponse.headers["set-cookie"]);

      expect(getProfileResponse.status).toBe(200);
      expect(getProfileResponse.body.profile.firstName).toBe(profileData.firstName);
    });
  });

  describe("Volunteer Registration Workflow", () => {
    it("should complete full volunteer registration and verification workflow", async () => {
      // Step 1: User registers as volunteer
      const volunteerData = {
        name: "Sam Volunteer",
        email: "sam.volunteer@example.com",
        password: "SecurePass123!",
        role: "VOLUNTEER"
      };

      const registerResponse = await agent
        .post("/api/auth/register")
        .send(volunteerData);

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.user.role).toBe("VOLUNTEER");

      // Step 2: Verify account
      const user = await User.findOne({ email: volunteerData.email });
      await User.findByIdAndUpdate(user._id, { isAccountVerified: true });

      // Step 3: Login
      const loginResponse = await agent
        .post("/api/auth/login")
        .send({
          email: volunteerData.email,
          password: volunteerData.password
        });

      expect(loginResponse.status).toBe(200);

      // Step 4: Create volunteer profile
      const profileData = {
        firstName: "Sam",
        lastName: "Volunteer",
        dateOfBirth: "1985-05-15",
        gender: "Male",
        address: {
          street: "456 Volunteer Ave",
          city: "Kandy",
          province: "Central",
          postalCode: "20000"
        },
        contactInfo: {
          phone: "+94123456792",
          alternatePhone: "+94123456793",
          email: volunteerData.email
        },
        emergencyContact: {
          name: "Sarah Volunteer",
          relationship: "Spouse",
          phone: "+94123456794"
        },
        skills: ["Medical Assistance", "Search and Rescue", "Communication"],
        availability: "Full Time",
        experience: "5 years in disaster response",
        certifications: ["First Aid", "CPR", "Emergency Response"],
        preferences: {
          preferredDisasterTypes: ["FLOOD", "LANDSLIDE", "CYCLONE"],
          maxTravelDistance: 100,
          physicalLimitations: "None"
        }
      };

      const profileResponse = await agent
        .post("/api/volunteer/create-profile")
        .set("Cookie", loginResponse.headers["set-cookie"])
        .send(profileData);

      expect(profileResponse.status).toBe(201);
      expect(profileResponse.body.success).toBe(true);
      expect(profileResponse.body.profile.skills).toContain("Medical Assistance");

      // Step 5: Admin verifies volunteer
      const adminData = {
        name: "Admin User",
        email: "admin@example.com",
        password: "SecurePass123!",
        role: "ADMIN"
      };

      await agent.post("/api/auth/register").send(adminData);
      const adminUser = await User.findOne({ email: adminData.email });
      await User.findByIdAndUpdate(adminUser._id, { isAccountVerified: true });

      const adminLoginResponse = await agent
        .post("/api/auth/login")
        .send({
          email: adminData.email,
          password: adminData.password
        });

      const verifyResponse = await agent
        .patch(`/api/adminUser/verify-volunteer/${user._id}`)
        .set("Cookie", adminLoginResponse.headers["set-cookie"]);

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.success).toBe(true);

      // Step 6: Check volunteer status
      const updatedVolunteer = await User.findById(user._id);
      expect(updatedVolunteer.isAccountVerified).toBe(true);
    });
  });

  describe("NGO Registration Workflow", () => {
    it("should complete full NGO registration and verification workflow", async () => {
      // Step 1: User registers as NGO
      const ngoData = {
        name: "Help Foundation NGO",
        email: "info@helpfoundation.org",
        password: "SecurePass123!",
        role: "NGO"
      };

      const registerResponse = await agent
        .post("/api/auth/register")
        .send(ngoData);

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.user.role).toBe("NGO");

      // Step 2: Verify account
      const user = await User.findOne({ email: ngoData.email });
      await User.findByIdAndUpdate(user._id, { isAccountVerified: true });

      // Step 3: Login
      const loginResponse = await agent
        .post("/api/auth/login")
        .send({
          email: ngoData.email,
          password: ngoData.password
        });

      expect(loginResponse.status).toBe(200);

      // Step 4: Create NGO profile
      const profileData = {
        organizationName: "Help Foundation",
        registrationNumber: "NGO-2024-001",
        establishedYear: 2010,
        address: {
          street: "789 NGO Road",
          city: "Colombo",
          province: "Western",
          postalCode: "00100"
        },
        contactInfo: {
          phone: "+94112345678",
          alternatePhone: "+94112345679",
          email: ngoData.email,
          website: "https://helpfoundation.org"
        },
        directorInfo: {
          name: "Dr. John Director",
          position: "Executive Director",
          phone: "+94112345680",
          email: "director@helpfoundation.org"
        },
        focusAreas: ["Disaster Relief", "Medical Aid", "Education"],
        serviceAreas: ["Colombo", "Gampaha", "Kalutara"],
        capacity: {
          volunteers: 50,
          staff: 20,
          vehicles: 5
        },
        certifications: ["ISO 9001", "NGO Registration Certificate"],
        bankDetails: {
          accountName: "Help Foundation",
          accountNumber: "1234567890",
          bankName: "Bank of Ceylon",
          branchName: "Colombo Main Branch"
        }
      };

      const profileResponse = await agent
        .post("/api/ngo/create-profile")
        .set("Cookie", loginResponse.headers["set-cookie"])
        .send(profileData);

      expect(profileResponse.status).toBe(201);
      expect(profileResponse.body.success).toBe(true);
      expect(profileResponse.body.profile.organizationName).toBe(profileData.organizationName);

      // Step 5: Admin verifies NGO
      const adminData = {
        name: "Admin User",
        email: "admin@example.com",
        password: "SecurePass123!",
        role: "ADMIN"
      };

      await agent.post("/api/auth/register").send(adminData);
      const adminUser = await User.findOne({ email: adminData.email });
      await User.findByIdAndUpdate(adminUser._id, { isAccountVerified: true });

      const adminLoginResponse = await agent
        .post("/api/auth/login")
        .send({
          email: adminData.email,
          password: adminData.password
        });

      const verifyResponse = await agent
        .patch(`/api/adminUser/verify-ngo/${user._id}`)
        .set("Cookie", adminLoginResponse.headers["set-cookie"]);

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.success).toBe(true);
    });
  });

  describe("Password Reset Workflow", () => {
    it("should handle complete password reset workflow", async () => {
      // Step 1: Register and verify user
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "OriginalPass123!",
        role: "CITIZEN"
      };

      const registerResponse = await agent
        .post("/api/auth/register")
        .send(userData);

      const user = await User.findOne({ email: userData.email });
      await User.findByIdAndUpdate(user._id, { isAccountVerified: true });

      // Step 2: Request password reset
      const resetRequestResponse = await agent
        .post("/api/auth/send-reset-otp")
        .send({ email: userData.email });

      expect(resetRequestResponse.status).toBe(200);
      expect(resetRequestResponse.body.success).toBe(true);

      // Step 3: Verify reset OTP
      const updatedUser = await User.findOne({ email: userData.email });
      const resetOtp = updatedUser.resetOtp;

      const verifyOtpResponse = await agent
        .post("/api/auth/verify-reset-otp")
        .send({
          email: userData.email,
          code: resetOtp
        });

      expect(verifyOtpResponse.status).toBe(200);
      expect(verifyOtpResponse.body.success).toBe(true);

      // Step 4: Reset password
      const newPassword = "NewSecurePass456!";
      const resetPasswordResponse = await agent
        .post("/api/auth/reset-password")
        .send({
          email: userData.email,
          newPassword: newPassword
        });

      expect(resetPasswordResponse.status).toBe(200);
      expect(resetPasswordResponse.body.success).toBe(true);

      // Step 5: Login with new password
      const loginWithNewPasswordResponse = await agent
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: newPassword
        });

      expect(loginWithNewPasswordResponse.status).toBe(200);
      expect(loginWithNewPasswordResponse.body.success).toBe(true);

      // Step 6: Login with old password should fail
      const loginWithOldPasswordResponse = await agent
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: userData.password
        });

      expect(loginWithOldPasswordResponse.status).toBe(401);
      expect(loginWithOldPasswordResponse.body.success).toBe(false);
    });
  });

  describe("Registration Error Scenarios", () => {
    it("should handle duplicate email registration", async () => {
      const userData = {
        name: "Test User",
        email: "duplicate@example.com",
        password: "SecurePass123!",
        role: "CITIZEN"
      };

      // First registration
      const firstResponse = await agent
        .post("/api/auth/register")
        .send(userData);

      expect(firstResponse.status).toBe(201);

      // Second registration with same email
      const secondResponse = await agent
        .post("/api/auth/register")
        .send(userData);

      expect(secondResponse.status).toBe(409);
      expect(secondResponse.body.success).toBe(false);
      expect(secondResponse.body.isUserExists).toBe(true);
    });

    it("should handle invalid registration data", async () => {
      const invalidData = {
        name: "", // Empty name
        email: "invalid-email", // Invalid email
        password: "123", // Too short password
        role: "INVALID_ROLE" // Invalid role
      };

      const response = await agent
        .post("/api/auth/register")
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should handle login with non-existent user", async () => {
      const response = await agent
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123"
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should handle login with wrong password", async () => {
      // Register user first
      const userData = {
        name: "Test User",
        email: "wrongpass@example.com",
        password: "CorrectPass123!",
        role: "CITIZEN"
      };

      await agent.post("/api/auth/register").send(userData);
      const user = await User.findOne({ email: userData.email });
      await User.findByIdAndUpdate(user._id, { isAccountVerified: true });

      // Try login with wrong password
      const response = await agent
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: "WrongPass123!"
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should handle access to protected routes without authentication", async () => {
      const response = await agent.get("/api/auth/me");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Multi-User Registration Workflow", () => {
    it("should handle multiple users registering simultaneously", async () => {
      const users = [
        {
          name: "Alice Citizen",
          email: "alice@example.com",
          password: "AlicePass123!",
          role: "CITIZEN"
        },
        {
          name: "Bob Volunteer",
          email: "bob@example.com",
          password: "BobPass123!",
          role: "VOLUNTEER"
        },
        {
          name: "Charlie NGO",
          email: "charlie@example.com",
          password: "CharliePass123!",
          role: "NGO"
        }
      ];

      // Register all users
      const registrationResponses = await Promise.all(
        users.map(user => agent.post("/api/auth/register").send(user))
      );

      // Verify all registrations succeeded
      registrationResponses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body.user.role).toBe(users[index].role);
      });

      // Verify all accounts
      for (const user of users) {
        const dbUser = await User.findOne({ email: user.email });
        await User.findByIdAndUpdate(dbUser._id, { isAccountVerified: true });
      }

      // Login all users
      const loginResponses = await Promise.all(
        users.map(user => 
          agent.post("/api/auth/login").send({
            email: user.email,
            password: user.password
          })
        )
      );

      // Verify all logins succeeded
      loginResponses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
      });

      // Access protected routes for all users
      const meResponses = await Promise.all(
        loginResponses.map((response, index) =>
          agent
            .get("/api/auth/me")
            .set("Cookie", response.headers["set-cookie"])
        )
      );

      // Verify all users can access their profiles
      meResponses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body.email).toBe(users[index].email);
        expect(response.body.role).toBe(users[index].role);
      });
    });
  });
});
