/**
 * Project source file.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listThreads = listThreads;
exports.createThread = createThread;
exports.getThread = getThread;
exports.listMessages = listMessages;
exports.addMessage = addMessage;
const prisma_1 = require("../../db/prisma");
const pagination_1 = require("../../lib/pagination");
const errors_1 = require("../../lib/errors");
function buildAssistantReply(userMessage) {
    return `Got it. You said: "${userMessage}". Here's a quick summary and next steps.`;
}
async function ensureThreadAccess(userId, threadId) {
    const thread = await prisma_1.prisma.assistantThread.findUnique({ where: { id: threadId } });
    if (!thread) {
        throw (0, errors_1.notFound)("Thread not found");
    }
    if (thread.userId !== userId) {
        throw (0, errors_1.forbidden)("Not allowed");
    }
    return thread;
}
async function listThreads(userId) {
    return prisma_1.prisma.assistantThread.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
    });
}
async function createThread(userId, data) {
    return prisma_1.prisma.assistantThread.create({
        data: {
            userId,
            householdId: data.householdId ?? null,
            title: data.title ?? null,
        },
    });
}
async function getThread(userId, threadId) {
    await ensureThreadAccess(userId, threadId);
    return prisma_1.prisma.assistantThread.findUnique({ where: { id: threadId } });
}
async function listMessages(userId, threadId, options) {
    await ensureThreadAccess(userId, threadId);
    const limit = options.limit ?? 25;
    const where = { threadId };
    if (options.cursor) {
        const [createdAtIso, id] = (0, pagination_1.decodeCursor)(options.cursor);
        const createdAt = new Date(createdAtIso);
        where.OR = [
            { createdAt: { lt: createdAt } },
            { createdAt, id: { lt: id } },
        ];
    }
    const items = await prisma_1.prisma.assistantMessage.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit + 1,
    });
    const cursorResponse = (0, pagination_1.buildCursorResponse)(items, limit, (item) => (0, pagination_1.encodeCursor)([item.createdAt, item.id]));
    return cursorResponse;
}
async function addMessage(userId, threadId, content) {
    await ensureThreadAccess(userId, threadId);
    const userMessage = await prisma_1.prisma.assistantMessage.create({
        data: {
            threadId,
            sender: "user",
            content,
        },
    });
    const replyText = buildAssistantReply(content);
    const assistantMessage = await prisma_1.prisma.assistantMessage.create({
        data: {
            threadId,
            sender: "assistant",
            content: replyText,
        },
    });
    await prisma_1.prisma.assistantThread.update({
        where: { id: threadId },
        data: { updatedAt: new Date() },
    });
    return { userMessage, assistantMessage };
}
