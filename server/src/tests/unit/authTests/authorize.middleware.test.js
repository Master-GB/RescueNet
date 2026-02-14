import { jest } from "@jest/globals";
import { authorize } from "../../../middleware/authorizeMiddleware.js";

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("Authorize Middleware (RBAC)", () => {
  test("should return 401 if req.user is missing", () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();

    authorize("ADMIN")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 403 if role not allowed", () => {
    const req = { user: { role: "CITIZEN" } };
    const res = mockRes();
    const next = jest.fn();

    authorize("ADMIN")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("should call next if role allowed", () => {
    const req = { user: { role: "ADMIN" } };
    const res = mockRes();
    const next = jest.fn();

    authorize("ADMIN", "VOLUNTEER")(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
