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

export async function listAccounts(householdId: string) {
  return prisma.account.findMany({
    where: { householdId },
    include: { balance: true },
    orderBy: { createdAt: "asc" },
  });
}

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

export async function listCategories(householdId: string) {
  return prisma.category.findMany({
    where: { householdId },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(householdId: string, name: string) {
  return prisma.category.create({
    data: { householdId, name },
  });
}

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
