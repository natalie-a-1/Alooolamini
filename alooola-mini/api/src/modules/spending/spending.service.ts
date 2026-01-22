/**
 * Business logic for the spending module.
 *
 * This service provides functions for:
 * - Account listing, creation, retrieval
 * - Category listing, creation
 * - Transaction creation, updating, listing, retrieval
 * - Investment snapshots and summaries
 * - Household access checks and spending aggregation
 *
 * Data access is performed using Prisma ORM.
 */
import { prisma } from "../../db/prisma";
import { Prisma } from "@prisma/client";
type TxnType = "spend" | "receive";
import { decodeCursor, encodeCursor, buildCursorResponse } from "../../lib/pagination";
import { notFound, forbidden } from "../../lib/errors";
import { normalizeAccountBalance } from "../../lib/normalizers/account";

/**
 * Shape of the transaction data transfer object.
 */
type TransactionDto = {
  id: string;
  accountId: string;
  householdId: string;
  txnType: TxnType;
  amount: number;
  currency: string;
  merchant: string;
  txnDate: string;
  category: { id: string; name: string } | null;
  attributedUser: { id: string; name: string } | null;
};

/**
 * Transaction object with related information for conversion helpers.
 */
type TransactionWithRelations = {
  id: string;
  accountId: string;
  householdId: string;
  txnType: TxnType;
  amount: Prisma.Decimal | number;
  currency: string;
  merchant: string;
  txnDate: Date;
  category?: { id: string; name: string | null } | null;
  attributedUser?: { id: string; name: string | null } | null;
};

/**
 * Converts a TransactionWithRelations object to a TransactionDto.
 * Ensures decimal numbers are normalized to JS numbers and related objects are formatted.
 * @param txn The transaction with relations to convert
 * @returns The DTO for API response
 */
function transactionToDto(txn: TransactionWithRelations): TransactionDto {
  const amountValue = typeof txn.amount === "number" ? txn.amount : txn.amount.toNumber();
  return {
    id: txn.id,
    accountId: txn.accountId,
    householdId: txn.householdId,
    txnType: txn.txnType,
    amount: amountValue,
    currency: txn.currency,
    merchant: txn.merchant,
    txnDate: txn.txnDate.toISOString(),
    category: txn.category ? { id: txn.category.id, name: txn.category.name ?? "" } : null,
    attributedUser: txn.attributedUser ? { id: txn.attributedUser.id, name: txn.attributedUser.name ?? "" } : null,
  };
}

/**
 * Ensures that a user has accepted membership in the given household.
 * Throws Forbidden if user is not a member.
 * @param userId The ID of the user to check
 * @param householdId The household to check membership in
 */
async function ensureHouseholdAccess(userId: string, householdId: string) {
  const membership = await prisma.householdMember.findFirst({
    where: { userId, householdId, status: "accepted" },
  });
  if (!membership) {
    throw forbidden("Not a household member");
  }
}

/**
 * Converts a string range identifier to a JavaScript Date object representing the start.
 * @param range String identifier (e.g., "1M", "3M", "6M", "1Y" or "ALL")
 * @returns Date object or null if no range
 */
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

/**
 * Returns all accounts for a household, with current balances.
 * @param householdId The target household ID
 */
export async function listAccounts(householdId: string) {
  const accounts = await prisma.account.findMany({
    where: { householdId },
    include: { balance: true },
    orderBy: { createdAt: "asc" },
  });
  return accounts.map(normalizeAccountBalance);
}

/**
 * Creates a new bank/account for a household and initializes a balance.
 * @param householdId Household for which to create the account
 * @param data Account creation details: name, type, optional institution, last4, starting balance
 */
export async function createAccount(householdId: string, data: {
  name: string;
  type: string;
  institution?: string;
  last4?: string;
  currentBalance?: number;
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

  // Create initial zero balance or initial balance if provided
  await prisma.accountBalance.create({
    data: {
      accountId: account.id,
      availableBalance: data.currentBalance ?? 0,
      currentBalance: data.currentBalance ?? 0,
      asOf: new Date(),
    },
  });

  const created = await prisma.account.findUnique({
    where: { id: account.id },
    include: { balance: true },
  });
  return created ? normalizeAccountBalance(created) : null;
}

/**
 * Fetches a single account for a user, ensuring they are a household member.
 * @param userId The user's ID for household access checking
 * @param accountId The specific account's ID
 */
export async function getAccount(userId: string, accountId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: { balance: true },
  });
  if (!account) {
    throw notFound("Account not found");
  }
  await ensureHouseholdAccess(userId, account.householdId);
  return normalizeAccountBalance(account);
}

