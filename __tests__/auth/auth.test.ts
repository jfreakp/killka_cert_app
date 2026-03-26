/**
 * Auth unit tests
 * - loginSchema validation
 * - Session callbacks (jwt, session)
 */

import { loginSchema, resetPasswordSchema } from "@/src/shared/auth/schemas";

/* ══════════════════════════════════
   loginSchema
   ══════════════════════════════════ */

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@university.edu",
      password: "SecurePass1!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "SecurePass1!" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "SecurePass1!" });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = loginSchema.safeParse({ email: "user@test.com", password: "short" });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

/* ══════════════════════════════════
   resetPasswordSchema
   ══════════════════════════════════ */

describe("resetPasswordSchema", () => {
  it("accepts valid reset data", () => {
    const result = resetPasswordSchema.safeParse({
      token: "valid-token-123",
      password: "NewPass1!",
      confirmPassword: "NewPass1!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects password without number", () => {
    const result = resetPasswordSchema.safeParse({
      token: "t",
      password: "NoNumber!",
      confirmPassword: "NoNumber!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without special character", () => {
    const result = resetPasswordSchema.safeParse({
      token: "t",
      password: "NoSpecial1",
      confirmPassword: "NoSpecial1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({
      token: "t",
      password: "ValidPass1!",
      confirmPassword: "DifferentPass1!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty token", () => {
    const result = resetPasswordSchema.safeParse({
      token: "",
      password: "ValidPass1!",
      confirmPassword: "ValidPass1!",
    });
    expect(result.success).toBe(false);
  });
});

/* ══════════════════════════════════
   Auth integration: authorize flow
   ══════════════════════════════════ */

describe("authorize (integration)", () => {
  // We test the authorize logic inline since NextAuth doesn't export it easily.
  // Instead we test the building blocks: schema + bcrypt compare

  it("bcryptjs compare rejects wrong password", async () => {
    const { hash, compare } = await import("bcryptjs");
    const hashed = await hash("RealPassword1!", 10);
    const result = await compare("WrongPassword1!", hashed);
    expect(result).toBe(false);
  });

  it("bcryptjs compare accepts correct password", async () => {
    const { hash, compare } = await import("bcryptjs");
    const hashed = await hash("RealPassword1!", 10);
    const result = await compare("RealPassword1!", hashed);
    expect(result).toBe(true);
  });
});
