import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { advisorSlotsSchema } from "./advisors.schemas";
import { listAdvisorSlots, listAdvisors } from "./advisors.service";

export const advisorsRouter = Router();

advisorsRouter.get("/", requireAuth, async (_req, res, next) => {
  try {
    const advisors = await listAdvisors();
    res.json({ data: advisors });
  } catch (err) {
    next(err);
  }
});

advisorsRouter.get("/:advisorId/slots", requireAuth, validate(advisorSlotsSchema), async (req, res, next) => {
  try {
    const slots = await listAdvisorSlots(req.params.advisorId);
    res.json({ data: slots });
  } catch (err) {
    next(err);
  }
});
