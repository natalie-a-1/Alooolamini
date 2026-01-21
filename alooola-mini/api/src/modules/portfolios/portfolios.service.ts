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

/** Get portfolio summary for a household. */
export async function getPortfolioSummary(userId: string, householdId: string, range?: string) {
  await ensureHouseholdAccess(userId, householdId);
  const fromDate = rangeToDate(range);

  // Get all snapshots for the user in this household
  const snapshots = await prisma.portfolioSnapshot.findMany({
    where: {
      householdId,
      userId,
      ...(fromDate ? { asOf: { gte: fromDate } } : {}),
    },
    orderBy: { asOf: "asc" },
  });

  // Get total invested across all positions
  const positions = await prisma.userPortfolioPosition.findMany({
    where: { householdId, userId },
  });

  // Aggregate the latest snapshot values
  // Group by asOf date to get total value per snapshot date
  const snapshotsByDate = new Map<string, { totalValue: number; gainAmount: number; asOf: Date }>();
  for (const snap of snapshots) {
    const dateKey = snap.asOf.toISOString();
    const existing = snapshotsByDate.get(dateKey);
    if (existing) {
      existing.totalValue += Number(snap.totalValue);
      existing.gainAmount += Number(snap.gainAmount ?? 0);
    } else {
      snapshotsByDate.set(dateKey, {
        totalValue: Number(snap.totalValue),
        gainAmount: Number(snap.gainAmount ?? 0),
        asOf: snap.asOf,
      });
    }
  }

  const aggregatedSnapshots = Array.from(snapshotsByDate.values())
    .sort((a, b) => a.asOf.getTime() - b.asOf.getTime());

  // Calculate totals from the latest snapshot
  const latestSnapshot = aggregatedSnapshots[aggregatedSnapshots.length - 1];
  const totalValue = latestSnapshot?.totalValue ?? 0;
  const gainAmount = latestSnapshot?.gainAmount ?? 0;
  const totalInvested = positions.reduce((sum, p) => sum + Number(p.amountInvested), 0);
  const gainPercent = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

  return {
    totalValue,
    gainAmount,
    gainPercent,
    snapshots: aggregatedSnapshots.map((s) => ({
      totalValue: s.totalValue,
      gainAmount: s.gainAmount,
      asOf: s.asOf.toISOString(),
    })),
  };
}
