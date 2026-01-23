/**
 * Express Router for Household-related routes.
 * 
 * Provides CRUD operations for households, membership management,
 * and invitation flows. All routes require authentication.
 * 
 * Middleware:
 *  - requireAuth: Ensure user is authenticated.
 *  - validate: Validate request body using schemas.
 *  - requireHouseholdRole: Enforce household role for route access.
 */
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { requireHouseholdRole } from "../../middleware/requireHouseholdRole";
import {
  createHouseholdSchema,
  createInviteSchema,
  updateMemberSchema,
} from "./households.schemas";
import {
  createHousehold,
  createInvite,
  getHouseholdDetail,
  leaveHousehold,
  listHouseholds,
  listMembers,
  removeMember,
  updateMember,
} from "./households.service";

/** Express router instance for households. */
export const householdsRouter = Router();

/**
 * @route POST /households
 * @desc Create a new household
 * @access Authenticated users
 * @body { name: string }
 * @returns { data: Household }
 */
householdsRouter.post(
  "/",
  requireAuth,
  validate(createHouseholdSchema),
  async (req, res, next) => {
    try {
      const household = await createHousehold(req.user!.id, req.body.name);
      res.json({ data: household });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route GET /households
 * @desc List all households the authenticated user belongs to
 * @access Authenticated users
 * @returns { data: Household[] }
 * 
 * Note: This is an alias for GET /households/me to prevent 404s
 */
householdsRouter.get(
  "/",
  requireAuth,
  async (req, res, next) => {
    try {
      const households = await listHouseholds(req.user!.id);
      res.json({ data: households });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route GET /households/me
 * @desc List all households the authenticated user belongs to
 * @access Authenticated users
 * @returns { data: Household[] }
 */
householdsRouter.get(
  "/me",
  requireAuth,
  async (req, res, next) => {
    try {
      const households = await listHouseholds(req.user!.id);
      res.json({ data: households });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route GET /households/:householdId
 * @desc Get details for a specific household user is a member of
 * @access Authenticated users
 * @param householdId - Path param
 * @returns { data: Household }
 */
householdsRouter.get(
  "/:householdId",
  requireAuth,
  async (req, res, next) => {
    try {
      const household = await getHouseholdDetail(req.user!.id, req.params.householdId);
      res.json({ data: household });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route GET /households/:householdId/members
 * @desc List members of a household
 * @access Household role: owner, member, or viewer
 * @param householdId - Path param
 * @returns { data: Member[] }
 */
householdsRouter.get(
  "/:householdId/members",
  requireAuth,
  requireHouseholdRole(["owner", "member", "viewer"]),
  async (req, res, next) => {
    try {
      const members = await listMembers(req.params.householdId);
      res.json({ data: members });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route PATCH /households/:householdId/members/:memberId
 * @desc Update a member's role or information
 * @access Household role: owner
 * @body Partial<Member>
 * @param householdId - Path param
 * @param memberId - Path param
 * @returns { data: Member }
 */
householdsRouter.patch(
  "/:householdId/members/:memberId",
  requireAuth,
  requireHouseholdRole(["owner"]),
  validate(updateMemberSchema),
  async (req, res, next) => {
    try {
      const member = await updateMember(
        req.params.householdId,
        req.params.memberId,
        req.body
      );
      res.json({ data: member });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route DELETE /households/:householdId/members/:memberId
 * @desc Remove a member from the household
 * @access Household role: owner
 * @param householdId - Path param
 * @param memberId - Path param
 * @returns { data: any }
 */
householdsRouter.delete(
  "/:householdId/members/:memberId",
  requireAuth,
  requireHouseholdRole(["owner"]),
  async (req, res, next) => {
    try {
      const result = await removeMember(
        req.params.householdId,
        req.params.memberId,
        req.user!.id
      );
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route POST /households/:householdId/invites
 * @desc Create an invitation to join a household
 * @access Household role: owner
 * @body { email: string }
 * @param householdId - Path param
 * @returns { data: Invite }
 */
householdsRouter.post(
  "/:householdId/invites",
  requireAuth,
  requireHouseholdRole(["owner"]),
  validate(createInviteSchema),
  async (req, res, next) => {
    try {
      const invite = await createInvite(
        req.params.householdId,
        req.body.email,
        req.user!.id
      );
      res.json({ data: invite });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route DELETE /households/:householdId/leave
 * @desc User removes themselves from a household
 * @access Authenticated users
 * @param householdId - Path param
 * @returns { data: any }
 */
householdsRouter.delete(
  "/:householdId/leave",
  requireAuth,
  async (req, res, next) => {
    try {
      const result = await leaveHousehold(req.user!.id, req.params.householdId);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
);