/**
 * Project source file.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralEventSchema = void 0;
const zod_1 = require("zod");
exports.referralEventSchema = zod_1.z.object({
    body: zod_1.z.object({
        eventType: zod_1.z.enum(["click", "signup", "complete"]),
        meta: zod_1.z.record(zod_1.z.unknown()).optional(),
    }),
    params: zod_1.z.object({
        code: zod_1.z.string().min(3),
    }),
    query: zod_1.z.object({}).optional().default({}),
});
