import { Router } from "express";
import { optionalAuth } from "../../middleware/authOptional";
import { validate } from "../../middleware/validate";
import { acceptInviteSchema } from "./households.schemas";
import { acceptInvite, getInvite } from "./households.service";

export const invitesRouter = Router();

invitesRouter.get("/:token", async (req, res, next) => {
  try {
    const invite = await getInvite(req.params.token);
    res.json({ data: invite });
  } catch (err) {
    next(err);
  }
});

invitesRouter.post("/:token/accept", optionalAuth, validate(acceptInviteSchema), async (req, res, next) => {
  try {
    const result = await acceptInvite(req.params.token, {
      userId: req.user?.id,
      email: req.body.email,
    });
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});
