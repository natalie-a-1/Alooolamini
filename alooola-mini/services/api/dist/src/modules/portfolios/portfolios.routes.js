/**
 * Project source file.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portfoliosRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const portfolios_schemas_1 = require("./portfolios.schemas");
const portfolios_service_1 = require("./portfolios.service");
exports.portfoliosRouter = (0, express_1.Router)();
exports.portfoliosRouter.get("/", auth_1.requireAuth, async (_req, res, next) => {
    try {
        const portfolios = await (0, portfolios_service_1.listPortfolios)();
        res.json({ data: portfolios });
    }
    catch (err) {
        next(err);
    }
});
exports.portfoliosRouter.get("/:portfolioId", auth_1.requireAuth, (0, validate_1.validate)(portfolios_schemas_1.portfolioDetailSchema), async (req, res, next) => {
    try {
        const portfolio = await (0, portfolios_service_1.getPortfolio)(req.params.portfolioId);
        res.json({ data: portfolio });
    }
    catch (err) {
        next(err);
    }
});
exports.portfoliosRouter.get("/:portfolioId/holdings", auth_1.requireAuth, (0, validate_1.validate)(portfolios_schemas_1.portfolioDetailSchema), async (req, res, next) => {
    try {
        const holdings = await (0, portfolios_service_1.listHoldings)(req.params.portfolioId);
        res.json({ data: holdings });
    }
    catch (err) {
        next(err);
    }
});
