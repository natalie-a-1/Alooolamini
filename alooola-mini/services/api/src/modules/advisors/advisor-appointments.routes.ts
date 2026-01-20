import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { bookAppointmentSchema } from "./advisors.schemas";
import { bookAppointment } from "./advisors.service";

export const advisorAppointmentsRouter = Router();

advisorAppointmentsRouter.post("/advisor-appointments", requireAuth, validate(bookAppointmentSchema), async (req, res, next) => {
  try {
    const appointment = await bookAppointment(req.user!.id, req.body);
    res.json({ data: appointment });
  } catch (err) {
    next(err);
  }
});
