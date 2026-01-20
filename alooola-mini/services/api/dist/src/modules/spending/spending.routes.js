/**
 * Project source file.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spendingRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const requireHouseholdRole_1 = require("../../middleware/requireHouseholdRole");
const validate_1 = require("../../middleware/validate");
const spending_schemas_1 = require("./spending.schemas");
const spending_service_1 = require("./spending.service");
exports.spendingRouter = (0, express_1.Router)();
exports.spendingRouter.get("/households/:householdId/accounts", auth_1.requireAuth, (0, requireHouseholdRole_1.requireHouseholdRole)(["owner", "member", "viewer"]), (0, validate_1.validate)(spending_schemas_1.listAccountsSchema), async (req, res, next) => {
    try {
        const accounts = await (0, spending_service_1.listAccounts)(req.params.householdId);
        res.json({ data: accounts });
    }
    catch (err) {
        next(err);
    }
});
exports.spendingRouter.get("/accounts/:accountId", auth_1.requireAuth, (0, validate_1.validate)(spending_schemas_1.accountDetailSchema), async (req, res, next) => {
    try {
        const account = await (0, spending_service_1.getAccount)(req.user.id, req.params.accountId);
        res.json({ data: account });
    }
    catch (err) {
        next(err);
    }
});
exports.spendingRouter.get("/households/:householdId/categories", auth_1.requireAuth, (0, requireHouseholdRole_1.requireHouseholdRole)(["owner", "member", "viewer"]), (0, validate_1.validate)(spending_schemas_1.listCategoriesSchema), async (req, res, next) => {
    try {
        const categories = await (0, spending_service_1.listCategories)(req.params.householdId);
        res.json({ data: categories });
    }
    catch (err) {
        next(err);
    }
});
exports.spendingRouter.post("/households/:householdId/categories", auth_1.requireAuth, (0, requireHouseholdRole_1.requireHouseholdRole)(["owner", "member"]), (0, validate_1.validate)(spending_schemas_1.createCategorySchema), async (req, res, next) => {
    try {
        const category = await (0, spending_service_1.createCategory)(req.params.householdId, req.body.name);
        res.json({ data: category });
    }
    catch (err) {
        next(err);
    }
});
exports.spendingRouter.get("/households/:householdId/transactions", auth_1.requireAuth, (0, requireHouseholdRole_1.requireHouseholdRole)(["owner", "member", "viewer"]), (0, validate_1.validate)(spending_schemas_1.listTransactionsSchema), async (req, res, next) => {
    try {
        const result = await (0, spending_service_1.listTransactions)(req.params.householdId, req.query);
        res.json({ data: result.items, meta: { nextCursor: result.nextCursor, hasMore: result.hasMore } });
    }
    catch (err) {
        next(err);
    }
});
exports.spendingRouter.get("/transactions/:transactionId", auth_1.requireAuth, (0, validate_1.validate)(spending_schemas_1.transactionDetailSchema), async (req, res, next) => {
    try {
        const transaction = await (0, spending_service_1.getTransaction)(req.user.id, req.params.transactionId);
        res.json({ data: transaction });
    }
    catch (err) {
        next(err);
    }
});
exports.spendingRouter.patch("/transactions/:transactionId", auth_1.requireAuth, (0, validate_1.validate)(spending_schemas_1.patchTransactionSchema), async (req, res, next) => {
    try {
        const transaction = await (0, spending_service_1.updateTransaction)(req.user.id, req.params.transactionId, req.body);
        res.json({ data: transaction });
    }
    catch (err) {
        next(err);
    }
});