/**
 * Either inserts a new investment portfolio snapshot, or skips if latest is unchanged.
 * Used to track historical portfolio values.
 * @param userId   ID of user
 * @param householdId  ID of household
 * @param totalValue  Total portfolio value
 */
async function upsertInvestmentSnapshot(userId: string, householdId: string, totalValue: number) {
  const latest = await prisma.portfolioSnapshot.findFirst({
    where: { userId, householdId, portfolioId: null },
    orderBy: { asOf: "desc" },
  });

  const latestValue = latest ? Number(latest.totalValue) : null;
  if (latestValue === totalValue) return;

  await prisma.portfolioSnapshot.create({
    data: {
      userId,
      householdId,
      portfolioId: null,
      totalValue,
      gainAmount: null,
      gainPercent: null,
      asOf: new Date(),
    },
  });
}

/**
 * Returns a summary of investment account values and portfolio snapshots for a household.
 * Only investment-type accounts are considered.
 *
 * @param userId      The user requesting the summary
 * @param householdId Household ID being queried
 * @param range       Optional time range string (see rangeToDate)
 * @returns           Object with totalValue and snapshots array
 */
export async function getInvestmentSummary(userId: string, householdId: string, range?: string) {
  await ensureHouseholdAccess(userId, householdId);
  const accounts = await prisma.account.findMany({
    where: { householdId, type: "investment" },
    include: { balance: true },
  });

  const normalized = accounts.map(normalizeAccountBalance);
  const totalValue = normalized.reduce((sum, acc) => sum + (acc.balance?.currentBalance ?? 0), 0);

  await upsertInvestmentSnapshot(userId, householdId, totalValue);

  const fromDate = rangeToDate(range);
  const snapshots = await prisma.portfolioSnapshot.findMany({
    where: {
      userId,
      householdId,
      portfolioId: null,
      ...(fromDate ? { asOf: { gte: fromDate } } : {}),
    },
    orderBy: { asOf: "asc" },
  });

  return {
    totalValue,
    snapshots: snapshots.map((s) => ({
      totalValue: Number(s.totalValue),
      gainAmount: s.gainAmount !== null ? Number(s.gainAmount) : null,
      asOf: s.asOf.toISOString(),
    })),
  };
}

/**
 * Lists all categories associated with a household.
 * @param householdId Household to retrieve categories for
 */
export async function listCategories(householdId: string) {
  return prisma.category.findMany({
    where: { householdId },
    orderBy: { name: "asc" },
  });
}

/**
 * Creates a new spending/expense category for a household.
 * @param householdId Household to add category to
 * @param name        Category name
 */
export async function createCategory(householdId: string, name: string) {
  return prisma.category.create({
    data: { householdId, name },
  });
}

/**
 * Creates a transaction and updates the associated account's balance.
 * Verifies membership and category validity. Upserts balance row if needed.
 * 
 * Validation:
 * - Investment accounts cannot have spend transactions that exceed their balance
 * - All account types validate that spend transactions won't exceed available balance
 * 
 * @param userId      User who creates transaction
 * @param householdId Household in which transaction occurs
 * @param data        Transaction details (account, type, amount, merchant, etc)
 */
