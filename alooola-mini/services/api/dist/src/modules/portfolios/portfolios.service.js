/**
 * Project source file.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPortfolios = listPortfolios;
exports.getPortfolio = getPortfolio;
exports.listHoldings = listHoldings;
exports.createPosition = createPosition;
exports.listPositions = listPositions;
exports.listSnapshots = listSnapshots;
const prisma_1 = require("../../db/prisma");
const errors_1 = require("../../lib/errors");
async function ensureHouseholdAccess(userId, householdId) {
    const membership = await prisma_1.prisma.householdMember.findFirst({
        where: { userId, householdId, status: "accepted" },
    });
    if (!membership) {
        throw (0, errors_1.forbidden)("Not a household member");
    }
}
async function listPortfolios() {
    return prisma_1.prisma.curatedPortfolio.findMany({
        orderBy: { createdAt: "asc" },
    });
}
async function getPortfolio(portfolioId) {
    const portfolio = await prisma_1.prisma.curatedPortfolio.findUnique({
        where: { id: portfolioId },
        include: { holdings: true },
    });
    if (!portfolio) {
        throw (0, errors_1.notFound)("Portfolio not found");
    }
    return portfolio;
}
async function listHoldings(portfolioId) {
    return prisma_1.prisma.portfolioHolding.findMany({
        where: { portfolioId },
        orderBy: { weightPct: "desc" },
    });
}
async function createPosition(userId, householdId, data) {
    await ensureHouseholdAccess(userId, householdId);
    return prisma_1.prisma.userPortfolioPosition.create({
        data: {
            userId,
            householdId,
            portfolioId: data.portfolioId,
            amountInvested: data.amountInvested,
        },
    });
}
async function listPositions(userId, householdId) {
    await ensureHouseholdAccess(userId, householdId);
    return prisma_1.prisma.userPortfolioPosition.findMany({
        where: { householdId, userId },
        include: { portfolio: true },
        orderBy: { createdAt: "desc" },
    });
}
function rangeToDate(range) {
    if (!range || range === "ALL")
        return null;
    const now = new Date();
    const date = new Date(now.getTime());
    switch (range) {
        case "1M":
            date.setMonth(date.getMonth() - 1);
            return date;
        case "3M":
            date.setMonth(date.getMonth() - 3);
            return date;
        case "6M":
            date.setMonth(date.getMonth() - 6);
            return date;
        case "1Y":
            date.setFullYear(date.getFullYear() - 1);
            return date;
        default:
            return null;
    }
}
async function listSnapshots(userId, householdId, range) {
    await ensureHouseholdAccess(userId, householdId);
    const fromDate = rangeToDate(range);
    return prisma_1.prisma.portfolioSnapshot.findMany({
        where: {
            householdId,
            userId,
            ...(fromDate ? { asOf: { gte: fromDate } } : {}),
        },
        orderBy: { asOf: "asc" },
    });
}
