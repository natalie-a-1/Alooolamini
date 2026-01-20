"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const onboarding_schemas_1 = require("./onboarding.schemas");
const onboarding_service_1 = require("./onboarding.service");
exports.onboardingRouter = (0, express_1.Router)();
exports.onboardingRouter.get("/options", (0, validate_1.validate)(onboarding_schemas_1.onboardingOptionsSchema), async (_req, res, next) => {
    try {
        const data = await (0, onboarding_service_1.getOnboardingOptions)();
        res.json({ data });
    }
    catch (err) {
        next(err);
    }
});
exports.onboardingRouter.get("/me", auth_1.requireAuth, async (req, res, next) => {
    try {
        const data = await (0, onboarding_service_1.getOnboardingForUser)(req.user.id);
        res.json({ data });
    }
    catch (err) {
        next(err);
    }
});
exports.onboardingRouter.put("/me", auth_1.requireAuth, (0, validate_1.validate)(onboarding_schemas_1.onboardingMeSchema), async (req, res, next) => {
    try {
        const data = await (0, onboarding_service_1.upsertOnboarding)(req.user.id, req.body);
        res.json({ data });
    }
    catch (err) {
        next(err);
    }
});
