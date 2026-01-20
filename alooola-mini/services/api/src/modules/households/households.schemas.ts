import { z } from "zod";

export const createHouseholdSchema = z.object({
  body: z.object({
    name: z.string().min(1),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

export const updateMemberSchema = z.object({
  body: z.object({
    role: z.enum(["owner", "member", "viewer"]).optional(),
    status: z.enum(["pending", "accepted"]).optional(),
  }),
  params: z.object({
    householdId: z.string().uuid(),
    memberId: z.string().uuid(),
  }),
  query: z.object({}).optional().default({}),
});

export const createInviteSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
  params: z.object({
    householdId: z.string().uuid(),
  }),
  query: z.object({}).optional().default({}),
});

export const acceptInviteSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
  }),
  params: z.object({
    token: z.string().min(10),
  }),
  query: z.object({}).optional().default({}),
});
