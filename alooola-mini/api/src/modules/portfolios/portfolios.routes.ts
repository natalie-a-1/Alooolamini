/**
 * Route handlers for the portfolios module.
 */
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  portfolioDetailSchema,
} from "./portfolios.schemas";
import { getPortfolio, listHoldings, listPortfolios } from "./portfolios.service";

/** Router for portfolios routes. */
export const portfoliosRouter = Router();

portfoliosRouter.get("/", requireAuth, async (_req, res, next) => {
  try {
    const portfolios = await listPortfolios();
    res.json({ data: portfolios });
  } catch (err) {
    next(err);
  }
});

portfoliosRouter.get("/:portfolioId", requireAuth, validate(portfolioDetailSchema), async (req, res, next) => {
  try {
    const portfolio = await getPortfolio(req.params.portfolioId);
    res.json({ data: portfolio });
  } catch (err) {
    next(err);
  }
});

portfoliosRouter.get("/:portfolioId/holdings", requireAuth, validate(portfolioDetailSchema), async (req, res, next) => {
  try {
    const holdings = await listHoldings(req.params.portfolioId);
    res.json({ data: holdings });
  } catch (err) {
    next(err);
  }
});
