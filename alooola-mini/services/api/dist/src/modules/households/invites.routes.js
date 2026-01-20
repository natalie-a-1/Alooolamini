/**
 * Project source file.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invitesRouter = void 0;
const express_1 = require("express");
const authOptional_1 = require("../../middleware/authOptional");
const validate_1 = require("../../middleware/validate");
const households_schemas_1 = require("./households.schemas");
const households_service_1 = require("./households.service");
exports.invitesRouter = (0, express_1.Router)();
exports.invitesRouter.get("/:token", async (req, res, next) => {
    try {
        const invite = await (0, households_service_1.getInvite)(req.params.token);
        res.json({ data: invite });
    }
    catch (err) {
        next(err);
    }
});
exports.invitesRouter.post("/:token/accept", authOptional_1.optionalAuth, (0, validate_1.validate)(households_schemas_1.acceptInviteSchema), async (req, res, next) => {
    try {
        const result = await (0, households_service_1.acceptInvite)(req.params.token, {
            userId: req.user?.id,
            email: req.body.email,
        });
        res.json({ data: result });
    }
    catch (err) {
        next(err);
    }
});
