/**
 * Business logic for the portfolios module.
 */
import { prisma } from "../../db/prisma";
import { forbidden, notFound } from "../../lib/errors";
import { createInvestmentSnapshot } from "../spending/spending.service";

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
    include: { holdings: true },
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

/**
 * Buy a portfolio position by debiting from a funding account.
 * 
 * Validates:
 * - Funding account must be checking or savings type
 * - Account must have sufficient funds
 * 
 * On success:
 * - Creates/updates the user's position in the portfolio
 * - Debits the funding account balance
 */
export async function createPosition(
  userId: string,
  householdId: string,
  data: { portfolioId: string; amountInvested: number; fundingAccountId: string }
) {
  await ensureHouseholdAccess(userId, householdId);

  // Validate funding account exists and belongs to household
  const fundingAccount = await prisma.account.findUnique({
    where: { id: data.fundingAccountId },
    include: { balance: true },
  });

  if (!fundingAccount || fundingAccount.householdId !== householdId) {
    throw notFound("Funding account not found");
  }

  // Validate account type is checking or savings
  if (fundingAccount.type !== "checking" && fundingAccount.type !== "savings") {
    throw forbidden("Funding account must be a checking or savings account");
  }

  // Validate sufficient funds
  const currentBalance = Number(fundingAccount.balance?.currentBalance ?? 0);
  if (currentBalance < data.amountInvested) {
    throw forbidden(
      `Insufficient funds. Account has $${currentBalance.toFixed(2)} but purchase requires $${data.amountInvested.toFixed(2)}.`
    );
  }

  // Verify portfolio exists
  const portfolio = await prisma.curatedPortfolio.findUnique({
    where: { id: data.portfolioId },
  });
  if (!portfolio) {
    throw notFound("Portfolio not found");
  }

  // Check if user already has a position in this portfolio
  const existingPosition = await prisma.userPortfolioPosition.findFirst({
    where: { userId, householdId, portfolioId: data.portfolioId },
  });

  const now = new Date();

  // Get or create "Investments" category for the transaction
  const investmentCategory = await prisma.category.upsert({
    where: {
      householdId_name: {
        householdId,
        name: "Investments",
      },
    },
    update: {},
    create: { householdId, name: "Investments" },
  });

  // Use transaction to ensure atomicity
  const [position] = await prisma.$transaction([
    // Create or update position
    existingPosition
      ? prisma.userPortfolioPosition.update({
          where: { id: existingPosition.id },
          data: {
            amountInvested: { increment: data.amountInvested },
          },
          include: { portfolio: { include: { holdings: true } } },
        })
      : prisma.userPortfolioPosition.create({
          data: {
            userId,
            householdId,
            portfolioId: data.portfolioId,
            amountInvested: data.amountInvested,
          },
          include: { portfolio: { include: { holdings: true } } },
        }),
    // Debit funding account balance
    prisma.accountBalance.update({
      where: { accountId: data.fundingAccountId },
      data: {
        currentBalance: { decrement: data.amountInvested },
        availableBalance: { decrement: data.amountInvested },
        asOf: now,
      },
    }),
    // Create transaction record for the investment purchase
    prisma.transaction.create({
      data: {
        householdId,
        accountId: data.fundingAccountId,
        txnType: "spend",
        amount: data.amountInvested,
        merchant: `Investment: ${portfolio.name}`,
        currency: "USD",
        categoryId: investmentCategory.id,
        note: `Purchased ${portfolio.name} portfolio`,
        attributedUserId: userId,
        txnDate: now,
      },
    }),
  ]);

  // Create a household-level snapshot for the Home chart.
  // This should match the same "totalValue" calculation used in getInvestmentSummary:
  // investment account balances + portfolio positions invested.
  const [investmentAccounts, allPositions] = await Promise.all([
    prisma.account.findMany({
      where: { householdId, type: "investment" },
      include: { balance: true },
    }),
    prisma.userPortfolioPosition.findMany({
      where: { userId, householdId },
    }),
  ]);

  const accountsTotal = investmentAccounts.reduce(
    (sum, acc) => sum + Number(acc.balance?.currentBalance ?? 0),
    0
  );
  const positionsTotal = allPositions.reduce((sum, p) => sum + Number(p.amountInvested), 0);
  await createInvestmentSnapshot(userId, householdId, accountsTotal + positionsTotal);

  return position;
}

/** List positions. */
export async function listPositions(userId: string, householdId: string) {
  await ensureHouseholdAccess(userId, householdId);
  return prisma.userPortfolioPosition.findMany({
    where: { householdId, userId },
    include: { portfolio: { include: { holdings: true } } },
    orderBy: { createdAt: "desc" },
  });
}

function rangeToDate(range?: string) {
  if (!range || range === "ALL") return null;
  const now = new Date();
  const date = new Date(now.getTime());
  switch (range) {
    case "1D":
      date.setDate(date.getDate() - 1);
      return date;
    case "1M":
      date.setMonth(date.getMonth() - 1);
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
