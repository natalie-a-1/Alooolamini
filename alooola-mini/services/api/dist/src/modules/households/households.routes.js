"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.householdsRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const requireHouseholdRole_1 = require("../../middleware/requireHouseholdRole");
const households_schemas_1 = require("./households.schemas");
const households_service_1 = require("./households.service");
exports.householdsRouter = (0, express_1.Router)();
exports.householdsRouter.post("/", auth_1.requireAuth, (0, validate_1.validate)(households_schemas_1.createHouseholdSchema), async (req, res, next) => {
    try {
        const household = await (0, households_service_1.createHousehold)(req.user.id, req.body.name);
        res.json({ data: household });
    }
    catch (err) {
        next(err);
    }
});
exports.householdsRouter.get("/me", auth_1.requireAuth, async (req, res, next) => {
    try {
        const households = await (0, households_service_1.listHouseholds)(req.user.id);
        res.json({ data: households });
    }
    catch (err) {
        next(err);
    }
});
exports.householdsRouter.get("/:householdId", auth_1.requireAuth, async (req, res, next) => {
    try {
        const household = await (0, households_service_1.getHouseholdDetail)(req.user.id, req.params.householdId);
        res.json({ data: household });
    }
    catch (err) {
        next(err);
    }
});
exports.householdsRouter.get("/:householdId/members", auth_1.requireAuth, (0, requireHouseholdRole_1.requireHouseholdRole)(["owner", "member", "viewer"]), async (req, res, next) => {
    try {
        const members = await (0, households_service_1.listMembers)(req.params.householdId);
        res.json({ data: members });
    }
    catch (err) {
        next(err);
    }
});
exports.householdsRouter.patch("/:householdId/members/:memberId", auth_1.requireAuth, (0, requireHouseholdRole_1.requireHouseholdRole)(["owner"]), (0, validate_1.validate)(households_schemas_1.updateMemberSchema), async (req, res, next) => {
    try {
        const member = await (0, households_service_1.updateMember)(req.params.householdId, req.params.memberId, req.body);
        res.json({ data: member });
    }
    catch (err) {
        next(err);
    }
});
exports.householdsRouter.post("/:householdId/invites", auth_1.requireAuth, (0, requireHouseholdRole_1.requireHouseholdRole)(["owner"]), (0, validate_1.validate)(households_schemas_1.createInviteSchema), async (req, res, next) => {
    try {
        const invite = await (0, households_service_1.createInvite)(req.params.householdId, req.body.email);
        res.json({ data: invite });
    }
    catch (err) {
        next(err);
    }
});
