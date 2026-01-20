"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advisorsRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const advisors_schemas_1 = require("./advisors.schemas");
const advisors_service_1 = require("./advisors.service");
exports.advisorsRouter = (0, express_1.Router)();
exports.advisorsRouter.get("/", auth_1.requireAuth, async (_req, res, next) => {
    try {
        const advisors = await (0, advisors_service_1.listAdvisors)();
        res.json({ data: advisors });
    }
    catch (err) {
        next(err);
    }
});
exports.advisorsRouter.get("/:advisorId/slots", auth_1.requireAuth, (0, validate_1.validate)(advisors_schemas_1.advisorSlotsSchema), async (req, res, next) => {
    try {
        const slots = await (0, advisors_service_1.listAdvisorSlots)(req.params.advisorId);
        res.json({ data: slots });
    }
    catch (err) {
        next(err);
    }
});