export async function createTransaction(userId: string, householdId: string, data: {
  accountId: string;
  txnType: "spend" | "receive";
  amount: number;
  merchant: string;
  currency?: string;
  categoryId?: string;
  note?: string;
  attributedUserId?: string | null;
}) {
  await ensureHouseholdAccess(userId, householdId);

  const account = await prisma.account.findUnique({
    where: { id: data.accountId },
    include: { balance: true },
  });
  if (!account || account.householdId !== householdId) {
    throw notFound("Account not found");
  }

  const txnType: TxnType = data.txnType as TxnType;
  const amount = Math.abs(data.amount);
  const currentBalance = Number(account.balance?.currentBalance ?? 0);
  const availableBalance = Number(account.balance?.availableBalance ?? 0);

  // Validate that spend transactions won't cause negative balance for investment accounts
  if (txnType === "spend") {
    const newBalance = currentBalance - amount;
    
    // Investment accounts cannot go negative
    if (account.type === "investment" && newBalance < 0) {
      throw forbidden(`Insufficient balance. Cannot spend $${amount.toFixed(2)} from investment account with $${currentBalance.toFixed(2)} balance.`);
    }
    
    // Other account types: warn but allow (credit accounts can go negative, etc.)
    // For checking/savings, we could optionally enforce this too
    if ((account.type === "checking" || account.type === "savings") && newBalance < 0) {
      throw forbidden(`Insufficient balance. Cannot spend $${amount.toFixed(2)} from ${account.type} account with $${currentBalance.toFixed(2)} balance.`);
    }
  }

  let categoryId = data.categoryId;
  if (!categoryId) {
    // Use or create fallback "Other" category if not provided
    const fallback = await prisma.category.upsert({
      where: {
        householdId_name: {
          householdId,
          name: "Other",
        },
      },
      update: {},
      create: { householdId, name: "Other" },
    });
    categoryId = fallback.id;
  }

  // Ensure selected category belongs to this household
  const category = await prisma.category.findFirst({
    where: { id: categoryId, householdId },
  });
  if (!category) {
    throw forbidden("Category not found for household");
  }

  const now = new Date();

  const txn = await prisma.transaction.create({
    data: {
      householdId,
      accountId: data.accountId,
      txnType,
      amount,
      merchant: data.merchant,
      currency: data.currency ?? "USD",
      txnDate: now,
      categoryId,
      note: data.note,
      attributedUserId: data.attributedUserId ?? userId,
    },
    include: { account: true, category: true, attributedUser: true },
  });

  // Update balances: 'spend' reduces, 'receive' increases.
  // Uses upsert so missing balance row is created.
  const isSpend = txnType === "spend";
  const delta = isSpend ? -amount : amount;
  await prisma.accountBalance.upsert({
    where: { accountId: data.accountId },
    update: {
      currentBalance: currentBalance + delta,
      availableBalance: availableBalance + delta,
      asOf: now,
    },
    create: {
      accountId: data.accountId,
      currentBalance: currentBalance + delta,
      availableBalance: availableBalance + delta,
      asOf: now,
    },
  });

  return transactionToDto(txn);
}

/**
 * Returns a paginated (cursor-based) list of transactions for a household.
 * Supports filtering by search (q), category, account, attributed user, type, and date range.
 * 
 * @param householdId The ID of the household to list transactions for
 * @param options     Filter and pagination options
 * @returns           Object with items, cursors, and pagination info
 */
export async function listTransactions(householdId: string, options: {
  cursor?: string;
  limit?: number;
  q?: string;
  categoryId?: string;
  accountId?: string;
  attributedUserId?: string;
  dateFrom?: string;
  dateTo?: string;
  txnType?: TxnType;
}) {
  const limit = options.limit ?? 25;
  const where: Record<string, unknown> = { householdId };

  // Filtering logic applied to query
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

  // Cursor-based pagination for stable sorts
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

  return {
    ...cursorResponse,
    items: cursorResponse.items.map(transactionToDto),
  };
}

/**
 * Fetches a single transaction by ID and ensures the user belongs to its household.
 * @param userId        The user's ID to check household membership
 * @param transactionId Transaction to fetch
 */
export async function getTransaction(userId: string, transactionId: string) {
  const txn = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { account: true, category: true, attributedUser: true },
  });
  if (!txn) {
    throw notFound("Transaction not found");
  }
  await ensureHouseholdAccess(userId, txn.householdId);
  return transactionToDto(txn);
}

/**
 * Updates certain fields of a transaction (category, note, attributed user).
 * Only allowed for users of the correct household.
 * @param userId        The updater's user ID
 * @param transactionId The transaction to update
 * @param data          Updatable fields
 */
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

/**
 * Summarizes spending for a household in a given period, including total spent,
 * a fixed budget, and a breakdown by category.
 *
 * Supported periods: "This Week", "This Year", "Last Month", "Last 3 Months", "This Month" (default)
 *
 * @param householdId  The household for which to summarize
 * @param period       Period identifier string
 * @returns            Summary including totalSpent, budget, usage percent and per-category breakdown
 */
export async function getSpendingSummary(householdId: string, period?: string) {
  // Calculate date range based on period parameter
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

  // Query all 'spend' transactions in the computed window.
  const transactions = await prisma.transaction.findMany({
    where: {
      householdId,
      txnType: "spend",
      txnDate: { gte: startDate, lte: now },
    },
    include: { category: true },
  });

  // Aggregate the total spent amount
  const totalSpent = transactions.reduce((sum, txn) => sum + Number(txn.amount), 0);

  // Default/monthly budget (could be dynamic per household in a real app)
  const monthlyBudget = 5000;

  // Group spending by category, tallying amounts
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

  // To array of categories, include percent of total, sorted by amount
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
