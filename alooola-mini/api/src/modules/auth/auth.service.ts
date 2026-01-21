/**
 * Business logic for the auth module.
 */
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

/** Issue tokens. */
export async function issueTokens(userId: string, email?: string, meta?: { userAgent?: string; ipAddress?: string }) {
  const accessToken = buildAccessToken(userId, email);
  const { rawToken, refresh } = await createRefreshToken({
    userId,
    userAgent: meta?.userAgent,
    ipAddress: meta?.ipAddress,
  });

  return { accessToken, refreshToken: rawToken, refreshId: refresh.id };
}

/** Validate a referral code. */
export async function validateReferralCode(code: string) {
  const referral = await prisma.referral.findUnique({
    where: { code },
    include: { owner: { select: { id: true, name: true } } },
  });
  
  if (!referral) {
    throw badRequest("Invalid referral code", "INVALID_REFERRAL_CODE");
  }
  
  return { valid: true, referrerName: referral.owner.name };
}

/** Generate unique referral code for a user. */
async function generateUniqueReferralCode() {
  for (let i = 0; i < 5; i += 1) {
    const code = generateToken(4).toUpperCase();
    const exists = await prisma.referral.findUnique({ where: { code } });
    if (!exists) {
      return code;
    }
  }
  return generateToken(6).toUpperCase();
}

/** Start email verification. */
export async function startEmailVerification(email: string, mode: "login" | "signup" = "login", referralCode?: string, name?: string) {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  // For login mode, user must already exist
  if (mode === "login" && !existingUser) {
    throw badRequest("No account found with this email. Please sign up first.", "ACCOUNT_NOT_FOUND");
  }

  // For signup mode, warn if user already exists (they should login instead)
  // But still allow it - they might have forgotten they have an account
  const isNewUser = !existingUser;

  // Validate referral code if provided
  let referredByUserId: string | null = null;
  if (referralCode && isNewUser) {
    const referral = await prisma.referral.findUnique({
      where: { code: referralCode.toUpperCase() },
    });
    if (referral) {
      referredByUserId = referral.ownerUserId;
      // Track the signup event
      await prisma.referralEvent.create({
        data: {
          referralId: referral.id,
          eventType: "signup",
          meta: { email },
        },
      });
    }
  }

  const user = existingUser ?? await prisma.user.create({ 
    data: { 
      email,
      ...(name && { name }),
      ...(referredByUserId && { referredByUserId }),
    } 
  });

  // Generate referral code for new users
  if (isNewUser) {
    const code = await generateUniqueReferralCode();
    await prisma.referral.create({
      data: { ownerUserId: user.id, code },
    });
  }

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

  const subject = mode === "signup" ? "Welcome to Alooola - Verify your email" : "Verify your Alooola login";

  await sendEmail({
    to: email,
    subject,
    text: `Your verification token is ${token}. Link: ${verifyLink} (or ${deepLink})`,
    html: `
      <p>Your verification token is <strong>${token}</strong>.</p>
      <p><a href="${verifyLink}">Verify email</a></p>
      <p>Mobile: ${deepLink}</p>
    `,
  });

  return { userId: user.id, isNewUser };
}

/** Helper for verify email token. */
export async function verifyEmailToken(email: string, token: string, meta?: { userAgent?: string; ipAddress?: string }) {
  const tokenHash = hashToken(token);
  const user = await prisma.user.findUnique({
    where: { email },
    include: { investmentProfile: true },
  });
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
  
  // User needs onboarding if they have no name or haven't completed investment profile
  const needsOnboarding = !user.name || !user.investmentProfile?.completedAt;
  
  // Return user without the included relation for the response
  const { investmentProfile, ...userWithoutProfile } = user;
  
  return { user: userWithoutProfile, tokens, needsOnboarding };
}

/** Refresh tokens. */
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

/** Revoke refresh token. */
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

/** Revoke all refresh tokens. */
export async function revokeAllRefreshTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
