/**
 * Project source file.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const validate_1 = require("../../middleware/validate");
const rateLimit_1 = require("../../middleware/rateLimit");
const auth_1 = require("../../middleware/auth");
const auth_schemas_1 = require("./auth.schemas");
const auth_service_1 = require("./auth.service");
const prisma_1 = require("../../db/prisma");
const crypto_1 = require("../../lib/crypto");
exports.authRouter = (0, express_1.Router)();
const emailLimiter = (0, rateLimit_1.createRateLimiter)(60 * 1000, 10);
exports.authRouter.post("/email/start", emailLimiter, (0, validate_1.validate)(auth_schemas_1.emailStartSchema), async (req, res, next) => {
    try {
        const { email } = req.body;
        await (0, auth_service_1.startEmailVerification)(email);
        res.json({ data: { sent: true } });
    }
    catch (err) {
        next(err);
    }
});
exports.authRouter.post("/email/verify", (0, validate_1.validate)(auth_schemas_1.emailVerifySchema), async (req, res, next) => {
    try {
        const { email, token } = req.body;
        const meta = { userAgent: req.get("user-agent") ?? undefined, ipAddress: req.ip };
        const result = await (0, auth_service_1.verifyEmailToken)(email, token, meta);
        res.json({ data: { user: result.user, ...result.tokens } });
    }
    catch (err) {
        next(err);
    }
});
exports.authRouter.post("/refresh", (0, validate_1.validate)(auth_schemas_1.refreshSchema), async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const meta = { userAgent: req.get("user-agent") ?? undefined, ipAddress: req.ip };
        const result = await (0, auth_service_1.refreshTokens)(refreshToken, meta);
        res.json({ data: { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken } });
    }
    catch (err) {
        next(err);
    }
});
exports.authRouter.post("/logout", auth_1.requireAuth, (0, validate_1.validate)(auth_schemas_1.logoutSchema), async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await (0, auth_service_1.revokeRefreshToken)(refreshToken);
        }
        else if (req.user) {
            await (0, auth_service_1.revokeAllRefreshTokens)(req.user.id);
        }
        res.json({ data: { revoked: true } });
    }
    catch (err) {
        next(err);
    }
});
exports.authRouter.post("/demo", (0, validate_1.validate)(auth_schemas_1.demoSchema), async (req, res, next) => {
    try {
        const email = req.body.email ?? `demo+${(0, crypto_1.generateToken)(6)}@alooola.local`;
        const name = req.body.name ?? "Demo User";
        const user = await prisma_1.prisma.user.upsert({
            where: { email },
            update: { name },
            create: { email, name },
        });
        const tokens = await (0, auth_service_1.issueTokens)(user.id, user.email, { userAgent: req.get("user-agent") ?? undefined, ipAddress: req.ip });
        res.json({ data: { user, ...tokens } });
    }
    catch (err) {
        next(err);
    }
});
