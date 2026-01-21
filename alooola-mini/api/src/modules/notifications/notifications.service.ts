/**
 * Business logic for the notifications module.
 */
import { prisma } from "../../db/prisma";
import { notFound } from "../../lib/errors";

export interface NotificationData {
  inviteId?: string;
  inviteToken?: string;
  householdId?: string;
  householdName?: string;
  inviterName?: string;
  [key: string]: unknown;
}

/** List notifications for a user. */
export async function listNotifications(userId: string, options?: { unreadOnly?: boolean }) {
  const where: { userId: string; readAt?: null } = { userId };
  
  if (options?.unreadOnly) {
    where.readAt = null;
  }

  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

/** Get unread notification count. */
export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

/** Mark notification as read. */
export async function markAsRead(userId: string, notificationId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw notFound("Notification not found");
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });
}

/** Mark all notifications as read for a user. */
export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });

  return { success: true };
}

/** Create a notification. */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: NotificationData
) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      data: data as object,
    },
  });
}

/** Delete a notification. */
export async function deleteNotification(userId: string, notificationId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw notFound("Notification not found");
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  return { success: true };
}
