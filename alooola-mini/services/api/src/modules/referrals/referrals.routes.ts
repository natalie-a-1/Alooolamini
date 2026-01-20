import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createRateLimiter } from "../../middleware/rateLimit";
import { referralEventSchema } from "./referrals.schemas";
import { createReferralEvent, getOrCreateReferral, getReferralStats } from "./referrals.service";

export const referralsRouter = Router();

const referralLimiter = createRateLimiter(60 * 1000, 30);

referralsRouter.post("/me", requireAuth, async (req, res, next) => {
  try {
    const referral = await getOrCreateReferral(req.user!.id);
    res.json({ data: referral });
  } catch (err) {
    next(err);
  }
});

referralsRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const stats = await getReferralStats(req.user!.id);
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});

referralsRouter.post("/:code/events", referralLimiter, validate(referralEventSchema), async (req, res, next) => {
  try {
    const event = await createReferralEvent(req.params.code, req.body.eventType, req.body.meta);
    res.json({ data: event });
  } catch (err) {
    next(err);
  }
});
