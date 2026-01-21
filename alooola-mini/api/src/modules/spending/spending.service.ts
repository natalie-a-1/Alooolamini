/**
 * Business logic for the spending module.
 */
import { prisma } from "../../db/prisma";
import { decodeCursor, encodeCursor, buildCursorResponse } from "../../lib/pagination";
import { notFound, forbidden } from "../../lib/errors";

async function ensureHouseholdAccess(userId: string, householdId: string) {
  const membership = await prisma.householdMember.findFirst({
    where: { userId, householdId, status: "accepted" },
  });
  if (!membership) {
    throw forbidden("Not a household member");
  }
}

/** List accounts. */
export async function listAccounts(householdId: string) {
  return prisma.account.findMany({
    where: { householdId },
    include: { balance: true },
    orderBy: { createdAt: "asc" },
  });
}

/** Create account. */
export async function createAccount(householdId: string, data: {
  name: string;
  type: string;
  institution?: string;
  last4?: string;
}) {
  const account = await prisma.account.create({
    data: {
      householdId,
      name: data.name,
      type: data.type,
      institution: data.institution,
      last4: data.last4,
    },
  });

  // Create initial zero balance
  await prisma.accountBalance.create({
    data: {
      accountId: account.id,
      availableBalance: 0,
      currentBalance: 0,
      asOf: new Date(),
    },
  });

  return prisma.account.findUnique({
    where: { id: account.id },
    include: { balance: true },
  });
}

/** Get account. */
export async function getAccount(userId: string, accountId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: { balance: true },
  });
  if (!account) {
    throw notFound("Account not found");
  }
  await ensureHouseholdAccess(userId, account.householdId);
  return account;
}

/** List categories. */
export async function listCategories(householdId: string) {
  return prisma.category.findMany({
    where: { householdId },
    orderBy: { name: "asc" },
  });
}

/** Create category. */
export async function createCategory(householdId: string, name: string) {
  return prisma.category.create({
    data: { householdId, name },
  });
}

/** List transactions. */
export async function listTransactions(householdId: string, options: {
  cursor?: string;
  limit?: number;
  q?: string;
  categoryId?: string;
  accountId?: string;
  attributedUserId?: string;
  dateFrom?: string;
  dateTo?: string;
  txnType?: "debit" | "credit";
}) {
  const limit = options.limit ?? 25;
  const where: Record<string, unknown> = { householdId };

  if (options.q) {
    where.merchant = { contains: options.q, mode: "insensitive" };
  }
  if (options.categoryId) {
    where.categoryId = options.categoryId;
  }
  if (options.accountId) {
    where.accountId = options.accountId;
  }
  if (options.attributedUserId) {
    where.attributedUserId = options.attributedUserId;
  }
  if (options.txnType) {
    where.txnType = options.txnType;
  }
  if (options.dateFrom || options.dateTo) {
    where.txnDate = {
      ...(options.dateFrom ? { gte: new Date(options.dateFrom) } : {}),
      ...(options.dateTo ? { lte: new Date(options.dateTo) } : {}),
    };
  }

  if (options.cursor) {
    const [dateIso, id] = decodeCursor(options.cursor);
    const cursorDate = new Date(dateIso);
    where.OR = [
      { txnDate: { lt: cursorDate } },
      { txnDate: cursorDate, id: { lt: id } },
    ];
  }

  const items = await prisma.transaction.findMany({
    where,
    orderBy: [{ txnDate: "desc" }, { id: "desc" }],
    take: limit + 1,
    include: { account: true, category: true, attributedUser: true },
  });

  const cursorResponse = buildCursorResponse(items, limit, (item) =>
    encodeCursor([item.txnDate, item.id])
  );

  return cursorResponse;
}

/** Get transaction. */
export async function getTransaction(userId: string, transactionId: string) {
  const txn = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { account: true, category: true, attributedUser: true },
  });
  if (!txn) {
    throw notFound("Transaction not found");
  }
  await ensureHouseholdAccess(userId, txn.householdId);
  return txn;
}

/** Update transaction. */
export async function updateTransaction(userId: string, transactionId: string, data: {
  categoryId?: string;
  note?: string;
  attributedUserId?: string;
}) {
  const txn = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!txn) {
    throw notFound("Transaction not found");
  }
  await ensureHouseholdAccess(userId, txn.householdId);
  return prisma.transaction.update({
    where: { id: transactionId },
    data,
    include: { account: true, category: true, attributedUser: true },
  });
}

/** Get spending summary for a household. */
export async function getSpendingSummary(householdId: string, period?: string) {
  // Calculate date range based on period
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "This Week":
      // Start of current week (Sunday)
      const dayOfWeek = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      break;
    case "This Year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case "Last Month":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
    case "Last 3 Months":
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    case "This Month":
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
  }

  // Get all debit transactions in the period
  const transactions = await prisma.transaction.findMany({
    where: {
      householdId,
      txnType: "debit",
      txnDate: { gte: startDate, lte: now },
    },
    include: { category: true },
  });

  // Calculate total spent
  const totalSpent = transactions.reduce((sum, txn) => sum + Number(txn.amount), 0);

  // Default budget (in production, this could be stored per-household or user preferences)
  const monthlyBudget = 5000;

  // Aggregate spending by category
  const categoryTotals = new Map<string, { id: string; name: string; amount: number }>();
  for (const txn of transactions) {
    const categoryName = txn.category?.name ?? "Uncategorized";
    const categoryId = txn.category?.id ?? "uncategorized";
    const existing = categoryTotals.get(categoryId);
    if (existing) {
      existing.amount += Number(txn.amount);
    } else {
      categoryTotals.set(categoryId, { id: categoryId, name: categoryName, amount: Number(txn.amount) });
    }
  }

  // Convert to array and calculate percentages
  const categories = Array.from(categoryTotals.values())
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      amount: cat.amount,
      percent: totalSpent > 0 ? (cat.amount / totalSpent) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    totalSpent,
    budget: monthlyBudget,
    percentUsed: monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0,
    categories,
  };
}
