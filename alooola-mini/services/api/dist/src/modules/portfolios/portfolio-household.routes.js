"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portfolioHouseholdRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const requireHouseholdRole_1 = require("../../middleware/requireHouseholdRole");
const validate_1 = require("../../middleware/validate");
const portfolios_schemas_1 = require("./portfolios.schemas");
const portfolios_service_1 = require("./portfolios.service");
exports.portfolioHouseholdRouter = (0, express_1.Router)();
exports.portfolioHouseholdRouter.post("/households/:householdId/portfolio-positions", auth_1.requireAuth, (0, requireHouseholdRole_1.requireHouseholdRole)(["owner", "member"]), (0, validate_1.validate)(portfolios_schemas_1.createPositionSchema), async (req, res, next) => {
    try {
        const position = await (0, portfolios_service_1.createPosition)(req.user.id, req.params.householdId, req.body);
        res.json({ data: position });
    }
    catch (err) {
        next(err);
    }
});
exports.portfolioHouseholdRouter.get("/households/:householdId/portfolio-positions", auth_1.requireAuth, (0, requireHouseholdRole_1.requireHouseholdRole)(["owner", "member", "viewer"]), (0, validate_1.validate)(portfolios_schemas_1.listPositionsSchema), async (req, res, next) => {
    try {
        const positions = await (0, portfolios_service_1.listPositions)(req.user.id, req.params.householdId);
        res.json({ data: positions });
    }
    catch (err) {
        next(err);
    }
});
exports.portfolioHouseholdRouter.get("/households/:householdId/portfolio-snapshots", auth_1.requireAuth, (0, requireHouseholdRole_1.requireHouseholdRole)(["owner", "member", "viewer"]), (0, validate_1.validate)(portfolios_schemas_1.listSnapshotsSchema), async (req, res, next) => {
    try {
        const range = typeof req.query.range === "string" ? req.query.range : undefined;
        const snapshots = await (0, portfolios_service_1.listSnapshots)(req.user.id, req.params.householdId, range);
        res.json({ data: snapshots });
    }
    catch (err) {
        next(err);
    }
});
