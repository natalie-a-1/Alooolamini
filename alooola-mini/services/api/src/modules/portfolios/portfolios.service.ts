/**
 * Business logic for the portfolios module.
 */
import { prisma } from "../../db/prisma";
import { forbidden, notFound } from "../../lib/errors";

async function ensureHouseholdAccess(userId: string, householdId: string) {
  const membership = await prisma.householdMember.findFirst({
    where: { userId, householdId, status: "accepted" },
  });
  if (!membership) {
    throw forbidden("Not a household member");
  }
}

/** List portfolios. */
export async function listPortfolios() {
  return prisma.curatedPortfolio.findMany({
    orderBy: { createdAt: "asc" },
  });
}

/** Get portfolio. */
export async function getPortfolio(portfolioId: string) {
  const portfolio = await prisma.curatedPortfolio.findUnique({
    where: { id: portfolioId },
    include: { holdings: true },
  });
  if (!portfolio) {
    throw notFound("Portfolio not found");
  }
  return portfolio;
}

/** List holdings. */
export async function listHoldings(portfolioId: string) {
  return prisma.portfolioHolding.findMany({
    where: { portfolioId },
    orderBy: { weightPct: "desc" },
  });
}

/** Create position. */
export async function createPosition(userId: string, householdId: string, data: { portfolioId: string; amountInvested: number }) {
  await ensureHouseholdAccess(userId, householdId);
  return prisma.userPortfolioPosition.create({
    data: {
      userId,
      householdId,
      portfolioId: data.portfolioId,
      amountInvested: data.amountInvested,
    },
  });
}

/** List positions. */
export async function listPositions(userId: string, householdId: string) {
  await ensureHouseholdAccess(userId, householdId);
  return prisma.userPortfolioPosition.findMany({
    where: { householdId, userId },
    include: { portfolio: true },
    orderBy: { createdAt: "desc" },
  });
}

function rangeToDate(range?: string) {
  if (!range || range === "ALL") return null;
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

/** List snapshots. */
export async function listSnapshots(userId: string, householdId: string, range?: string) {
  await ensureHouseholdAccess(userId, householdId);
  const fromDate = rangeToDate(range);

  return prisma.portfolioSnapshot.findMany({
    where: {
      householdId,
      userId,
      ...(fromDate ? { asOf: { gte: fromDate } } : {}),
    },
    orderBy: { asOf: "asc" },
  });
}
