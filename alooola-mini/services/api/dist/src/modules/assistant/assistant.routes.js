/**
 * Project source file.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assistantRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const assistant_schemas_1 = require("./assistant.schemas");
const assistant_service_1 = require("./assistant.service");
exports.assistantRouter = (0, express_1.Router)();
exports.assistantRouter.get("/threads", auth_1.requireAuth, async (req, res, next) => {
    try {
        const threads = await (0, assistant_service_1.listThreads)(req.user.id);
        res.json({ data: threads });
    }
    catch (err) {
        next(err);
    }
});
exports.assistantRouter.post("/threads", auth_1.requireAuth, (0, validate_1.validate)(assistant_schemas_1.createThreadSchema), async (req, res, next) => {
    try {
        const thread = await (0, assistant_service_1.createThread)(req.user.id, req.body);
        res.json({ data: thread });
    }
    catch (err) {
        next(err);
    }
});
exports.assistantRouter.get("/threads/:threadId", auth_1.requireAuth, (0, validate_1.validate)(assistant_schemas_1.threadDetailSchema), async (req, res, next) => {
    try {
        const thread = await (0, assistant_service_1.getThread)(req.user.id, req.params.threadId);
        res.json({ data: thread });
    }
    catch (err) {
        next(err);
    }
});
exports.assistantRouter.get("/threads/:threadId/messages", auth_1.requireAuth, (0, validate_1.validate)(assistant_schemas_1.listMessagesSchema), async (req, res, next) => {
    try {
        const result = await (0, assistant_service_1.listMessages)(req.user.id, req.params.threadId, req.query);
        res.json({ data: result.items, meta: { nextCursor: result.nextCursor, hasMore: result.hasMore } });
    }
    catch (err) {
        next(err);
    }
});
exports.assistantRouter.post("/threads/:threadId/messages", auth_1.requireAuth, (0, validate_1.validate)(assistant_schemas_1.createMessageSchema), async (req, res, next) => {
    try {
        const result = await (0, assistant_service_1.addMessage)(req.user.id, req.params.threadId, req.body.content);
        res.json({ data: result });
    }
    catch (err) {
        next(err);
    }
});
