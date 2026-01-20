/**
 * Route handlers for the households module.
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
  listHouseholds,
  listMembers,
  updateMember,
} from "./households.service";

/** Router for households routes. */
export const householdsRouter = Router();

householdsRouter.post("/", requireAuth, validate(createHouseholdSchema), async (req, res, next) => {
  try {
    const household = await createHousehold(req.user!.id, req.body.name);
    res.json({ data: household });
  } catch (err) {
    next(err);
  }
});

householdsRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const households = await listHouseholds(req.user!.id);
    res.json({ data: households });
  } catch (err) {
    next(err);
  }
});

householdsRouter.get("/:householdId", requireAuth, async (req, res, next) => {
  try {
    const household = await getHouseholdDetail(req.user!.id, req.params.householdId);
    res.json({ data: household });
  } catch (err) {
    next(err);
  }
});

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

householdsRouter.patch(
  "/:householdId/members/:memberId",
  requireAuth,
  requireHouseholdRole(["owner"]),
  validate(updateMemberSchema),
  async (req, res, next) => {
    try {
      const member = await updateMember(req.params.householdId, req.params.memberId, req.body);
      res.json({ data: member });
    } catch (err) {
      next(err);
    }
  }
);

householdsRouter.post(
  "/:householdId/invites",
  requireAuth,
  requireHouseholdRole(["owner"]),
  validate(createInviteSchema),
  async (req, res, next) => {
    try {
      const invite = await createInvite(req.params.householdId, req.body.email);
      res.json({ data: invite });
    } catch (err) {
      next(err);
    }
  }
);
