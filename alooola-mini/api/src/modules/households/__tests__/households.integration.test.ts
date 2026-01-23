/**
 * Integration tests for the Households module.
 *
 * These tests validate the behavior of the Households API endpoints and
 * the business logic for the following flows:
 *  - Household creation, listing, and lookup
 *  - Member listing for a household
 *  - Household invitations: inviting, accepting, and declining
 *
 * All tests are end-to-end, using a real (test) database via Prisma and
 * real HTTP requests via Supertest.
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

describe("households integration", () => {
  // Test context and helpers
  let ctx: IntegrationTestContext;
  let app: Express;
  let prisma: PrismaClient;
  let ownerAccessToken: string;
  let ownerUserId: string;

  /**
   * Before all tests:
   *   - Sets up test context (database, app server, etc)
   *   - Creates a demo user and stores their token/id
   */
  beforeAll(async () => {
    ctx = await setupIntegrationTestContext();
    app = ctx.app;
    prisma = ctx.prisma;

    // Create a demo user (owner for most test cases)
    const demoRes = await request(app).post("/api/v1/auth/demo").send({});
    ownerAccessToken = demoRes.body.data.accessToken;
    ownerUserId = demoRes.body.data.user.id;
  }, 120000);

  /**
   * After all tests:
   *   - Tears down test context and cleans up db
   */
  afterAll(async () => {
    await teardownIntegrationTestContext();
  }, 120000);

  /**
   * Helper to add a Bearer Authorization header (used in almost all API requests).
   */
  const authHeader = (token: string) => ({
    Authorization: `Bearer ${token}`,
  });

  /**
   * Test: Household creation, listing, and detail lookup by the authenticated user
   *
   * Expectations:
   *  - API should allow creation of household and return the right properties (name)
   *  - Listing should include the created household
   *  - Detail endpoint should return exactly the created household
   */
  it("creates, lists, and gets a household for the authenticated user", async () => {
    const householdName = `Test Household ${Date.now()}`;

    // Create household
    const createRes = await request(app)
      .post("/api/v1/households")
      .set(authHeader(ownerAccessToken))
      .send({ name: householdName });

    expect(createRes.status).toBe(200); // Should succeed
    expect(createRes.body.data.name).toBe(householdName);
    const householdId = createRes.body.data.id as string;

    // List households and verify the created one is present
    const listRes = await request(app)
      .get("/api/v1/households")
      .set(authHeader(ownerAccessToken));
    expect(listRes.status).toBe(200);
    const householdIds = (listRes.body.data as Array<{ id: string }>).map((h) => h.id);
    expect(householdIds).toContain(householdId);

    // Retrieve household details by ID
    const detailRes = await request(app)
      .get(`/api/v1/households/${householdId}`)
      .set(authHeader(ownerAccessToken));

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.id).toBe(householdId);
    expect(detailRes.body.data.name).toBe(householdName);
  });

  /**
   * Test: Member listing for a household (should always include the owner after creation)
   *
   * Expectations:
   *  - Can list members for the household
   *  - The owner is present in the member list with role "owner"
   */
  it("lists members for a household (owner included)", async () => {
    // Create household for this test
    const createRes = await request(app)
      .post("/api/v1/households")
      .set(authHeader(ownerAccessToken))
      .send({ name: `Members Household ${Date.now()}` });

    const householdId = createRes.body.data.id as string;

    // List household members
    const membersRes = await request(app)
      .get(`/api/v1/households/${householdId}/members`)
      .set(authHeader(ownerAccessToken));

    expect(membersRes.status).toBe(200);
    const members = membersRes.body.data as Array<{ userId: string; role: string }>;
    expect(members.length).toBeGreaterThanOrEqual(1); // At least the owner
    const ownerMember = members.find((m) => m.userId === ownerUserId);
    expect(ownerMember?.role).toBe("owner"); // Owner should have role "owner"
  });

  /**
   * Test: Invite flow - owner invites a user, invite is accepted, and new member is added and receives tokens
   *
   * Expectations:
   *  - Invite can be created for an email, status is "pending" and token is present
   *  - Accepting the invite with the right email works: status becomes "accepted"
   *  - Response contains the household membership status and authentication tokens
   *  - DB reflects the invite as "accepted" and membership is added with correct status
   */
  it("creates an invite and accepts it, granting membership and tokens", async () => {
    const householdName = `Invite Household ${Date.now()}`;
    const inviteEmail = `invitee+${Date.now()}@alooola.dev`;

    // Create household
    const createRes = await request(app)
      .post("/api/v1/households")
      .set(authHeader(ownerAccessToken))
      .send({ name: householdName });

    const householdId = createRes.body.data.id as string;

    // Owner invites someone
    const inviteRes = await request(app)
      .post(`/api/v1/households/${householdId}/invites`)
      .set(authHeader(ownerAccessToken))
      .send({ email: inviteEmail });

    expect(inviteRes.status).toBe(200); // Invite sent successfully
    expect(inviteRes.body.data.email).toBe(inviteEmail);
    expect(inviteRes.body.data.status).toBe("pending");
    const token = inviteRes.body.data.token as string;

    // Accept the invitation using the token
    const acceptRes = await request(app)
      .post(`/api/v1/invites/${token}/accept`)
      .send({ email: inviteEmail });

    expect(acceptRes.status).toBe(200); // Accept succeeds
    expect(acceptRes.body.data.membership.status).toBe("accepted");
    expect(acceptRes.body.data.tokens.accessToken).toBeTruthy();
    expect(acceptRes.body.data.tokens.refreshToken).toBeTruthy();

    // Confirm invite status updated in DB
    const updatedInvite = await prisma.invite.findUniqueOrThrow({ where: { token } });
    expect(updatedInvite.status).toBe("accepted");

    // Confirm household membership is added in DB
    const membership = await prisma.householdMember.findFirst({
      where: {
        householdId,
        user: { email: inviteEmail },
      },
      include: { user: true },
    });

    expect(membership).toBeTruthy();
    expect(membership?.status).toBe("accepted");
  });

  /**
   * Test: Declining an invite by a user whose email does not match the invited email
   *
   * Expectations:
   *  - Declining the invite as a different (non-invited) authenticated user should not succeed (400)
   *  - Invite status should remain "pending" in database
   */
  it("rejects declining an invite when the authenticated user email does not match", async () => {
    const inviteEmail = `decline-test+${Date.now()}@alooola.dev`;

    // Create a household
    const createRes = await request(app)
      .post("/api/v1/households")
      .set(authHeader(ownerAccessToken))
      .send({ name: `Decline Household ${Date.now()}` });

    const householdId = createRes.body.data.id as string;

    // Create invite for the demo household
    const inviteRes = await request(app)
      .post(`/api/v1/households/${householdId}/invites`)
      .set(authHeader(ownerAccessToken))
      .send({ email: inviteEmail });

    const token = inviteRes.body.data.token as string;

    // Sign in as a disallowed (random demo) user
    const otherUserRes = await request(app).post("/api/v1/auth/demo").send({});
    const otherToken = otherUserRes.body.data.accessToken as string;

    // Attempt to decline the invite (should fail, wrong user)
    const declineRes = await request(app)
      .post(`/api/v1/invites/${token}/decline`)
      .set(authHeader(otherToken));

    expect(declineRes.status).toBe(400); // Should not allow decline from wrong user

    // Confirm invite remains pending
    const inviteAfter = await prisma.invite.findUnique({ where: { token } });
    expect(inviteAfter?.status).toBe("pending");
  });
});
