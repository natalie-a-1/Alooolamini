"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchTransactionSchema = exports.transactionDetailSchema = exports.listTransactionsSchema = exports.createCategorySchema = exports.listCategoriesSchema = exports.accountDetailSchema = exports.listAccountsSchema = void 0;
const zod_1 = require("zod");
exports.listAccountsSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional().default({}),
    params: zod_1.z.object({ householdId: zod_1.z.string().uuid() }),
    query: zod_1.z.object({}).optional().default({}),
});
exports.accountDetailSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional().default({}),
    params: zod_1.z.object({ accountId: zod_1.z.string().uuid() }),
    query: zod_1.z.object({}).optional().default({}),
});
exports.listCategoriesSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional().default({}),
    params: zod_1.z.object({ householdId: zod_1.z.string().uuid() }),
    query: zod_1.z.object({}).optional().default({}),
});
exports.createCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
    }),
    params: zod_1.z.object({ householdId: zod_1.z.string().uuid() }),
    query: zod_1.z.object({}).optional().default({}),
});
exports.listTransactionsSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional().default({}),
    params: zod_1.z.object({ householdId: zod_1.z.string().uuid() }),
    query: zod_1.z.object({
        cursor: zod_1.z.string().optional(),
        limit: zod_1.z.coerce.number().int().min(1).max(100).optional(),
        q: zod_1.z.string().optional(),
        categoryId: zod_1.z.string().uuid().optional(),
        accountId: zod_1.z.string().uuid().optional(),
        attributedUserId: zod_1.z.string().uuid().optional(),
        dateFrom: zod_1.z.string().optional(),
        dateTo: zod_1.z.string().optional(),
        txnType: zod_1.z.enum(["debit", "credit"]).optional(),
    }).optional().default({}),
});
exports.transactionDetailSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional().default({}),
    params: zod_1.z.object({ transactionId: zod_1.z.string().uuid() }),
    query: zod_1.z.object({}).optional().default({}),
});
exports.patchTransactionSchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryId: zod_1.z.string().uuid().optional(),
        note: zod_1.z.string().max(500).optional(),
        attributedUserId: zod_1.z.string().uuid().optional(),
    }),
    params: zod_1.z.object({ transactionId: zod_1.z.string().uuid() }),
    query: zod_1.z.object({}).optional().default({}),
});
