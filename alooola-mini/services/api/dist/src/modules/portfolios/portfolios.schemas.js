"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSnapshotsSchema = exports.listPositionsSchema = exports.createPositionSchema = exports.portfolioDetailSchema = void 0;
const zod_1 = require("zod");
exports.portfolioDetailSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional().default({}),
    params: zod_1.z.object({ portfolioId: zod_1.z.string().uuid() }),
    query: zod_1.z.object({}).optional().default({}),
});
exports.createPositionSchema = zod_1.z.object({
    body: zod_1.z.object({
        portfolioId: zod_1.z.string().uuid(),
        amountInvested: zod_1.z.number().positive(),
    }),
    params: zod_1.z.object({ householdId: zod_1.z.string().uuid() }),
    query: zod_1.z.object({}).optional().default({}),
});
exports.listPositionsSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional().default({}),
    params: zod_1.z.object({ householdId: zod_1.z.string().uuid() }),
    query: zod_1.z.object({}).optional().default({}),
});
exports.listSnapshotsSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional().default({}),
    params: zod_1.z.object({ householdId: zod_1.z.string().uuid() }),
    query: zod_1.z.object({
        range: zod_1.z.enum(["1M", "3M", "6M", "1Y", "ALL"]).optional(),
    }).optional().default({}),
});
