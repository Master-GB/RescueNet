import { hashPassword, comparePassword } from "../../../services/passwordService.js";

describe("Password Service", () => {
  test("hashPassword should return a different string than plain password", async () => {
    const password = "StrongPass123!";
    const hash = await hashPassword(password);
    expect(hash).toBeDefined();
    expect(hash).not.toEqual(password);
  });

  test("comparePassword should return true for correct password", async () => {
    const password = "StrongPass123!";
    const hash = await hashPassword(password);
    const ok = await comparePassword(password, hash);
    expect(ok).toBe(true);
  });

  test("comparePassword should return false for wrong password", async () => {
    const password = "StrongPass123!";
    const hash = await hashPassword(password);
    const ok = await comparePassword("WrongPass000!", hash);
    expect(ok).toBe(false);
  });
});
