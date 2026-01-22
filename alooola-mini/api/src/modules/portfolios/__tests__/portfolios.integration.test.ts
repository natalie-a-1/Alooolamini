/**
 * Integration tests for the Portfolios module.
 * 
 * This suite covers the main portfolio endpoints: curated portfolio listing/detail,
 * position creation with membership validation, and filtered historical snapshots.
 *
 * Expectations documented above each test.
 */

import type { Express } from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Prisma, RiskTolerance, type PrismaClient } from "@prisma/client";
import {
  setupIntegrationTestContext,
  teardownIntegrationTestContext,
  type IntegrationTestContext,
} from "../../../test-utils/integration";

describe("portfolios integration", () => {
  // Test context and reusable handles
  let ctx: IntegrationTestContext;
  let app: Express;
  let prisma: PrismaClient;
  let ownerToken: string;
  let ownerUserId: string;
  let outsiderToken: string;
  let curatedPortfolio: { id: string; name: string };

  /**
   * beforeAll:
   *   - Sets up integration test context (DB, Express app, Prisma client)
   *   - Authenticates a demo "owner" user and generates bearer tokens
   *   - Adds an "outsider" user for negative access testing
   *   - Seeds a curated portfolio with two holdings to drive portfolio endpoints
   */
  beforeAll(async () => {
    ctx = await setupIntegrationTestContext();
    app = ctx.app;
    prisma = ctx.prisma;

    // Dynamically import token issuer after the test DB URL is set by setupIntegrationTestContext
    const { issueTokens } = await import("../../auth/auth.service");

    // Seed an owner user directly (bypass auth/demo to avoid external deps)
    const ownerEmail = `owner+${Date.now()}@alooola.dev`;
    const owner = await prisma.user.create({
      data: { email: ownerEmail, name: "Owner Tester" },
    });
    ownerUserId = owner.id;
    const ownerTokens = await issueTokens(owner.id, owner.email);
    ownerToken = ownerTokens.accessToken;

    // Outsider user (used to test membership enforcement)
    const outsiderEmail = `outsider+${Date.now()}@alooola.dev`;
    const outsider = await prisma.user.create({
      data: { email: outsiderEmail, name: "Outsider Tester" },
    });
    const outsiderTokens = await issueTokens(outsider.id, outsider.email);
    outsiderToken = outsiderTokens.accessToken;

    // Curated portfolio with sample holdings used for listing/details tests
    const createdPortfolio = await prisma.curatedPortfolio.create({
      data: {
        name: `Curated-${Date.now()}`,
        description: "Test curated portfolio",
        riskTolerance: RiskTolerance.moderate,
        oneYearReturnPct: new Prisma.Decimal("7.5"),
        holdings: {
          create: [
            { symbol: "AAA", weightPct: new Prisma.Decimal("60") },
            { symbol: "BBB", weightPct: new Prisma.Decimal("40") },
          ],
        },
      },
      include: { holdings: true },
    });

    curatedPortfolio = { id: createdPortfolio.id, name: createdPortfolio.name };
  }, 120000);

  /**
   * afterAll:
   *   - Tears down the integration test context (DB cleanup, etc)
   */
  afterAll(async () => {
    await teardownIntegrationTestContext();
  }, 120000);

  /**
   * Helpers to inject Authorization headers as the correct user
   */
  const ownerAuth = () => ({ Authorization: `Bearer ${ownerToken}` });
  const outsiderAuth = () => ({ Authorization: `Bearer ${outsiderToken}` });

  /**
   * Helper to create a household belonging to the owner
   * @param name - Unique name for the household
   * @returns {string} - Created household's ID
   */
  const createHousehold = async (name: string) => {
    const res = await request(app)
      .post("/api/v1/households")
      .set(ownerAuth())
      .send({ name });
    return res.body.data.id as string;
  };

  /**
   * Test: Listing and getting curated portfolios (with holdings)
   * 
   * Expectations:
   *  - GET /portfolios returns the seeded curated portfolio in the list
   *  - GET /portfolios/:id returns all properties and holdings for the seeded portfolio
   *  - GET /portfolios/:id/holdings returns the correct holdings list for the portfolio
   */
  it("lists curated portfolios and returns details with holdings", async () => {
    // List all curated portfolios; portfolio seeded in beforeAll must appear
    const listRes = await request(app).get("/api/v1/portfolios").set(ownerAuth());
    expect(listRes.status).toBe(200);
    const ids = (listRes.body.data as Array<{ id: string }>).map((p) => p.id);
    expect(ids).toContain(curatedPortfolio.id);

    // Get portfolio details: must match the created portfolio and have 2 holdings
    const detailRes = await request(app)
      .get(`/api/v1/portfolios/${curatedPortfolio.id}`)
      .set(ownerAuth());

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.id).toBe(curatedPortfolio.id);
    expect(detailRes.body.data.holdings.length).toBeGreaterThanOrEqual(2);

    // Holdings endpoint should return correct holding count
    const holdingsRes = await request(app)
      .get(`/api/v1/portfolios/${curatedPortfolio.id}/holdings`)
      .set(ownerAuth());

    expect(holdingsRes.status).toBe(200);
    expect(holdingsRes.body.data.length).toBeGreaterThanOrEqual(2);
  });

  /**
   * Test: Creating a portfolio position and getting position + filtered snapshots
   * 
   * Expectations:
   *  - Only household members can create portfolio positions (outsiders are forbidden)
   *  - Owner can successfully create a position for their household/portfolio
   *  - Returned position has correct householdId and portfolioId
   *  - GET /portfolio-positions returns at least the created position with correct details
   *  - Seeding 2 snapshots (one old, one recent) and filtering by 1M range only returns the recent one
   *  - Snapshot's totalValue and timestamp are as expected
   */
  it("enforces membership for positions and returns positions and filtered snapshots", async () => {
    // Owner creates household (only owner will be a member)
    const householdId = await createHousehold(`Portfolio Household ${Date.now()}`);

    // Attempt portfolio position creation as a non-member -- should be forbidden
    const forbiddenRes = await request(app)
      .post(`/api/v1/households/${householdId}/portfolio-positions`)
      .set(outsiderAuth())
      .send({ portfolioId: curatedPortfolio.id, amountInvested: 500 });

    expect(forbiddenRes.status).toBe(403);

    // Create position as the owner (should succeed)
    const positionRes = await request(app)
      .post(`/api/v1/households/${householdId}/portfolio-positions`)
      .set(ownerAuth())
      .send({ portfolioId: curatedPortfolio.id, amountInvested: 1250 });

    expect(positionRes.status).toBe(200);
    expect(positionRes.body.data.householdId).toBe(householdId);
    expect(positionRes.body.data.portfolioId).toBe(curatedPortfolio.id);

    // Fetch all positions for the household; must include the one just created
    const positionsRes = await request(app)
      .get(`/api/v1/households/${householdId}/portfolio-positions`)
      .set(ownerAuth());

    expect(positionsRes.status).toBe(200);
    const positions = positionsRes.body.data as Array<{ portfolioId: string; amountInvested: number }>;
    expect(positions.length).toBeGreaterThanOrEqual(1);
    expect(positions[0].portfolioId).toBe(curatedPortfolio.id);

    // Insert two snapshots: one old (60 days ago), one recent (5 days ago)
    const now = new Date();
    const recentDate = new Date(now);
    recentDate.setDate(now.getDate() - 5);
    const oldDate = new Date(now);
    oldDate.setDate(now.getDate() - 60);

    await prisma.portfolioSnapshot.createMany({
      data: [
        {
          userId: ownerUserId,
          householdId,
          portfolioId: curatedPortfolio.id,
          totalValue: new Prisma.Decimal("5000"),
          gainAmount: new Prisma.Decimal("250"),
          gainPercent: new Prisma.Decimal("5.0"),
          asOf: oldDate,
        },
        {
          userId: ownerUserId,
          householdId,
          portfolioId: curatedPortfolio.id,
          totalValue: new Prisma.Decimal("5400"),
          gainAmount: new Prisma.Decimal("400"),
          gainPercent: new Prisma.Decimal("8.0"),
          asOf: recentDate,
        },
      ],
      skipDuplicates: true,
    });

    // List portfolio snapshots with range limited to 1 month,
    // should return only the recent snapshot, not the old one
    const snapshotsRes = await request(app)
      .get(`/api/v1/households/${householdId}/portfolio-snapshots`)
      .set(ownerAuth())
      .query({ range: "1M" });

    expect(snapshotsRes.status).toBe(200);
    const snapshots = snapshotsRes.body.data as Array<{ totalValue: unknown; asOf: string }>;
    expect(snapshots.length).toBe(1);
    const onlySnapshot = snapshots[0];
    expect(Number(onlySnapshot.totalValue)).toBeCloseTo(5400, 2);
    const returnedTime = new Date(onlySnapshot.asOf).getTime();
    expect(Math.abs(returnedTime - recentDate.getTime())).toBeLessThan(2000);
  });
});
