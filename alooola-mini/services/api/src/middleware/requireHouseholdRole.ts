import type { Request, Response, NextFunction } from "express";
import { prisma } from "../db/prisma";
import { forbidden, unauthorized } from "../lib/errors";

export function requireHouseholdRole(roles: string[], paramName = "householdId") {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(unauthorized());
    }

    const householdId = req.params[paramName];
    if (!householdId) {
      return next(forbidden("Household not provided"));
    }

    const membership = await prisma.householdMember.findFirst({
      where: {
        householdId,
        userId: req.user.id,
      },
    });

    if (!membership || membership.status !== "accepted") {
      return next(forbidden("Not a household member"));
    }

    if (!roles.includes(membership.role)) {
      return next(forbidden("Insufficient household role"));
    }

    return next();
  };
}
