"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingMeSchema = exports.onboardingOptionsSchema = void 0;
const zod_1 = require("zod");
exports.onboardingOptionsSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional().default({}),
    params: zod_1.z.object({}).optional().default({}),
    query: zod_1.z.object({}).optional().default({}),
});
exports.onboardingMeSchema = zod_1.z.object({
    body: zod_1.z.object({
        goalKeys: zod_1.z.array(zod_1.z.string()).optional(),
        goalOtherText: zod_1.z.string().nullable().optional(),
        riskTolerance: zod_1.z.enum(["conservative", "moderate", "aggressive"]).optional(),
        starterAmount: zod_1.z.number().nullable().optional(),
        starterAmountCustom: zod_1.z.number().nullable().optional(),
    }).optional().default({}),
    params: zod_1.z.object({}).optional().default({}),
    query: zod_1.z.object({}).optional().default({}),
});
