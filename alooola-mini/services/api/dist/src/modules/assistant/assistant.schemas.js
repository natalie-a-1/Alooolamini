"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessageSchema = exports.listMessagesSchema = exports.threadDetailSchema = exports.createThreadSchema = void 0;
const zod_1 = require("zod");
exports.createThreadSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional(),
        householdId: zod_1.z.string().uuid().optional(),
    }),
    params: zod_1.z.object({}).optional().default({}),
    query: zod_1.z.object({}).optional().default({}),
});
exports.threadDetailSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional().default({}),
    params: zod_1.z.object({ threadId: zod_1.z.string().uuid() }),
    query: zod_1.z.object({}).optional().default({}),
});
exports.listMessagesSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional().default({}),
    params: zod_1.z.object({ threadId: zod_1.z.string().uuid() }),
    query: zod_1.z.object({
        cursor: zod_1.z.string().optional(),
        limit: zod_1.z.coerce.number().int().min(1).max(100).optional(),
    }).optional().default({}),
});
exports.createMessageSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1),
    }),
    params: zod_1.z.object({ threadId: zod_1.z.string().uuid() }),
    query: zod_1.z.object({}).optional().default({}),
});
