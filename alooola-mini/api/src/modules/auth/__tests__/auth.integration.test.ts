/**
 * Integration tests for the auth module.
 *
 * Scope:
 * - Prove happy-path auth flow: register → verify → login → refresh rotation → logout (revokes).
 * - Validate error paths: unknown login and invalid referral codes.
 * - Ensure demo login issues tokens from the service layer.
 *
 * Expectations:
 * - Registration stores a verification token and blocks login until verified.
 * - Email verification marks the token, returns user + tokens, and flags onboarding status.
 * - Refresh rotates tokens and revokes the prior refresh token.
 * - Logout revokes provided refresh token and prevents further refresh with it.
 * - Demo login always returns a user with access/refresh tokens.
 */
import type { Express } from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { hashToken } from "../../../lib/crypto";
import { setupIntegrationTestContext, teardownIntegrationTestContext, type IntegrationTestContext } from "../../../test-utils/integration";

/**
 * Top-level auth integration suite.
 * Covers end-to-end HTTP behavior for auth endpoints.
 */
describe("auth integration", () => {
  let ctx: IntegrationTestContext;
  let app: Express;

  /**
   * Spins up the test app and database once for the suite.
   */
  beforeAll(async () => {
    ctx = await setupIntegrationTestContext();
    app = ctx.app;
  }, 120000);

  /**
   * Tears down database and Prisma client after all tests.
   */
  afterAll(async () => {
    await teardownIntegrationTestContext();
  }, 120000);

  /**
   * Confirms unknown email returns ACCOUNT_NOT_FOUND.
   */
  it("returns ACCOUNT_NOT_FOUND when logging in with an unknown email", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "unknown.user@alooola.dev",
      password: "Password123!",
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("ACCOUNT_NOT_FOUND");
  });

  /**
   * Full happy path with enforced verification, rotation, and logout revocation.
   */
  it("registers, verifies, logs in, refreshes, and logs out a user", async () => {
    const email = "jane.doe@alooola.dev";
    const password = "Password123!";
    const name = "Jane Doe";

    // Register
    const registerRes = await request(app).post("/api/v1/auth/register").send({ email, password, name });
    expect(registerRes.status).toBe(200);
    expect(registerRes.body.data.sent).toBe(true);
    expect(registerRes.body.data.isNewUser).toBe(true);

    // Login should fail until email verified
    const preVerifyLogin = await request(app).post("/api/v1/auth/login").send({ email, password });
    expect(preVerifyLogin.status).toBe(400);
    expect(preVerifyLogin.body.error.code).toBe("EMAIL_NOT_VERIFIED");

    // Prepare a known verification token
    const verificationToken = "TEST_VERIFY_TOKEN_12345";
    const user = await ctx.prisma.user.findUniqueOrThrow({ where: { email } });
    const existingVerification = await ctx.prisma.emailVerification.findFirst({ where: { userId: user.id } });
    if (existingVerification) {
      await ctx.prisma.emailVerification.update({
        where: { id: existingVerification.id },
        data: { tokenHash: hashToken(verificationToken), expiresAt: new Date(Date.now() + 15 * 60 * 1000), verifiedAt: null },
      });
    } else {
      await ctx.prisma.emailVerification.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(verificationToken),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });
    }

    // Verify email
    const verifyRes = await request(app).post("/api/v1/auth/email/verify").send({ email, token: verificationToken });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.user.email).toBe(email);
    expect(verifyRes.body.data.needsOnboarding).toBe(true);
    expect(verifyRes.body.data.accessToken).toBeTruthy();
    expect(verifyRes.body.data.refreshToken).toBeTruthy();

    const { accessToken, refreshToken } = verifyRes.body.data;

    // Login now succeeds
    const loginRes = await request(app).post("/api/v1/auth/login").send({ email, password });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.user.email).toBe(email);
    expect(loginRes.body.data.accessToken).toBeTruthy();
    expect(loginRes.body.data.refreshToken).toBeTruthy();
    const loginRefresh = loginRes.body.data.refreshToken as string;

    // Refresh rotates tokens
    const refreshRes = await request(app).post("/api/v1/auth/refresh").send({ refreshToken: loginRefresh });
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data.refreshToken).not.toBe(loginRefresh);
    expect(refreshRes.body.data.accessToken).toBeTruthy();

    // Logout revokes supplied refresh token
    const logoutRes = await request(app)
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ refreshToken: loginRefresh });
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.data.revoked).toBe(true);

    // Refresh with revoked token should fail
    const refreshAfterLogout = await request(app).post("/api/v1/auth/refresh").send({ refreshToken: loginRefresh });
    expect(refreshAfterLogout.status).toBe(401);
    expect(refreshAfterLogout.body.error.code).toBe("UNAUTHORIZED");
  });

  /**
   * Invalid referral codes should be rejected with INVALID_REFERRAL_CODE.
   */
  it("rejects invalid referral codes", async () => {
    const res = await request(app).post("/api/v1/auth/referral/validate").send({ code: "ZZZZ" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_REFERRAL_CODE");
  });

  /**
   * Demo login should always return a user with access/refresh tokens.
   */
  it("allows demo login and returns tokens", async () => {
    const res = await request(app).post("/api/v1/auth/demo").send({});
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBeTruthy();
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.refreshToken).toBeTruthy();
  });
});
