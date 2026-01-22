/**
 * Spending Module Route Handlers
 *
 * Provides REST API endpoints for managing household spending:
 * - Accounts (list, detail, create)
 * - Investments summary
 * - Categories (list, create)
 * - Spending summaries
 * - Transactions (list, detail, create, update)
 *
 * All endpoints require authentication and authorization per household member role.
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

/** Express Router for spending-related endpoints */
export const spendingRouter = Router();

/**
 * @route   GET /households/:householdId/accounts
 * @desc    List all financial accounts for a household
 * @access  Requires auth, any member role
 * @query   See listAccountsSchema
 */
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

/**
 * @route   POST /households/:householdId/accounts
 * @desc    Create a new financial account in the household
 * @access  Requires auth, 'owner' or 'member' roles
 * @body    See createAccountSchema
 */
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

/**
 * @route   GET /households/:householdId/investments/summary
 * @desc    Retrieve summarized investment performance/positions for a household
 * @access  Requires auth, any member role
 * @query   ?range=...
 */
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

/**
 * @route   GET /accounts/:accountId
 * @desc    Retrieve details for a single account
 * @access  Requires auth, accepted member of household
 * @param   accountId
 */
spendingRouter.get(
  "/accounts/:accountId",
  requireAuth,
  validate(accountDetailSchema),
  async (req, res, next) => {
    try {
      const account = await getAccount(req.user!.id, req.params.accountId);
      res.json({ data: account });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route   GET /households/:householdId/categories
 * @desc    List all transaction categories for a household
 * @access  Requires auth, any member role
 */
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

/**
 * @route   POST /households/:householdId/categories
 * @desc    Add a new transaction category to a household
 * @access  Requires auth, 'owner' or 'member' roles
 */
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

/**
 * @route   GET /households/:householdId/spending
 * @desc    Get aggregate household spending over a period
 * @access  Requires auth, any member role
 * @query   ?period=month|year|...
 */
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

/**
 * @route   GET /households/:householdId/transactions
 * @desc    List transactions (paginated, filterable)
 * @access  Requires auth, any member role
 * @query   See listTransactionsSchema
 */
spendingRouter.get(
  "/households/:householdId/transactions",
  requireAuth,
  requireHouseholdRole(["owner", "member", "viewer"]),
  validate(listTransactionsSchema),
  async (req, res, next) => {
    try {
      const { items, nextCursor, hasMore } = await listTransactions(
        req.params.householdId,
        req.query
      );
      res.json({ data: { items, nextCursor, hasMore } });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @route   POST /households/:householdId/transactions
 * @desc    Create a transaction in a household
 * @access  Requires auth, 'owner' or 'member' roles
 * @body    See createTransactionSchema
 */
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

/**
 * @route   GET /transactions/:transactionId
 * @desc    Retrieve a single transaction by ID
 * @access  Requires auth, accepted household member
 * @param   transactionId
 */
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

/**
 * @route   PATCH /transactions/:transactionId
 * @desc    Edit (patch) an existing transaction
 * @access  Requires auth, accepted household member
 * @body    See patchTransactionSchema
 */
spendingRouter.patch(
  "/transactions/:transactionId",
  requireAuth,
  validate(patchTransactionSchema),
  async (req, res, next) => {
    try {
      const transaction = await updateTransaction(
        req.user!.id,
        req.params.transactionId,
        req.body
      );
      res.json({ data: transaction });
    } catch (err) {
      next(err);
    }
  }
);
