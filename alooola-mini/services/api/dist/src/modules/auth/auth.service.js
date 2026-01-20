/**
 * Project source file.
 */
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.issueTokens = issueTokens;
exports.startEmailVerification = startEmailVerification;
exports.verifyEmailToken = verifyEmailToken;
exports.refreshTokens = refreshTokens;
exports.revokeRefreshToken = revokeRefreshToken;
exports.revokeAllRefreshTokens = revokeAllRefreshTokens;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../db/prisma");
const env_1 = require("../../config/env");
const crypto_1 = require("../../lib/crypto");
const errors_1 = require("../../lib/errors");
const email_provider_1 = require("../email/email.provider");
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_DAYS = 30;
const EMAIL_TOKEN_MINUTES = 15;
function buildAccessToken(userId, email) {
    return jsonwebtoken_1.default.sign({ sub: userId, email }, env_1.env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}
async function createRefreshToken(params) {
    const rawToken = (0, crypto_1.generateToken)(48);
    const tokenHash = (0, crypto_1.hashToken)(rawToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
    const refresh = await prisma_1.prisma.refreshToken.create({
        data: {
            userId: params.userId,
            tokenHash,
            userAgent: params.userAgent,
            ipAddress: params.ipAddress,
            expiresAt,
            replacedById: params.replaceTokenId ?? null,
        },
    });
    return { rawToken, refresh };
}
async function issueTokens(userId, email, meta) {
    const accessToken = buildAccessToken(userId, email);
    const { rawToken, refresh } = await createRefreshToken({
        userId,
        userAgent: meta?.userAgent,
        ipAddress: meta?.ipAddress,
    });
    return { accessToken, refreshToken: rawToken, refreshId: refresh.id };
}
async function startEmailVerification(email) {
    const user = await prisma_1.prisma.user.upsert({
        where: { email },
        update: {},
        create: { email },
    });
    const token = (0, crypto_1.generateToken)(20);
    const tokenHash = (0, crypto_1.hashToken)(token);
    const expiresAt = new Date(Date.now() + EMAIL_TOKEN_MINUTES * 60 * 1000);
    await prisma_1.prisma.emailVerification.create({
        data: {
            userId: user.id,
            tokenHash,
            expiresAt,
        },
    });
    const verifyLink = `${env_1.env.APP_BASE_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    const deepLink = `${env_1.env.MOBILE_DEEPLINK_BASE}verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    await (0, email_provider_1.sendEmail)({
        to: email,
        subject: "Verify your Alooola email",
        text: `Your verification token is ${token}. Link: ${verifyLink} (or ${deepLink})`,
        html: `
      <p>Your verification token is <strong>${token}</strong>.</p>
      <p><a href="${verifyLink}">Verify email</a></p>
      <p>Mobile: ${deepLink}</p>
    `,
    });
    return { userId: user.id };
}
async function verifyEmailToken(email, token, meta) {
    const tokenHash = (0, crypto_1.hashToken)(token);
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw (0, errors_1.badRequest)("Invalid token");
    }
    const verification = await prisma_1.prisma.emailVerification.findFirst({
        where: {
            userId: user.id,
            tokenHash,
            verifiedAt: null,
            expiresAt: { gt: new Date() },
        },
    });
    if (!verification) {
        throw (0, errors_1.badRequest)("Invalid or expired token");
    }
    await prisma_1.prisma.emailVerification.update({
        where: { id: verification.id },
        data: { verifiedAt: new Date() },
    });
    const tokens = await issueTokens(user.id, user.email, meta);
    return { user, tokens };
}
async function refreshTokens(rawRefreshToken, meta) {
    const tokenHash = (0, crypto_1.hashToken)(rawRefreshToken);
    const refresh = await prisma_1.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!refresh || refresh.revokedAt || refresh.expiresAt <= new Date()) {
        throw (0, errors_1.unauthorized)("Refresh token invalid");
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { id: refresh.userId } });
    if (!user) {
        throw (0, errors_1.unauthorized)("Refresh token invalid");
    }
    const { rawToken, refresh: newRefresh } = await createRefreshToken({
        userId: user.id,
        userAgent: meta?.userAgent,
        ipAddress: meta?.ipAddress,
    });
    await prisma_1.prisma.refreshToken.update({
        where: { id: refresh.id },
        data: { revokedAt: new Date(), replacedById: newRefresh.id },
    });
    const accessToken = buildAccessToken(user.id, user.email);
    return { accessToken, refreshToken: rawToken, user };
}
async function revokeRefreshToken(rawRefreshToken) {
    const tokenHash = (0, crypto_1.hashToken)(rawRefreshToken);
    const refresh = await prisma_1.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!refresh) {
        return;
    }
    await prisma_1.prisma.refreshToken.update({
        where: { id: refresh.id },
        data: { revokedAt: new Date() },
    });
}
async function revokeAllRefreshTokens(userId) {
    await prisma_1.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
}
