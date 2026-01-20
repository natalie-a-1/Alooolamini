"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAccounts = listAccounts;
exports.getAccount = getAccount;
exports.listCategories = listCategories;
exports.createCategory = createCategory;
exports.listTransactions = listTransactions;
exports.getTransaction = getTransaction;
exports.updateTransaction = updateTransaction;
const prisma_1 = require("../../db/prisma");
const pagination_1 = require("../../lib/pagination");
const errors_1 = require("../../lib/errors");
async function ensureHouseholdAccess(userId, householdId) {
    const membership = await prisma_1.prisma.householdMember.findFirst({
        where: { userId, householdId, status: "accepted" },
    });
    if (!membership) {
        throw (0, errors_1.forbidden)("Not a household member");
    }
}
async function listAccounts(householdId) {
    return prisma_1.prisma.account.findMany({
        where: { householdId },
        include: { balance: true },
        orderBy: { createdAt: "asc" },
    });
}
async function getAccount(userId, accountId) {
    const account = await prisma_1.prisma.account.findUnique({
        where: { id: accountId },
        include: { balance: true },
    });
    if (!account) {
        throw (0, errors_1.notFound)("Account not found");
    }
    await ensureHouseholdAccess(userId, account.householdId);
    return account;
}
async function listCategories(householdId) {
    return prisma_1.prisma.category.findMany({
        where: { householdId },
        orderBy: { name: "asc" },
    });
}
async function createCategory(householdId, name) {
    return prisma_1.prisma.category.create({
        data: { householdId, name },
    });
}
async function listTransactions(householdId, options) {
    const limit = options.limit ?? 25;
    const where = { householdId };
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
        const [dateIso, id] = (0, pagination_1.decodeCursor)(options.cursor);
        const cursorDate = new Date(dateIso);
        where.OR = [
            { txnDate: { lt: cursorDate } },
            { txnDate: cursorDate, id: { lt: id } },
        ];
    }
    const items = await prisma_1.prisma.transaction.findMany({
        where,
        orderBy: [{ txnDate: "desc" }, { id: "desc" }],
        take: limit + 1,
        include: { account: true, category: true, attributedUser: true },
    });
    const cursorResponse = (0, pagination_1.buildCursorResponse)(items, limit, (item) => (0, pagination_1.encodeCursor)([item.txnDate, item.id]));
    return cursorResponse;
}
async function getTransaction(userId, transactionId) {
    const txn = await prisma_1.prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { account: true, category: true, attributedUser: true },
    });
    if (!txn) {
        throw (0, errors_1.notFound)("Transaction not found");
    }
    await ensureHouseholdAccess(userId, txn.householdId);
    return txn;
}
async function updateTransaction(userId, transactionId, data) {
    const txn = await prisma_1.prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!txn) {
        throw (0, errors_1.notFound)("Transaction not found");
    }
    await ensureHouseholdAccess(userId, txn.householdId);
    return prisma_1.prisma.transaction.update({
        where: { id: transactionId },
        data,
        include: { account: true, category: true, attributedUser: true },
    });
}
