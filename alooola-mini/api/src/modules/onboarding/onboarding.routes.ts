/**
 * @file onboarding.routes.ts
 * @description Express router for user onboarding flows including user onboarding state,
 * onboarding options, household joining, onboarding submission, and completion.
 */

import { Router } from "express";

// Middleware imports
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";

// Validation schemas
import {
  onboardingOptionsSchema,
  onboardingMeSchema,
  joinHouseholdSchema,
  completeOnboardingSchema,
} from "./onboarding.schemas";

// Service function imports
import {
  getOnboardingOptions,
  getOnboardingForUser,
  upsertOnboarding,
  joinHouseholdWithInviteCode,
  completeOnboarding,
} from "./onboarding.service";

/**
 * Express router instance for onboarding-related routes.
 */
export const onboardingRouter = Router();

/**
 * @route GET /options
 * @desc Get available onboarding options (goals, risk tolerances, starter amounts).
 * @access Public
 */
onboardingRouter.get(
  "/options",
  validate(onboardingOptionsSchema),
  async (_req, res, next) => {
    try {
      const data = await getOnboardingOptions();
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route GET /me
 * @desc Get onboarding progress and form data for the authenticated user.
 * @access Private
 */
onboardingRouter.get(
  "/me",
  requireAuth,
  async (req, res, next) => {
    try {
      const data = await getOnboardingForUser(req.user!.id);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route PUT /me
 * @desc Upsert (save) onboarding form data for the authenticated user.
 * @access Private
 */
onboardingRouter.put(
  "/me",
  requireAuth,
  validate(onboardingMeSchema),
  async (req, res, next) => {
    try {
      const data = await upsertOnboarding(req.user!.id, req.body);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route POST /household/join
 * @desc Join an existing household via invite code during onboarding.
 * @access Private
 */
onboardingRouter.post(
  "/household/join",
  requireAuth,
  validate(joinHouseholdSchema),
  async (req, res, next) => {
    try {
      const data = await joinHouseholdWithInviteCode(req.user!.id, req.body.inviteCode);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route POST /complete
 * @desc Complete onboarding for the authenticated user. Finalizes onboarding.
 * @access Private
 */
onboardingRouter.post(
  "/complete",
  requireAuth,
  validate(completeOnboardingSchema),
  async (req, res, next) => {
    try {
      const data = await completeOnboarding(req.user!.id);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }
);

