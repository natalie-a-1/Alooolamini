/**
 * Route handlers for the watchlist module.
 */
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { watchlistItemSchema, watchlistCheckSchema } from "./watchlist.schemas";
import {
  addToWatchlist,
  isInWatchlist,
  listWatchlist,
  removeFromWatchlist,
} from "./watchlist.service";

/** Router for watchlist routes. */
export const watchlistRouter = Router();

/** List all watchlist items for the current user. */
watchlistRouter.get("/watchlist", requireAuth, async (req, res, next) => {
  try {
    const items = await listWatchlist(req.user!.id);
    res.json({ data: items });
  } catch (err) {
    next(err);
  }
});

/** Check if a portfolio is in user's watchlist. */
watchlistRouter.get(
  "/watchlist/:portfolioId",
  requireAuth,
  validate(watchlistCheckSchema),
  async (req, res, next) => {
    try {
      const inWatchlist = await isInWatchlist(req.user!.id, req.params.portfolioId);
      res.json({ data: { inWatchlist } });
    } catch (err) {
      next(err);
    }
  }
);

/** Add a portfolio to user's watchlist. */
watchlistRouter.post(
  "/watchlist",
  requireAuth,
  validate(watchlistItemSchema),
  async (req, res, next) => {
    try {
      const item = await addToWatchlist(req.user!.id, req.body.portfolioId);
      res.status(201).json({ data: item });
    } catch (err) {
      next(err);
    }
  }
);

/** Remove a portfolio from user's watchlist. */
watchlistRouter.delete(
  "/watchlist/:portfolioId",
  requireAuth,
  validate(watchlistCheckSchema),
  async (req, res, next) => {
    try {
      await removeFromWatchlist(req.user!.id, req.params.portfolioId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);
