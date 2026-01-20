"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralsRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const rateLimit_1 = require("../../middleware/rateLimit");
const referrals_schemas_1 = require("./referrals.schemas");
const referrals_service_1 = require("./referrals.service");
exports.referralsRouter = (0, express_1.Router)();
const referralLimiter = (0, rateLimit_1.createRateLimiter)(60 * 1000, 30);
exports.referralsRouter.post("/me", auth_1.requireAuth, async (req, res, next) => {
    try {
        const referral = await (0, referrals_service_1.getOrCreateReferral)(req.user.id);
        res.json({ data: referral });
    }
    catch (err) {
        next(err);
    }
});
exports.referralsRouter.get("/me", auth_1.requireAuth, async (req, res, next) => {
    try {
        const stats = await (0, referrals_service_1.getReferralStats)(req.user.id);
        res.json({ data: stats });
    }
    catch (err) {
        next(err);
    }
});
exports.referralsRouter.post("/:code/events", referralLimiter, (0, validate_1.validate)(referrals_schemas_1.referralEventSchema), async (req, res, next) => {
    try {
        const event = await (0, referrals_service_1.createReferralEvent)(req.params.code, req.body.eventType, req.body.meta);
        res.json({ data: event });
    }
    catch (err) {
        next(err);
    }
});
