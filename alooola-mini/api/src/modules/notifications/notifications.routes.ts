/**
 * Route handlers for the notifications module.
 */
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "./notifications.service";

/** Router for notifications routes. */
export const notificationsRouter = Router();

// List notifications for the authenticated user
notificationsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const unreadOnly = req.query.unread === "true";
    const notifications = await listNotifications(req.user!.id, { unreadOnly });
    res.json({ data: notifications });
  } catch (err) {
    next(err);
  }
});

// Get unread count
notificationsRouter.get("/unread-count", requireAuth, async (req, res, next) => {
  try {
    const count = await getUnreadCount(req.user!.id);
    res.json({ data: { count } });
  } catch (err) {
    next(err);
  }
});

// Mark a specific notification as read
notificationsRouter.post("/:notificationId/read", requireAuth, async (req, res, next) => {
  try {
    const notification = await markAsRead(req.user!.id, req.params.notificationId);
    res.json({ data: notification });
  } catch (err) {
    next(err);
  }
});

// Mark all notifications as read
notificationsRouter.post("/read-all", requireAuth, async (req, res, next) => {
  try {
    const result = await markAllAsRead(req.user!.id);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// Delete a notification
notificationsRouter.delete("/:notificationId", requireAuth, async (req, res, next) => {
  try {
    const result = await deleteNotification(req.user!.id, req.params.notificationId);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});
