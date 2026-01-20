import { z } from "zod";

export const advisorSlotsSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ advisorId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

export const bookAppointmentSchema = z.object({
  body: z.object({
    advisorId: z.string().uuid(),
    slotId: z.string().uuid(),
    notes: z.string().optional(),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});
