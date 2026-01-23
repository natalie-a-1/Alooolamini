/**
 * Express Router for Invite-related routes.
 *
 * Handles invite link resolution, acceptance, and declining
 * for the household invitation process.
 *
 * Endpoints:
 *   - GET    /:token           Get invite info (public)
 *   - POST   /:token/accept    Accept an invite (optional auth)
 *   - POST   /:token/decline   Decline an invite (authenticated)
 */
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { optionalAuth } from "../../middleware/authOptional";
import { validate } from "../../middleware/validate";
import { acceptInviteSchema } from "./households.schemas";
import { acceptInvite, declineInvite, getInvite } from "./households.service";

/** Express router instance for invite-related endpoints. */
export const invitesRouter = Router();

/**
 * @route GET /invites/:token
 * @desc Retrieve details for a pending invite.
 * @access Public
 * @returns { data: Invite }
 */
invitesRouter.get(
  "/:token",
  async (req, res, next) => {
    try {
      const invite = await getInvite(req.params.token);
      res.json({ data: invite });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route POST /invites/:token/accept
 * @desc Accept an invite and join the household.
 * @access Authenticated or unauthenticated (optionalAuth)
 * @body { email?: string }     For users not yet signed up.
 * @returns { data: { ...invite, ...user, ...tokens } }
 */
invitesRouter.post(
  "/:token/accept",
  optionalAuth,
  validate(acceptInviteSchema),
  async (req, res, next) => {
    try {
      const result = await acceptInvite(req.params.token, {
        userId: req.user?.id,
        email: req.body.email,
      });
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route POST /invites/:token/decline
 * @desc Decline a household invite (removes or invalidates invite).
 * @access Authenticated users only
 * @returns { data: { success: boolean } }
 */
invitesRouter.post(
  "/:token/decline",
  requireAuth,
  async (req, res, next) => {
    try {
      const result = await declineInvite(req.params.token, req.user!.id);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
);
