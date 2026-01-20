import { z } from "zod";

export const createThreadSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    householdId: z.string().uuid().optional(),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

export const threadDetailSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ threadId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});

export const listMessagesSchema = z.object({
  body: z.object({}).optional().default({}),
  params: z.object({ threadId: z.string().uuid() }),
  query: z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }).optional().default({}),
});

export const createMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1),
  }),
  params: z.object({ threadId: z.string().uuid() }),
  query: z.object({}).optional().default({}),
});
