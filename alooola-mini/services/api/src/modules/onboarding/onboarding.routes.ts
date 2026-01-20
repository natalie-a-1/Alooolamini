import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { onboardingMeSchema, onboardingOptionsSchema } from "./onboarding.schemas";
import { getOnboardingForUser, getOnboardingOptions, upsertOnboarding } from "./onboarding.service";

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
