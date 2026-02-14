import { jest } from "@jest/globals";

/**
 * Mocks
 */
const jwtSignMock = jest.fn();
await jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jwtSignMock,
  },
}));

const findOneMock = jest.fn();
const createMock = jest.fn();
const findByIdMock = jest.fn();

await jest.unstable_mockModule("../../../models/user.js", () => ({
  default: {
    findOne: findOneMock,
    create: createMock,
    findById: findByIdMock,
  },
}));

const hashPasswordMock = jest.fn();
const comparePasswordMock = jest.fn();
await jest.unstable_mockModule("../../../services/passwordService.js", () => ({
  hashPassword: hashPasswordMock,
  comparePassword: comparePasswordMock,
}));

const setAuthCookieMock = jest.fn();
await jest.unstable_mockModule("../../../utils/setAuthCookie.js", () => ({
  setAuthCookie: setAuthCookieMock,
}));

const sendEmailMock = jest.fn();
await jest.unstable_mockModule("../../../config/nodeMailer.js", () => ({
  sendEmail: sendEmailMock,
}));

// Templates return html strings (we don't test template correctness here)
const sendOTPTemplateMock = jest.fn(() => "<html>otp</html>");
const verifyAccountTemplateMock = jest.fn(() => "<html>welcome</html>");
const sendResetOTPTemplateMock = jest.fn(() => "<html>reset</html>");

await jest.unstable_mockModule("../../../templates/emailTemplates.js", () => ({
  sendOTPTemplate: sendOTPTemplateMock,
  verifyAccountTemplate: verifyAccountTemplateMock,
  sendResetOTPTemplate: sendResetOTPTemplateMock,
}));

/**
 * Import controller AFTER mocks
 * ⚠️ Adjust this path to your real controller file
 */
const {
  registerUser,
  loginUser,
  logoutUser,
  sendOTP,
  verifyUserAccount,
  sendResetOtp,
  verifyResetOtp,
  resetPassword,
  me,
} = await import("../../../controllers/authController.js"); 

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.clearCookie = jest.fn(() => res);
  return res;
}

