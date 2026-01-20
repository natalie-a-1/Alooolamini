import jwt from "jsonwebtoken";
import { prisma } from "../../db/prisma";
import { env } from "../../config/env";
import { generateToken, hashToken } from "../../lib/crypto";
import { badRequest, unauthorized } from "../../lib/errors";
import { sendEmail } from "../email/email.provider";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_DAYS = 30;
const EMAIL_TOKEN_MINUTES = 15;

function buildAccessToken(userId: string, email?: string) {
  return jwt.sign({ sub: userId, email }, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

async function createRefreshToken(params: {
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  replaceTokenId?: string;
}) {
  const rawToken = generateToken(48);
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  const refresh = await prisma.refreshToken.create({
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

export async function issueTokens(userId: string, email?: string, meta?: { userAgent?: string; ipAddress?: string }) {
  const accessToken = buildAccessToken(userId, email);
  const { rawToken, refresh } = await createRefreshToken({
    userId,
    userAgent: meta?.userAgent,
    ipAddress: meta?.ipAddress,
  });

  return { accessToken, refreshToken: rawToken, refreshId: refresh.id };
}

export async function startEmailVerification(email: string) {
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const token = generateToken(20);
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + EMAIL_TOKEN_MINUTES * 60 * 1000);

  await prisma.emailVerification.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const verifyLink = `${env.APP_BASE_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  const deepLink = `${env.MOBILE_DEEPLINK_BASE}verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  await sendEmail({
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

export async function verifyEmailToken(email: string, token: string, meta?: { userAgent?: string; ipAddress?: string }) {
  const tokenHash = hashToken(token);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw badRequest("Invalid token");
  }

  const verification = await prisma.emailVerification.findFirst({
    where: {
      userId: user.id,
      tokenHash,
      verifiedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!verification) {
    throw badRequest("Invalid or expired token");
  }

  await prisma.emailVerification.update({
    where: { id: verification.id },
    data: { verifiedAt: new Date() },
  });

  const tokens = await issueTokens(user.id, user.email, meta);
  return { user, tokens };
}

export async function refreshTokens(rawRefreshToken: string, meta?: { userAgent?: string; ipAddress?: string }) {
  const tokenHash = hashToken(rawRefreshToken);
  const refresh = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!refresh || refresh.revokedAt || refresh.expiresAt <= new Date()) {
    throw unauthorized("Refresh token invalid");
  }

  const user = await prisma.user.findUnique({ where: { id: refresh.userId } });
  if (!user) {
    throw unauthorized("Refresh token invalid");
  }

  const { rawToken, refresh: newRefresh } = await createRefreshToken({
    userId: user.id,
    userAgent: meta?.userAgent,
    ipAddress: meta?.ipAddress,
  });

  await prisma.refreshToken.update({
    where: { id: refresh.id },
    data: { revokedAt: new Date(), replacedById: newRefresh.id },
  });

  const accessToken = buildAccessToken(user.id, user.email);

  return { accessToken, refreshToken: rawToken, user };
}

export async function revokeRefreshToken(rawRefreshToken: string) {
  const tokenHash = hashToken(rawRefreshToken);
  const refresh = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!refresh) {
    return;
  }
  await prisma.refreshToken.update({
    where: { id: refresh.id },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllRefreshTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
