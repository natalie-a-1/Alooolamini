import { prisma } from "../../db/prisma";
import { decodeCursor, encodeCursor, buildCursorResponse } from "../../lib/pagination";
import { notFound, forbidden } from "../../lib/errors";

function buildAssistantReply(userMessage: string) {
  return `Got it. You said: "${userMessage}". Here's a quick summary and next steps.`;
}

async function ensureThreadAccess(userId: string, threadId: string) {
  const thread = await prisma.assistantThread.findUnique({ where: { id: threadId } });
  if (!thread) {
    throw notFound("Thread not found");
  }
  if (thread.userId !== userId) {
    throw forbidden("Not allowed");
  }
  return thread;
}

export async function listThreads(userId: string) {
  return prisma.assistantThread.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createThread(userId: string, data: { title?: string; householdId?: string }) {
  return prisma.assistantThread.create({
    data: {
      userId,
      householdId: data.householdId ?? null,
      title: data.title ?? null,
    },
  });
}

export async function getThread(userId: string, threadId: string) {
  await ensureThreadAccess(userId, threadId);
  return prisma.assistantThread.findUnique({ where: { id: threadId } });
}

export async function listMessages(userId: string, threadId: string, options: { cursor?: string; limit?: number }) {
  await ensureThreadAccess(userId, threadId);

  const limit = options.limit ?? 25;
  const where: Record<string, unknown> = { threadId };

  if (options.cursor) {
    const [createdAtIso, id] = decodeCursor(options.cursor);
    const createdAt = new Date(createdAtIso);
    where.OR = [
      { createdAt: { lt: createdAt } },
      { createdAt, id: { lt: id } },
    ];
  }

  const items = await prisma.assistantMessage.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
  });

  const cursorResponse = buildCursorResponse(items, limit, (item) => encodeCursor([item.createdAt, item.id]));

  return cursorResponse;
}

export async function addMessage(userId: string, threadId: string, content: string) {
  await ensureThreadAccess(userId, threadId);

  const userMessage = await prisma.assistantMessage.create({
    data: {
      threadId,
      sender: "user",
      content,
    },
  });

  const replyText = buildAssistantReply(content);
  const assistantMessage = await prisma.assistantMessage.create({
    data: {
      threadId,
      sender: "assistant",
      content: replyText,
    },
  });

  await prisma.assistantThread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() },
  });

  return { userMessage, assistantMessage };
}
