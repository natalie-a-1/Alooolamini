/**
 * API route registration.
 */
import { Router } from "express";
import { authRouter } from "./modules/auth/auth.routes";
import { householdsRouter } from "./modules/households/households.routes";
import { invitesRouter } from "./modules/households/invites.routes";
import { spendingRouter } from "./modules/spending/spending.routes";
import { onboardingRouter } from "./modules/onboarding/onboarding.routes";
import { portfoliosRouter } from "./modules/portfolios/portfolios.routes";
import { portfolioHouseholdRouter } from "./modules/portfolios/portfolio-household.routes";
import { referralsRouter } from "./modules/referrals/referrals.routes";
import { assistantRouter } from "./modules/assistant/assistant.routes";
import { advisorsRouter } from "./modules/advisors/advisors.routes";
import { advisorAppointmentsRouter } from "./modules/advisors/advisor-appointments.routes";

/** Router for api routes. */
export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ data: { status: "healthy" } });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/households", householdsRouter);
apiRouter.use("/invites", invitesRouter);
apiRouter.use("/", spendingRouter);
apiRouter.use("/onboarding", onboardingRouter);
apiRouter.use("/portfolios", portfoliosRouter);
apiRouter.use("/", portfolioHouseholdRouter);
apiRouter.use("/referrals", referralsRouter);
apiRouter.use("/assistant", assistantRouter);
apiRouter.use("/advisors", advisorsRouter);
apiRouter.use("/", advisorAppointmentsRouter);
