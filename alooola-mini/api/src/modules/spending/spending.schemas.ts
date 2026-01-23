/**
 * Validation schemas for the spending module.
 */
import { z } from "zod";

/** Validation schema for list accounts. */
export const listAccountsSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ householdId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

/** Validation schema for account detail. */
export const accountDetailSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ accountId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

/** Validation schema for create account. */
export const createAccountSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    type: z.enum(["checking", "savings", "investment", "credit"]),
    institution: z.string().max(100).optional(),
    last4: z.string().length(4).optional(),
    currentBalance: z.number().nonnegative().optional(),
  }),
  params: z.object({ householdId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

/** Validation schema for list categories. */
export const listCategoriesSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ householdId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

/** Validation schema for create category. */
export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
  }),
  params: z.object({ householdId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

/** Validation schema for list transactions. */
export const listTransactionsSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ householdId: z.string().uuid() }),
  query: z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    q: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    accountId: z.string().uuid().optional(),
    attributedUserId: z.string().uuid().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    txnType: z.enum(["spend", "receive"]).optional(),
  }).optional().default({}),
});

/** Validation schema for create transaction. */
export const createTransactionSchema = z.object({
  body: z.object({
    accountId: z.string().uuid(),
    txnType: z.enum(["spend", "receive"]),
    amount: z.number().positive(),
    merchant: z.string().min(1).max(200),
    currency: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    note: z.string().max(500).optional(),
    attributedUserId: z.string().uuid().optional(),
  }),
  params: z.object({ householdId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

/** Validation schema for transaction detail. */
export const transactionDetailSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ transactionId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

/** Validation schema for patch transaction. */
export const patchTransactionSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid().optional(),
    note: z.string().max(500).optional(),
    attributedUserId: z.string().uuid().optional(),
  }),
  params: z.object({ transactionId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

/** Validation schema for spending summary. */
export const spendingSummarySchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ householdId: z.string().uuid() }),
  query: z.object({
    period: z.string().optional(),
  }).optional().default({}),
});

/** Validation schema for investment summary. */
export const investmentSummarySchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ householdId: z.string().uuid() }),
  query: z.object({
    range: z.enum(["1M", "3M", "6M", "1Y", "ALL"]).optional(),
  }).optional().default({}),
});
