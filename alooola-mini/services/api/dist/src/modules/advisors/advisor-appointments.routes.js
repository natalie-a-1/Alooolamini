"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advisorAppointmentsRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const advisors_schemas_1 = require("./advisors.schemas");
const advisors_service_1 = require("./advisors.service");
exports.advisorAppointmentsRouter = (0, express_1.Router)();
exports.advisorAppointmentsRouter.post("/advisor-appointments", auth_1.requireAuth, (0, validate_1.validate)(advisors_schemas_1.bookAppointmentSchema), async (req, res, next) => {
    try {
        const appointment = await (0, advisors_service_1.bookAppointment)(req.user.id, req.body);
        res.json({ data: appointment });
    }
    catch (err) {
        next(err);
    }
});
