/**
 * Project source file.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoSchema = exports.logoutSchema = exports.refreshSchema = exports.emailVerifySchema = exports.emailStartSchema = void 0;
const zod_1 = require("zod");
exports.emailStartSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
    }),
    params: zod_1.z.object({}).optional().default({}),
    query: zod_1.z.object({}).optional().default({}),
});
exports.emailVerifySchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        token: zod_1.z.string().min(6),
    }),
    params: zod_1.z.object({}).optional().default({}),
    query: zod_1.z.object({}).optional().default({}),
});
exports.refreshSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(10),
    }),
    params: zod_1.z.object({}).optional().default({}),
    query: zod_1.z.object({}).optional().default({}),
});
exports.logoutSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(10).optional(),
    }),
    params: zod_1.z.object({}).optional().default({}),
    query: zod_1.z.object({}).optional().default({}),
});
exports.demoSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email().optional(),
        name: zod_1.z.string().min(1).optional(),
    }),
    params: zod_1.z.object({}).optional().default({}),
    query: zod_1.z.object({}).optional().default({}),
});
