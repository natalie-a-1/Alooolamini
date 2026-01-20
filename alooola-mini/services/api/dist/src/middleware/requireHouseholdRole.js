"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireHouseholdRole = requireHouseholdRole;
const prisma_1 = require("../db/prisma");
const errors_1 = require("../lib/errors");
function requireHouseholdRole(roles, paramName = "householdId") {
    return async (req, _res, next) => {
        if (!req.user) {
            return next((0, errors_1.unauthorized)());
        }
        const householdId = req.params[paramName];
        if (!householdId) {
            return next((0, errors_1.forbidden)("Household not provided"));
        }
        const membership = await prisma_1.prisma.householdMember.findFirst({
            where: {
                householdId,
                userId: req.user.id,
            },
        });
        if (!membership || membership.status !== "accepted") {
            return next((0, errors_1.forbidden)("Not a household member"));
        }
        if (!roles.includes(membership.role)) {
            return next((0, errors_1.forbidden)("Insufficient household role"));
        }
        return next();
    };
}