describe("Auth Controller Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test_secret";
    process.env.JWT_EXPIRES_IN = "7d";
    process.env.NODE_ENV = "development";
  });

  // -------------------------
  // registerUser
  // -------------------------
  describe("registerUser", () => {
    test("should return 400 if required fields are missing", async () => {
      const req = { body: { firstName: "A", email: "a@b.com" } }; // missing lastName, password, role
      const res = mockRes();

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "All fields are required",
      });
    });

    test("should return 409 if email already exists", async () => {
      findOneMock.mockResolvedValue({ _id: "exists" });

      const req = {
        body: {
          firstName: "A",
          lastName: "B",
          email: "a@b.com",
          password: "Pass123!",
          role: "CITIZEN",
        },
      };
      const res = mockRes();

      await registerUser(req, res);

      expect(findOneMock).toHaveBeenCalledWith({ email: "a@b.com" });
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Email already exists",
          isUserExists: true,
        })
      );
    });

    test("should create user, set cookie, and return 201 on success", async () => {
      findOneMock.mockResolvedValue(null);
      hashPasswordMock.mockResolvedValue("hashed_pw");

      const createdUser = {
        _id: "u1",
        firstName: "A",
        lastName: "B",
        email: "a@b.com",
        role: "CITIZEN",
        name: "A B",
        toString() {
          return "u1";
        },
      };
      createMock.mockResolvedValue(createdUser);

      jwtSignMock.mockReturnValue("token123");

      const req = {
        body: {
          firstName: "A",
          lastName: "B",
          email: "a@b.com",
          password: "Pass123!",
          role: "CITIZEN",
        },
      };
      const res = mockRes();

      await registerUser(req, res);

      expect(hashPasswordMock).toHaveBeenCalledWith("Pass123!");
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: "A",
          lastName: "B",
          email: "a@b.com",
          passwordHash: "hashed_pw",
          role: "CITIZEN",
        })
      );

      expect(jwtSignMock).toHaveBeenCalled();
      expect(setAuthCookieMock).toHaveBeenCalledWith(res, "token123");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Successfully Registered",
        })
      );
    });

    test("should return 500 if DB throws error", async () => {
      findOneMock.mockRejectedValue(new Error("DB error"));

      const req = {
        body: {
          firstName: "A",
          lastName: "B",
          email: "a@b.com",
          password: "Pass123!",
          role: "CITIZEN",
        },
      };
      const res = mockRes();

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Registeration failed",
        })
      );
    });
  });

  // -------------------------
  // loginUser
  // -------------------------
  describe("loginUser", () => {
    test("should return 400 if email or password missing", async () => {
      const req = { body: { email: "a@b.com" } };
      const res = mockRes();

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Sign In failed:Missing Details",
      });
    });

    test("should return 401 if user not found", async () => {
      findOneMock.mockResolvedValue(null);

      const req = { body: { email: "a@b.com", password: "Pass123!" } };
      const res = mockRes();

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });

    test("should return 401 if password invalid", async () => {
      findOneMock.mockResolvedValue({
        _id: "u1",
        email: "a@b.com",
        passwordHash: "hash",
        isAccountVerified: true,
      });
      comparePasswordMock.mockResolvedValue(false);

      const req = { body: { email: "a@b.com", password: "wrong" } };
      const res = mockRes();

      await loginUser(req, res);

      expect(comparePasswordMock).toHaveBeenCalledWith("wrong", "hash");
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test("should return 400 if account is not verified", async () => {
      findOneMock.mockResolvedValue({
        _id: "u1",
        email: "a@b.com",
        passwordHash: "hash",
        isAccountVerified: false,
      });
      comparePasswordMock.mockResolvedValue(true);

      const req = { body: { email: "a@b.com", password: "Pass123!" } };
      const res = mockRes();

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Sign In failed:Account not verified",
      });
    });

    test("should set cookie and return 200 on success", async () => {
      const user = {
        _id: "u1",
        toString() {
          return "u1";
        },
        email: "a@b.com",
        role: "ADMIN",
        name: "A B",
        passwordHash: "hash",
        isAccountVerified: true,
      };

      findOneMock.mockResolvedValue(user);
      comparePasswordMock.mockResolvedValue(true);
      jwtSignMock.mockReturnValue("token_login");

      const req = { body: { email: "a@b.com", password: "Pass123!" } };
      const res = mockRes();

      await loginUser(req, res);

      expect(setAuthCookieMock).toHaveBeenCalledWith(res, "token_login");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Logged in successfully",
        })
      );
    });
  });

  // -------------------------
  // logoutUser
  // -------------------------
  describe("logoutUser", () => {
    test("should clear cookie and return 200", async () => {
      const req = {};
      const res = mockRes();

      await logoutUser(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith(
        "access_token",
        expect.objectContaining({
          httpOnly: true,
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Logout successful",
      });
    });
  });

  // -------------------------
  // sendOTP
  // -------------------------
  describe("sendOTP", () => {
    test("should return 400 if account already verified", async () => {
      const req = { user: { _id: "u1" } };
      const res = mockRes();

      findByIdMock.mockResolvedValue({ isAccountVerified: true });

      await sendOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Account already verified",
      });
    });

    test("should generate otp, save user, and send email", async () => {
      const req = { user: { _id: "u1" } };
      const res = mockRes();

      const saveMock = jest.fn();
      const user = {
        _id: "u1",
        firstName: "A",
        email: "a@b.com",
        isAccountVerified: false,
        verifyOtp: "",
        verifyOtpExpiry: 0,
        save: saveMock,
      };
      findByIdMock.mockResolvedValue(user);

      await sendOTP(req, res);

      expect(saveMock).toHaveBeenCalled();
      expect(sendOTPTemplateMock).toHaveBeenCalled();
      expect(sendEmailMock).toHaveBeenCalledWith(
        "a@b.com",
        "Verify Account",
        expect.any(String)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "OTP sent successfully",
      });
    });
  });

  // -------------------------
  // verifyUserAccount
  // -------------------------
  describe("verifyUserAccount", () => {
    test("should return 400 if missing id or otp", async () => {
      const req = { body: {}, user: {} };
      const res = mockRes();

      await verifyUserAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Missing Details",
      });
    });

    test("should return 400 if invalid otp", async () => {
      const req = { body: { otp: "111111" }, user: { _id: "u1" } };
      const res = mockRes();

      findByIdMock.mockResolvedValue({
        verifyOtp: "222222",
        verifyOtpExpiry: Date.now() + 60000,
      });

      await verifyUserAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid OTP",
      });
    });

    test("should return 400 if otp expired", async () => {
      const req = { body: { otp: "222222" }, user: { _id: "u1" } };
      const res = mockRes();

      findByIdMock.mockResolvedValue({
        firstName: "A",
        email: "a@b.com",
        verifyOtp: "222222",
        verifyOtpExpiry: Date.now() - 1000,
      });

      await verifyUserAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "OTP Expired",
      });
    });

    test("should verify account and send welcome email", async () => {
      const req = { body: { otp: "222222" }, user: { _id: "u1" } };
      const res = mockRes();

      const saveMock = jest.fn();
      const user = {
        firstName: "A",
        email: "a@b.com",
        verifyOtp: "222222",
        verifyOtpExpiry: Date.now() + 60000,
        isAccountVerified: false,
        save: saveMock,
      };
      findByIdMock.mockResolvedValue(user);

      await verifyUserAccount(req, res);

      expect(user.isAccountVerified).toBe(true);
      expect(user.verifyOtp).toBe("");
      expect(user.verifyOtpExpiry).toBe(0);
      expect(saveMock).toHaveBeenCalled();

      expect(verifyAccountTemplateMock).toHaveBeenCalledWith("A");
      expect(sendEmailMock).toHaveBeenCalledWith(
        "a@b.com",
        "Welcome to RescueNet",
        expect.any(String)
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Account verified successfully",
      });
    });
  });

  // -------------------------
  // sendResetOtp
  // -------------------------
  describe("sendResetOtp", () => {
    test("should return 400 if email missing", async () => {
      const req = { body: {} };
      const res = mockRes();

      await sendResetOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Email is required",
      });
    });

    test("should return 400 if user not found", async () => {
      findOneMock.mockResolvedValue(null);

      const req = { body: { email: "a@b.com" } };
      const res = mockRes();

      await sendResetOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "OTP sending failed,User not found",
      });
    });

    test("should save reset otp and send email", async () => {
      const saveMock = jest.fn();
      const user = {
        firstName: "A",
        email: "a@b.com",
        resetOtp: "",
        resetOtpExpiry: 0,
        save: saveMock,
      };
      findOneMock.mockResolvedValue(user);

      const req = { body: { email: "a@b.com" } };
      const res = mockRes();

      await sendResetOtp(req, res);

      expect(saveMock).toHaveBeenCalled();
      expect(sendResetOTPTemplateMock).toHaveBeenCalled();
      expect(sendEmailMock).toHaveBeenCalledWith(
        "a@b.com",
        "Password Reset OTP",
        expect.any(String)
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Password reset OTP sent to email",
      });
    });
  });

  // -------------------------
  // verifyResetOtp
  // -------------------------
  describe("verifyResetOtp", () => {
    test("should return 400 if missing email or code", async () => {
      const req = { body: { email: "a@b.com" } };
      const res = mockRes();

      await verifyResetOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("should return 400 if invalid otp", async () => {
      findOneMock.mockResolvedValue({
        resetOtp: "222222",
        resetOtpExpiry: Date.now() + 60000,
      });

      const req = { body: { email: "a@b.com", code: "111111" } };
      const res = mockRes();

      await verifyResetOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Email verification failed,Invalid OTP",
      });
    });

    test("should return 200 if otp is valid and not expired", async () => {
      findOneMock.mockResolvedValue({
        resetOtp: "222222",
        resetOtpExpiry: Date.now() + 60000,
      });

      const req = { body: { email: "a@b.com", code: "222222" } };
      const res = mockRes();

      await verifyResetOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "OTP verified successfully",
      });
    });
  });

  // -------------------------
  // resetPassword
  // -------------------------
  describe("resetPassword", () => {
    test("should return 400 if missing email or newPassword", async () => {
      const req = { body: { email: "a@b.com" } };
      const res = mockRes();

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Password Reset failed,Missing Details",
      });
    });

    test("should return 400 if user not found", async () => {
      findOneMock.mockResolvedValue(null);

      const req = { body: { email: "a@b.com", newPassword: "NewPass123!" } };
      const res = mockRes();

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Password Reset failed,User not found",
      });
    });

    test("should hash new password, clear otp fields, save user, and return 200", async () => {
      const saveMock = jest.fn();
      const user = {
        email: "a@b.com",
        passwordHash: "oldhash",
        resetOtp: "222222",
        resetOtpExpiry: Date.now() + 60000,
        save: saveMock,
      };

      findOneMock.mockResolvedValue(user);
      hashPasswordMock.mockResolvedValue("newhash");

      const req = { body: { email: "a@b.com", newPassword: "NewPass123!" } };
      const res = mockRes();

      await resetPassword(req, res);

      expect(hashPasswordMock).toHaveBeenCalledWith("NewPass123!");
      expect(user.passwordHash).toBe("newhash");
      expect(user.resetOtp).toBe("");
      expect(user.resetOtpExpiry).toBe(0);
      expect(saveMock).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Password reset successfully",
      });
    });
  });

  // -------------------------
  // me
  // -------------------------
  describe("me", () => {
    test("should return req.user", async () => {
      const req = { user: { _id: "u1", email: "a@b.com" } };
      const res = mockRes();

      await me(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: req.user,
      });
    });
  });
});
