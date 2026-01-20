/**
 * Route handlers for the portfolios module.
 */
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireHouseholdRole } from "../../middleware/requireHouseholdRole";
import { validate } from "../../middleware/validate";
import { createPositionSchema, listPositionsSchema, listSnapshotsSchema } from "./portfolios.schemas";
import { createPosition, listPositions, listSnapshots } from "./portfolios.service";

/** Router for portfolio household routes. */
export const portfolioHouseholdRouter = Router();

portfolioHouseholdRouter.post(
  "/households/:householdId/portfolio-positions",
  requireAuth,
  requireHouseholdRole(["owner", "member"]),
  validate(createPositionSchema),
  async (req, res, next) => {
    try {
      const position = await createPosition(req.user!.id, req.params.householdId, req.body);
      res.json({ data: position });
    } catch (err) {
      next(err);
    }
  }
);

portfolioHouseholdRouter.get(
  "/households/:householdId/portfolio-positions",
  requireAuth,
  requireHouseholdRole(["owner", "member", "viewer"]),
  validate(listPositionsSchema),
  async (req, res, next) => {
    try {
      const positions = await listPositions(req.user!.id, req.params.householdId);
      res.json({ data: positions });
    } catch (err) {
      next(err);
    }
  }
);

portfolioHouseholdRouter.get(
  "/households/:householdId/portfolio-snapshots",
  requireAuth,
  requireHouseholdRole(["owner", "member", "viewer"]),
  validate(listSnapshotsSchema),
  async (req, res, next) => {
    try {
      const range = typeof req.query.range === "string" ? req.query.range : undefined;
      const snapshots = await listSnapshots(req.user!.id, req.params.householdId, range);
      res.json({ data: snapshots });
    } catch (err) {
      next(err);
    }
  }
);
