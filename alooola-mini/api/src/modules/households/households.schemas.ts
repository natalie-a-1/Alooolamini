/**
 * Validation schemas for the households module.
 */
import { z } from "zod";

/** Validation schema for create household. */
export const createHouseholdSchema = z.object({
  body: z.object({
    name: z.string().min(1),
  }),
  params: z.object({}).optional().default({}),
  query: z.object({}).optional().default({}),
});

/** Validation schema for update member. */
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

/** Validation schema for create invite. */
export const createInviteSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
  }),
  params: z.object({
    householdId: z.string().uuid(),
  }),
  query: z.object({}).optional().default({}),
});

/** Validation schema for accept invite. */
export const acceptInviteSchema = z.object({
  body: z.object({
    email: z.string().trim().email().optional(),
  }),
  params: z.object({
    token: z.string().min(10),
  }),
  query: z.object({}).optional().default({}),
});
