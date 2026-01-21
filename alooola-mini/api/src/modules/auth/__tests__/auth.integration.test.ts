import type { Express } from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { setupIntegrationTestContext, teardownIntegrationTestContext } from "../../../test-utils/integration";

describe("auth", () => {
  let app: Express;

  beforeAll(async () => {
    const context = await setupIntegrationTestContext();
    app = context.app;
  }, 120000);

  afterAll(async () => {
    await teardownIntegrationTestContext();
  }, 120000);

  it("returns ACCOUNT_NOT_FOUND when logging in with an unknown email", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "unknown.user@alooola.dev",
      password: "Password123!",
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("ACCOUNT_NOT_FOUND");
  });
});
