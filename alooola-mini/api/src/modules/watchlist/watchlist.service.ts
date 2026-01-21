/**
 * Business logic for the watchlist module.
 */
import { prisma } from "../../db/prisma";
import { notFound } from "../../lib/errors";

/**
 * Add a portfolio to user's watchlist.
 */
export async function addToWatchlist(userId: string, portfolioId: string) {
  // Verify portfolio exists
  const portfolio = await prisma.curatedPortfolio.findUnique({
    where: { id: portfolioId },
  });
  if (!portfolio) {
    throw notFound("Portfolio not found");
  }

  // Upsert to handle duplicate attempts gracefully
  return prisma.watchlistItem.upsert({
    where: {
      userId_portfolioId: { userId, portfolioId },
    },
    update: {},
    create: { userId, portfolioId },
    include: {
      portfolio: {
        include: { holdings: true },
      },
    },
  });
}

/**
 * Remove a portfolio from user's watchlist.
 */
export async function removeFromWatchlist(userId: string, portfolioId: string) {
  const item = await prisma.watchlistItem.findUnique({
    where: {
      userId_portfolioId: { userId, portfolioId },
    },
  });

  if (!item) {
    throw notFound("Watchlist item not found");
  }

  return prisma.watchlistItem.delete({
    where: { id: item.id },
  });
}

/**
 * Check if a portfolio is in user's watchlist.
 */
export async function isInWatchlist(userId: string, portfolioId: string): Promise<boolean> {
  const item = await prisma.watchlistItem.findUnique({
    where: {
      userId_portfolioId: { userId, portfolioId },
    },
  });
  return item !== null;
}

/**
 * List all watchlist items for a user.
 */
export async function listWatchlist(userId: string) {
  return prisma.watchlistItem.findMany({
    where: { userId },
    include: {
      portfolio: {
        include: { holdings: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
