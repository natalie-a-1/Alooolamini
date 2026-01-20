import { z } from "zod";

export const referralEventSchema = z.object({
  body: z.object({
    eventType: z.enum(["click", "signup", "complete"]),
    meta: z.record(z.unknown()).optional(),
  }),
  params: z.object({
    code: z.string().min(3),
  }),
  query: z.object({}).optional().default({}),
});
