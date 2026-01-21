/**
 * Route handlers for the onboarding module.
 */
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { 
  completeOnboardingSchema,
  joinHouseholdSchema,
  onboardingMeSchema, 
  onboardingOptionsSchema 
} from "./onboarding.schemas";
import { 
  completeOnboarding,
  getOnboardingForUser, 
  getOnboardingOptions, 
  joinHouseholdWithInviteCode,
  upsertOnboarding 
} from "./onboarding.service";

/** Router for onboarding routes. */
export const onboardingRouter = Router();

onboardingRouter.get("/options", validate(onboardingOptionsSchema), async (_req, res, next) => {
  try {
    const data = await getOnboardingOptions();
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

onboardingRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const data = await getOnboardingForUser(req.user!.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

onboardingRouter.put("/me", requireAuth, validate(onboardingMeSchema), async (req, res, next) => {
  try {
    const data = await upsertOnboarding(req.user!.id, req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

onboardingRouter.post("/household/join", requireAuth, validate(joinHouseholdSchema), async (req, res, next) => {
  try {
    const data = await joinHouseholdWithInviteCode(req.user!.id, req.body.inviteCode);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

onboardingRouter.post("/complete", requireAuth, validate(completeOnboardingSchema), async (req, res, next) => {
  try {
    const data = await completeOnboarding(req.user!.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});
