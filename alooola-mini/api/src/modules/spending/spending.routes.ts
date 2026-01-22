/**
 * Route handlers for the spending module.
 */
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireHouseholdRole } from "../../middleware/requireHouseholdRole";
import { validate } from "../../middleware/validate";
import {
  accountDetailSchema,
  createAccountSchema,
  createTransactionSchema,
  createCategorySchema,
  listAccountsSchema,
  listCategoriesSchema,
  listTransactionsSchema,
  patchTransactionSchema,
  spendingSummarySchema,
  transactionDetailSchema,
  investmentSummarySchema,
} from "./spending.schemas";
import {
  createAccount,
  createTransaction,
  createCategory,
  getAccount,
  getInvestmentSummary,
  getSpendingSummary,
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

spendingRouter.post(
  "/households/:householdId/accounts",
  requireAuth,
  requireHouseholdRole(["owner", "member"]),
  validate(createAccountSchema),
  async (req, res, next) => {
    try {
      const account = await createAccount(req.params.householdId, req.body);
      res.status(201).json({ data: account });
    } catch (err) {
      next(err);
    }
  }
);

spendingRouter.get(
  "/households/:householdId/investments/summary",
  requireAuth,
  requireHouseholdRole(["owner", "member", "viewer"]),
  validate(investmentSummarySchema),
  async (req, res, next) => {
    try {
      const range = typeof req.query.range === "string" ? req.query.range : undefined;
      const summary = await getInvestmentSummary(req.user!.id, req.params.householdId, range);
      res.json({ data: summary });
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
  "/households/:householdId/spending",
  requireAuth,
  requireHouseholdRole(["owner", "member", "viewer"]),
  validate(spendingSummarySchema),
  async (req, res, next) => {
    try {
      const period = typeof req.query.period === "string" ? req.query.period : undefined;
      const summary = await getSpendingSummary(req.params.householdId, period);
      res.json({ data: summary });
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
      res.json({ data: { items: result.items, nextCursor: result.nextCursor, hasMore: result.hasMore } });
    } catch (err) {
      next(err);
    }
  }
);

spendingRouter.post(
  "/households/:householdId/transactions",
  requireAuth,
  requireHouseholdRole(["owner", "member"]),
  validate(createTransactionSchema),
  async (req, res, next) => {
    try {
      const txn = await createTransaction(req.user!.id, req.params.householdId, req.body);
      res.status(201).json({ data: txn });
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
