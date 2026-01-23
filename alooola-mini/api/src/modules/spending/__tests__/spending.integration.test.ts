/**
 * Integration tests for the Spending module.
 *
 * These tests verify the end-to-end behavior of the Spending REST API, including
 * accounts, transactions, categories, spending summaries, and investment summaries.
 * Expectations for each test are documented inline.
 */

import type { Express } from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  setupIntegrationTestContext,
  teardownIntegrationTestContext,
  type IntegrationTestContext,
} from "../../../test-utils/integration";

describe("spending integration", () => {
  // Holds context for test suite, including the app, db client, and access token
  let ctx: IntegrationTestContext;
  let app: Express;
  let prisma: PrismaClient;
  let ownerAccessToken: string;

  /**
   * Before all tests:
   * - Spin up the integration test context (app, prisma, DB, etc)
   * - Log in as a demo user and acquire access token for authenticated requests
   */
  beforeAll(async () => {
    ctx = await setupIntegrationTestContext();
    app = ctx.app;
    prisma = ctx.prisma;

    // Sign in as demo user and retrieve owner access token
    const demoRes = await request(app).post("/api/v1/auth/demo").send({});
    ownerAccessToken = demoRes.body.data.accessToken;
  }, 120000);

  /**
   * After all tests:
   * - Teardown and cleanup test context (DB, containers, etc)
   */
  afterAll(async () => {
    await teardownIntegrationTestContext();
  }, 120000);

  /** Returns the proper Authorization header for requests */
  const authHeader = () => ({
    Authorization: `Bearer ${ownerAccessToken}`,
  });

  /**
   * Helper to create a new household for testing.
   * @param name Household name
   * @returns {string} The created household's ID
   */
  const createHousehold = async (name: string) => {
    const res = await request(app)
      .post("/api/v1/households")
      .set(authHeader())
      .send({ name });
    return res.body.data.id as string;
  };

  /**
   * Helper to create an account for a given household.
   * @param householdId Household foreign key
   * @param data Account creation params (optional)
   * @returns {any} The created account object
   */
  const createAccount = async (
    householdId: string,
    data: {
      name?: string;
      type?: "checking" | "savings" | "investment" | "credit";
      currentBalance?: number;
    } = {}
  ) => {
    const res = await request(app)
      .post(`/api/v1/households/${householdId}/accounts`)
      .set(authHeader())
      .send({
        name: data.name ?? `Account ${Date.now()}`,
        type: data.type ?? "checking",
        currentBalance: data.currentBalance,
      });
    return res.body.data;
  };

  /**
   * TEST: Create a new account in a household and validate initial balances.
   * EXPECT:
   *   - Response status 201 (created)
   *   - Returned account has correct name and balances matching the input
   */
  it("creates an account with initial balances", async () => {
    const householdId = await createHousehold(`Spending Accounts ${Date.now()}`);

    const accountRes = await request(app)
      .post(`/api/v1/households/${householdId}/accounts`)
      .set(authHeader())
      .send({
        name: "Checking",
        type: "checking",
        currentBalance: 1234.56,
      });

    // Should create account, reflecting the provided balance
    expect(accountRes.status).toBe(201);
    expect(accountRes.body.data.name).toBe("Checking");
    expect(accountRes.body.data.balance.currentBalance).toBeCloseTo(1234.56, 2);
    expect(accountRes.body.data.balance.availableBalance).toBeCloseTo(1234.56, 2);
  });

  /**
   * TEST: Create a 'spend' transaction without specifying a category.
   *   - The account balance should decrease.
   *   - The transaction should auto-assign the "Other" category.
   * EXPECT:
   *   - Transaction is created (201)
   *   - Transaction type is "spend"
   *   - Category is set to "Other"
   *   - The account's current balance is decremented by the spend amount
   */
  it("creates a spend transaction, updates balance, and defaults category when missing", async () => {
    const householdId = await createHousehold(`Spending Txn ${Date.now()}`);
    const account = await createAccount(householdId, { currentBalance: 1000 });

    // Create a spend transaction without a category
    const txnRes = await request(app)
      .post(`/api/v1/households/${householdId}/transactions`)
      .set(authHeader())
      .send({
        accountId: account.id,
        txnType: "spend",
        amount: 150,
        merchant: "Test Store",
      });

    expect(txnRes.status).toBe(201);
    expect(txnRes.body.data.txnType).toBe("spend");
    expect(txnRes.body.data.category.name).toBe("Other"); // Category auto-assigned

    // Verify account balance adjustment
    const accountDetail = await request(app)
      .get(`/api/v1/accounts/${account.id}`)
      .set(authHeader());

    expect(accountDetail.status).toBe(200);
    expect(accountDetail.body.data.balance.currentBalance).toBeCloseTo(850, 2);
  });

  /**
   * TEST: Filtering account transactions by category.
   *   - Create two categories (Dining, Travel)
   *   - Create two transactions, each using a different category
   *   - Query only one category and check results.
   * EXPECT:
   *   - Only the matching spent transaction appears in the response items
   *   - Returned merchant/category pair is as expected
   */
  it("filters transactions by category", async () => {
    const householdId = await createHousehold(`Spending Filters ${Date.now()}`);
    const account = await createAccount(householdId, { currentBalance: 500 });

    // Create custom categories
    const diningCategoryRes = await request(app)
      .post(`/api/v1/households/${householdId}/categories`)
      .set(authHeader())
      .send({ name: "Dining" });
    const travelCategoryRes = await request(app)
      .post(`/api/v1/households/${householdId}/categories`)
      .set(authHeader())
      .send({ name: "Travel" });

    const diningCategoryId = diningCategoryRes.body.data.id as string;
    const travelCategoryId = travelCategoryRes.body.data.id as string;

    // Create one Dining and one Travel transaction
    await request(app)
      .post(`/api/v1/households/${householdId}/transactions`)
      .set(authHeader())
      .send({
        accountId: account.id,
        txnType: "spend",
        amount: 40,
        merchant: "Cafe",
        categoryId: diningCategoryId,
      });

    await request(app)
      .post(`/api/v1/households/${householdId}/transactions`)
      .set(authHeader())
      .send({
        accountId: account.id,
        txnType: "spend",
        amount: 60,
        merchant: "Airline",
        categoryId: travelCategoryId,
      });

    // Filter by Dining category, should only get "Cafe"
    const filteredRes = await request(app)
      .get(`/api/v1/households/${householdId}/transactions`)
      .set(authHeader())
      .query({ categoryId: diningCategoryId });

    expect(filteredRes.status).toBe(200);
    const items = filteredRes.body.data.items as Array<{ merchant: string; category: { id: string } }>;
    expect(items.length).toBe(1);
    expect(items[0].merchant).toBe("Cafe");
    expect(items[0].category.id).toBe(diningCategoryId);
  });

  /**
   * TEST: Aggregating a household's spending summary for the current month.
   *   - Create two 'spend' transactions and one 'receive' (income) transaction
   *   - Query summary for "This Month"
   * EXPECT:
   *   - totalSpent is the sum of spent transactions
   *   - percentUsed reflects the percentage of a default (5000) budget
   *   - At least one category appears in summary breakdown
   */
  it("aggregates spending summary for the current period", async () => {
    const householdId = await createHousehold(`Spending Summary ${Date.now()}`);
    const account = await createAccount(householdId, { currentBalance: 2000 });

    // Two spends, one refund
    await request(app)
      .post(`/api/v1/households/${householdId}/transactions`)
      .set(authHeader())
      .send({
        accountId: account.id,
        txnType: "spend",
        amount: 200,
        merchant: "Groceries",
      });

    await request(app)
      .post(`/api/v1/households/${householdId}/transactions`)
      .set(authHeader())
      .send({
        accountId: account.id,
        txnType: "spend",
        amount: 50,
        merchant: "Snacks",
      });

    await request(app)
      .post(`/api/v1/households/${householdId}/transactions`)
      .set(authHeader())
      .send({
        accountId: account.id,
        txnType: "receive",
        amount: 100,
        merchant: "Refund",
      });

    // Query spending summary for the current month
    const summaryRes = await request(app)
      .get(`/api/v1/households/${householdId}/spending`)
      .set(authHeader())
      .query({ period: "This Month" });

    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.data.totalSpent).toBeCloseTo(250, 2); // total spent (200+50)
    expect(summaryRes.body.data.percentUsed).toBeCloseTo((250 / 5000) * 100, 2); // based on 5000 default budget
    expect(summaryRes.body.data.categories.length).toBeGreaterThanOrEqual(1); // summary includes at least one category
  });

  /**
   * TEST: Returns investment summary for a household with an investment account.
   *   - Create one investment account with a large balance
   *   - Call the investments/summary endpoint for that household
   * EXPECT:
   *   - totalValue is equal to the account balance
   *   - snapshots is an array with at least one entry representing account value over time
   *   - Most recent snapshot accurately reflects account value
   */
  it("returns investment summary totals and snapshots", async () => {
    const householdId = await createHousehold(`Investment Summary ${Date.now()}`);
    await createAccount(householdId, { name: "Investment", type: "investment", currentBalance: 7500 });

    const summaryRes = await request(app)
      .get(`/api/v1/households/${householdId}/investments/summary`)
      .set(authHeader())
      .query({ range: "ALL" });

    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.data.totalValue).toBeCloseTo(7500, 2); // should match created account
    expect(Array.isArray(summaryRes.body.data.snapshots)).toBe(true);
    expect(summaryRes.body.data.snapshots.length).toBeGreaterThanOrEqual(1);
    const latest = summaryRes.body.data.snapshots[summaryRes.body.data.snapshots.length - 1];
    expect(latest.totalValue).toBeCloseTo(7500, 2);
  });
});
