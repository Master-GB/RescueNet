import { jest } from "@jest/globals";

// Mock jwt + User BEFORE importing protect
const verifyMock = jest.fn();
await jest.unstable_mockModule("jsonwebtoken", () => ({
  default: { verify: verifyMock },
}));

const findByIdMock = jest.fn();
const selectMock = jest.fn();

await jest.unstable_mockModule("../../../models/user.js", () => ({
  default: {
    findById: findByIdMock,
  },
}));

// Now import after mocks
const { protect } = await import("../../../middleware/authMiddleware.js"); 

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("protect middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test_secret";
  });

  test("should return 401 if token cookie is missing", async () => {
    const req = { cookies: {} };
    const res = mockRes();
    const next = jest.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized Access",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if jwt.verify throws (invalid/expired token)", async () => {
    const req = { cookies: { access_token: "badtoken" } };
    const res = mockRes();
    const next = jest.fn();

    verifyMock.mockImplementation(() => {
      throw new Error("invalid token");
    });

    await protect(req, res, next);

    expect(verifyMock).toHaveBeenCalledWith("badtoken", "test_secret");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid or expired token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if user not found in DB", async () => {
    const req = { cookies: { access_token: "goodtoken" } };
    const res = mockRes();
    const next = jest.fn();

    verifyMock.mockReturnValue({ sub: "userId123" });

    // User.findById(...).select(...) returns null
    selectMock.mockResolvedValue(null);
    findByIdMock.mockReturnValue({ select: selectMock });

    await protect(req, res, next);

    expect(verifyMock).toHaveBeenCalledWith("goodtoken", "test_secret");
    expect(findByIdMock).toHaveBeenCalledWith("userId123");
    expect(selectMock).toHaveBeenCalledWith("-passwordHash");

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should set req.user and call next when token valid and user exists", async () => {
    const req = { cookies: { access_token: "goodtoken" } };
    const res = mockRes();
    const next = jest.fn();

    verifyMock.mockReturnValue({ sub: "userId123" });

    const fakeUser = { _id: "userId123", email: "a@b.com", role: "ADMIN" };
    selectMock.mockResolvedValue(fakeUser);
    findByIdMock.mockReturnValue({ select: selectMock });

    await protect(req, res, next);

    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalledTimes(1);

    // Should not send a response
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
