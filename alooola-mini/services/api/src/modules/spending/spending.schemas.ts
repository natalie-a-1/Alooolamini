import { z } from "zod";

export const listAccountsSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ householdId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

export const accountDetailSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ accountId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

export const listCategoriesSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ householdId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
  }),
  params: z.object({ householdId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

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
    txnType: z.enum(["debit", "credit"]).optional(),
  }).optional().default({}),
});

export const transactionDetailSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ transactionId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

export const patchTransactionSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid().optional(),
    note: z.string().max(500).optional(),
    attributedUserId: z.string().uuid().optional(),
  }),
  params: z.object({ transactionId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});
