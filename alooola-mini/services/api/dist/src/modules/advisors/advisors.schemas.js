/**
 * Project source file.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookAppointmentSchema = exports.advisorSlotsSchema = void 0;
const zod_1 = require("zod");
exports.advisorSlotsSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional().default({}),
    params: zod_1.z.object({ advisorId: zod_1.z.string().uuid() }),
    query: zod_1.z.object({}).optional().default({}),
});
exports.bookAppointmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        advisorId: zod_1.z.string().uuid(),
        slotId: zod_1.z.string().uuid(),
        notes: zod_1.z.string().optional(),
    }),
    params: zod_1.z.object({}).optional().default({}),
    query: zod_1.z.object({}).optional().default({}),
});
