/**
 * Route handlers for the mutual funds module.
 */
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { getMutualFundPerformance, getMutualFundQuote, listMutualFunds } from "./mutual-funds.service";

/** Router for mutual funds routes. */
export const mutualFundsRouter = Router();

/** List mutual funds for discovery. */
mutualFundsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const keywords =
      typeof req.query.keywords === "string" ? req.query.keywords : undefined;
    const limitValue =
      typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
    const limit = limitValue && Number.isFinite(limitValue) ? limitValue : undefined;
    const funds = await listMutualFunds({ keywords, limit });
    res.json({ data: funds });
  } catch (err) {
    next(err);
  }
});

/** Get monthly performance for a mutual fund symbol. */
mutualFundsRouter.get("/:symbol/performance", requireAuth, async (req, res, next) => {
  try {
    const performance = await getMutualFundPerformance(req.params.symbol);
    res.json({ data: performance });
  } catch (err) {
    next(err);
  }
});

/** Get latest quote for a mutual fund symbol. */
mutualFundsRouter.get("/:symbol/quote", requireAuth, async (req, res, next) => {
  try {
    const quote = await getMutualFundQuote(req.params.symbol);
    res.json({ data: quote });
  } catch (err) {
    next(err);
  }
});
