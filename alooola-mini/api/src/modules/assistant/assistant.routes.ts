/**
 * Route handlers for the assistant module.
 */
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  createMessageSchema,
  createThreadSchema,
  listMessagesSchema,
  threadDetailSchema,
} from "./assistant.schemas";
import { addMessage, createThread, getThread, listMessages, listThreads } from "./assistant.service";

/** Router for assistant routes. */
export const assistantRouter = Router();

assistantRouter.get("/threads", requireAuth, async (req, res, next) => {
  try {
    const threads = await listThreads(req.user!.id);
    res.json({ data: threads });
  } catch (err) {
    next(err);
  }
});

assistantRouter.post("/threads", requireAuth, validate(createThreadSchema), async (req, res, next) => {
  try {
    const thread = await createThread(req.user!.id, req.body);
    res.json({ data: thread });
  } catch (err) {
    next(err);
  }
});

assistantRouter.get("/threads/:threadId", requireAuth, validate(threadDetailSchema), async (req, res, next) => {
  try {
    const thread = await getThread(req.user!.id, req.params.threadId);
    res.json({ data: thread });
  } catch (err) {
    next(err);
  }
});

assistantRouter.get("/threads/:threadId/messages", requireAuth, validate(listMessagesSchema), async (req, res, next) => {
  try {
    const result = await listMessages(req.user!.id, req.params.threadId, req.query);
    res.json({ data: result.items, meta: { nextCursor: result.nextCursor, hasMore: result.hasMore } });
  } catch (err) {
    next(err);
  }
});

assistantRouter.post("/threads/:threadId/messages", requireAuth, validate(createMessageSchema), async (req, res, next) => {
  try {
    const result = await addMessage(req.user!.id, req.params.threadId, req.body.content);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});
