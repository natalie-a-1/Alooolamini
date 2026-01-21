/**
 * Business logic for the auth module.
 */
import jwt from "jsonwebtoken";
import { prisma } from "../../db/prisma";
import { env } from "../../config/env";
import { generateToken, hashPassword, hashToken, verifyPassword } from "../../lib/crypto";
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

async function ensureReferralCode(userId: string) {
  const existing = await prisma.referral.findFirst({ where: { ownerUserId: userId } });
  if (existing) return;

  const code = await generateUniqueReferralCode();
  await prisma.referral.create({
    data: { ownerUserId: userId, code },
  });
}

async function sendSignupVerificationEmail(userId: string, email: string) {
  const token = generateToken(20);
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + EMAIL_TOKEN_MINUTES * 60 * 1000);

  await prisma.emailVerification.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  const verifyLink = `${env.APP_BASE_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  const deepLink = `${env.MOBILE_DEEPLINK_BASE}verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  const subject = "Welcome to Alooola - Verify your email";

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
}

/** Register with email + password and send verification. */
export async function registerWithPassword(email: string, password: string, name: string, referralCode?: string) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { auth: true },
  });

  if (existingUser?.auth) {
    const verified = await prisma.emailVerification.findFirst({
      where: { userId: existingUser.id, verifiedAt: { not: null } },
    });

    if (verified) {
      throw badRequest("Account already exists. Please log in.", "ACCOUNT_EXISTS");
    }

    const passwordValid = await verifyPassword(password, existingUser.auth.passwordHash);
    if (!passwordValid) {
      throw badRequest("Account already exists. Please log in.", "ACCOUNT_EXISTS");
    }

    await sendSignupVerificationEmail(existingUser.id, existingUser.email);
    return { userId: existingUser.id, isNewUser: false };
  }

  const isNewUser = !existingUser;

  let referredByUserId: string | null = null;
  if (referralCode && isNewUser) {
    const referral = await prisma.referral.findUnique({
      where: { code: referralCode.toUpperCase() },
    });
    if (referral) {
      referredByUserId = referral.ownerUserId;
      await prisma.referralEvent.create({
        data: {
          referralId: referral.id,
          eventType: "signup",
          meta: { email },
        },
      });
    }
  }

  const user =
    existingUser ??
    (await prisma.user.create({
      data: {
        email,
        name,
        ...(referredByUserId && { referredByUserId }),
      },
    }));

  if (existingUser && !existingUser.name && name) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { name },
    });
  }

  const passwordHash = await hashPassword(password);
  await prisma.userAuth.upsert({
    where: { userId: user.id },
    update: { passwordHash, passwordUpdatedAt: new Date() },
    create: {
      userId: user.id,
      passwordHash,
      passwordUpdatedAt: new Date(),
      mfaEnabled: false,
    },
  });

  await ensureReferralCode(user.id);
  await sendSignupVerificationEmail(user.id, user.email);

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

/** Login with email + password. */
export async function loginWithPassword(email: string, password: string, meta?: { userAgent?: string; ipAddress?: string }) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { auth: true, investmentProfile: true },
  });

  if (!user) {
    throw badRequest("Account not found. Please create an account.", "ACCOUNT_NOT_FOUND");
  }

  if (!user.auth) {
    throw badRequest("Account not found. Please create an account.", "ACCOUNT_NOT_FOUND");
  }

  const passwordValid = await verifyPassword(password, user.auth.passwordHash);
  if (!passwordValid) {
    throw badRequest("Invalid password", "INVALID_PASSWORD");
  }

  const verified = await prisma.emailVerification.findFirst({
    where: { userId: user.id, verifiedAt: { not: null } },
  });

  if (!verified) {
    throw badRequest("Please verify your email before logging in.", "EMAIL_NOT_VERIFIED");
  }

  const tokens = await issueTokens(user.id, user.email, meta);
  const needsOnboarding = !user.name || !user.investmentProfile?.completedAt;
  const { auth, investmentProfile, ...userWithoutProfile } = user;
  return { user: userWithoutProfile, ...tokens, needsOnboarding };
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
