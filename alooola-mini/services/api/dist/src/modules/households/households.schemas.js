/**
 * Project source file.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptInviteSchema = exports.createInviteSchema = exports.updateMemberSchema = exports.createHouseholdSchema = void 0;
const zod_1 = require("zod");
exports.createHouseholdSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1),
    }),
    params: zod_1.z.object({}).optional().default({}),
    query: zod_1.z.object({}).optional().default({}),
});
exports.updateMemberSchema = zod_1.z.object({
    body: zod_1.z.object({
        role: zod_1.z.enum(["owner", "member", "viewer"]).optional(),
        status: zod_1.z.enum(["pending", "accepted"]).optional(),
    }),
    params: zod_1.z.object({
        householdId: zod_1.z.string().uuid(),
        memberId: zod_1.z.string().uuid(),
    }),
    query: zod_1.z.object({}).optional().default({}),
});
exports.createInviteSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
    }),
    params: zod_1.z.object({
        householdId: zod_1.z.string().uuid(),
    }),
    query: zod_1.z.object({}).optional().default({}),
});
exports.acceptInviteSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email().optional(),
    }),
    params: zod_1.z.object({
        token: zod_1.z.string().min(10),
    }),
    query: zod_1.z.object({}).optional().default({}),
});
