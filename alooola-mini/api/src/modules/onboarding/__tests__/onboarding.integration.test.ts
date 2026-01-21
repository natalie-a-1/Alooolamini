import type { Express } from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { setupIntegrationTestContext, teardownIntegrationTestContext } from "../../../test-utils/integration";

/**
 * Integration tests for the onboarding module.
 * 
 * Validates that users can save onboarding information via REST endpoints,
 * and verifies that the backend persists this information as expected.
 */
describe("onboarding", () => {
  let app: Express;
  let prisma: PrismaClient;
  let accessToken: string;
  let userId: string;

  /**
   * Sets up the integration test context and creates demo user and
   * goal options for use in the tests.
   *
   * - Starts isolated test DB, migrates schema, creates express app.
   * - Adds two goal options ("build-wealth" and "retirement") to the test DB.
   * - Creates a demo user and issues an access token for API authentication.
   */
  beforeAll(async () => {
    const context = await setupIntegrationTestContext();
    app = context.app;
    prisma = context.prisma;

    // Insert test goal options for onboarding selection.
    await prisma.goalOption.createMany({
      data: [
        { key: "build-wealth", label: "Build wealth" },
        { key: "retirement", label: "Retirement" },
      ],
      skipDuplicates: true,
    });

    // Create a demo user and obtain authentication token
    const demoResponse = await request(app).post("/api/v1/auth/demo").send({});
    accessToken = demoResponse.body.data.accessToken;
    userId = demoResponse.body.data.user.id;
  }, 120000);

  /**
   * Cleans up test data in the database and tears down the test context.
   * 
   * - Removes any user goal selections made during the test for the demo user.
   * - Removes goal options created for the test.
   * - Stops the test DB container and disconnects Prisma.
   */
  afterAll(async () => {
    if (prisma && userId) {
      await prisma.userGoalSelection.deleteMany({ where: { userId } });
      await prisma.goalOption.deleteMany();
    }
    await teardownIntegrationTestContext();
  }, 120000);

  /**
   * Test: "saves onboarding goals and returns goal keys"
   *
   * This test verifies that:
   *   1. The user can submit onboarding information (name, goal selections, risk, starter amount)
   *      to the PUT /api/v1/onboarding/me endpoint and receive a 200 OK response.
   *   2. A follow-up GET /api/v1/onboarding/me request reflects the saved goal selections.
   *   3. The user's goal selections are correctly persisted in the database.
   *
   * Expected Results:
   *   - The server responds with 200 status to both put/get requests.
   *   - The goalKeys in the response exactly match those submitted.
   *   - The userGoalSelection rows in the database for this user match the chosen keys.
   */
  it("saves onboarding goals and returns goal keys", async () => {
    const goalKeys = ["build-wealth", "retirement"];

    // Submit onboarding information for the authenticated demo user.
    const putResponse = await request(app)
      .put("/api/v1/onboarding/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Test User",
        goalKeys,
        riskTolerance: "moderate",
        starterAmount: 1000,
      });

    // Expect successful status.
    expect(putResponse.status).toBe(200);

    // Request onboarding info; expect to receive the right goalKeys.
    const getResponse = await request(app)
      .get("/api/v1/onboarding/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data.goalKeys.sort()).toEqual(goalKeys.sort());

    // Verify directly in the database that the user's goal selections are stored correctly.
    const selections = await prisma.userGoalSelection.findMany({
      where: { userId },
      include: { goal: true },
    });

    const savedKeys = selections.map((selection) => selection.goal.key).sort();
    expect(savedKeys).toEqual(goalKeys.sort());
  });
});
