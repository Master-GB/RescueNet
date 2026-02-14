import { jest } from "@jest/globals";
import Joi from "joi";
import { validateBody } from "../../../middleware/validate.js";

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("validateBody Middleware", () => {
  test("should pass when body is valid", () => {
    const schema = Joi.object({ email: Joi.string().email().required() });

    const req = { body: { email: "user@example.com" } };
    const res = mockRes();
    const next = jest.fn();

    validateBody(schema)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("should return 400 when body is invalid", () => {
    const schema = Joi.object({ email: Joi.string().email().required() });

    const req = { body: { email: "not-an-email" } };
    const res = mockRes();
    const next = jest.fn();

    validateBody(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test("should strip unknown fields when stripUnknown is enabled", () => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
    });

    const req = { body: { email: "user@example.com", extra: "REMOVE_ME" } };
    const res = mockRes();
    const next = jest.fn();

    validateBody(schema)(req, res, next);

    expect(req.body.extra).toBeUndefined();
    expect(req.body.email).toBe("user@example.com");
    expect(next).toHaveBeenCalled();
  });
});
