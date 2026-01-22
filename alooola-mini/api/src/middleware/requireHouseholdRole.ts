/**
 * Household Role Authorization Middleware
 *
 * Express middleware to require that the authenticated user has an accepted
 * membership with a specified role (or one of several) in a given household.
 *
 * - Requires a valid user on the request (set by prior authentication middleware).
 * - Extracts the household ID from req.params[paramName] (defaults to "householdId").
 * - Checks that the user is an accepted member of the household.
 * - Ensures the user's household role matches one of the required roles.
 * - Responds with appropriate error (401/403) if any check fails.
 *
 * @param roles - Array of allowed household role strings (e.g., ["admin", "owner"])
 * @param paramName - Name of route param containing household ID ("householdId" by default)
 * @returns Express middleware function enforcing household role requirement
 *
 * @example
 *   app.get(
 *     "/households/:householdId/accounts",
 *     requireAuth,
 *     requireHouseholdRole(["admin", "owner"])
 *   );
 */
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../db/prisma";
import { forbidden, unauthorized } from "../lib/errors";

/**
 * Middleware to require a household membership with an allowed role.
 *
 * @param roles - Allowed roles in the household
 * @param paramName - Route param for household ID (default: "householdId")
 */
export function requireHouseholdRole(
  roles: string[],
  paramName = "householdId"
) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    // Ensure request is authenticated and user info is present
    if (!req.user) {
      return next(unauthorized("Authentication required"));
    }

    // Extract household identifier from route params
    const householdId = req.params[paramName];
    if (!householdId) {
      return next(forbidden("Household not provided"));
    }

    // Look up accepted household membership for the user
    const membership = await prisma.householdMember.findFirst({
      where: {
        householdId,
        userId: req.user.id,
        status: "accepted",
      },
    });

    if (!membership) {
      return next(forbidden("Not a household member"));
    }

    // Check for sufficient household role
    if (!roles.includes(membership.role)) {
      return next(forbidden("Insufficient household role"));
    }

    return next();
  };
}
