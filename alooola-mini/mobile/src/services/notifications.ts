/**
 * Notifications API service.
 */
import { apiDelete, apiGet, apiPost } from './api';

export interface NotificationData {
  inviteId?: string;
  inviteToken?: string;
  householdId?: string;
  householdName?: string;
  inviterName?: string;
  inviterEmail?: string;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data: NotificationData | null;
  readAt: string | null;
  createdAt: string;
}

/**
 * Get all notifications for the current user.
 */
export async function getNotifications(unreadOnly = false): Promise<Notification[]> {
  const query = unreadOnly ? '?unread=true' : '';
  return apiGet<Notification[]>(`/notifications${query}`);
}

/**
 * Get unread notification count.
 */
export async function getUnreadCount(): Promise<{ count: number }> {
  return apiGet<{ count: number }>('/notifications/unread-count');
}

/**
 * Mark a notification as read.
 */
export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  return apiPost<Notification>(`/notifications/${notificationId}/read`);
}

/**
 * Mark all notifications as read.
 */
export async function markAllNotificationsAsRead(): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>('/notifications/read-all');
}

/**
 * Delete a notification.
 */
export async function deleteNotification(notificationId: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`/notifications/${notificationId}`);
}

/**
 * Accept a household invite.
 */
export async function acceptHouseholdInvite(inviteToken: string): Promise<{ invite: unknown; membership: unknown }> {
  return apiPost<{ invite: unknown; membership: unknown }>(`/invites/${inviteToken}/accept`);
}

/**
 * Decline a household invite.
 */
export async function declineHouseholdInvite(inviteToken: string): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`/invites/${inviteToken}/decline`);
}
