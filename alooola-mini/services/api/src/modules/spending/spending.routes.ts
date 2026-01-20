/**
 * Route handlers for the spending module.
 */
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireHouseholdRole } from "../../middleware/requireHouseholdRole";
import { validate } from "../../middleware/validate";
import {
  accountDetailSchema,
  createCategorySchema,
  listAccountsSchema,
  listCategoriesSchema,
  listTransactionsSchema,
  patchTransactionSchema,
  transactionDetailSchema,
} from "./spending.schemas";
import {
  createCategory,
  getAccount,
  getTransaction,
  listAccounts,
  listCategories,
  listTransactions,
  updateTransaction,
} from "./spending.service";

/** Router for spending routes. */
export const spendingRouter = Router();

spendingRouter.get(
  "/households/:householdId/accounts",
  requireAuth,
  requireHouseholdRole(["owner", "member", "viewer"]),
  validate(listAccountsSchema),
  async (req, res, next) => {
    try {
      const accounts = await listAccounts(req.params.householdId);
      res.json({ data: accounts });
    } catch (err) {
      next(err);
    }
  }
);

spendingRouter.get("/accounts/:accountId", requireAuth, validate(accountDetailSchema), async (req, res, next) => {
  try {
    const account = await getAccount(req.user!.id, req.params.accountId);
    res.json({ data: account });
  } catch (err) {
    next(err);
  }
});

spendingRouter.get(
  "/households/:householdId/categories",
  requireAuth,
  requireHouseholdRole(["owner", "member", "viewer"]),
  validate(listCategoriesSchema),
  async (req, res, next) => {
    try {
      const categories = await listCategories(req.params.householdId);
      res.json({ data: categories });
    } catch (err) {
      next(err);
    }
  }
);

spendingRouter.post(
  "/households/:householdId/categories",
  requireAuth,
  requireHouseholdRole(["owner", "member"]),
  validate(createCategorySchema),
  async (req, res, next) => {
    try {
      const category = await createCategory(req.params.householdId, req.body.name);
      res.json({ data: category });
    } catch (err) {
      next(err);
    }
  }
);

spendingRouter.get(
  "/households/:householdId/transactions",
  requireAuth,
  requireHouseholdRole(["owner", "member", "viewer"]),
  validate(listTransactionsSchema),
  async (req, res, next) => {
    try {
      const result = await listTransactions(req.params.householdId, req.query);
      res.json({ data: result.items, meta: { nextCursor: result.nextCursor, hasMore: result.hasMore } });
    } catch (err) {
      next(err);
    }
  }
);

spendingRouter.get(
  "/transactions/:transactionId",
  requireAuth,
  validate(transactionDetailSchema),
  async (req, res, next) => {
    try {
    const transaction = await getTransaction(req.user!.id, req.params.transactionId);
      res.json({ data: transaction });
    } catch (err) {
      next(err);
    }
  }
);

spendingRouter.patch(
  "/transactions/:transactionId",
  requireAuth,
  validate(patchTransactionSchema),
  async (req, res, next) => {
    try {
      const transaction = await updateTransaction(req.user!.id, req.params.transactionId, req.body);
      res.json({ data: transaction });
    } catch (err) {
      next(err);
    }
  }
);
