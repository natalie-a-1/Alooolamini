/**
 * Business logic for the auth module.
 * 
 * This module contains the core authentication and authorization flow for users.
 * It handles JWT creation, password hashing, email verification, user registration,
 * token issuance and rotation, referral code enforcement, and demo flows.
 */

import jwt from "jsonwebtoken";
import { prisma } from "../../db/prisma";
import { env } from "../../config/env";
import { buildVerificationEmail } from "../../lib/assets";
import { generateToken, hashPassword, hashToken, verifyPassword } from "../../lib/crypto";
import { badRequest, unauthorized } from "../../lib/errors";
import { RequestMeta } from "../../lib/requestMeta";
import {
  DemoBody,
  EmailVerifyBody,
  LoginBody,
  RefreshBody,
  RegisterBody,
  ValidateReferralBody,
} from "./auth.schemas";
import { sendEmail } from "../email/email.provider";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_DAYS = 30;
const EMAIL_TOKEN_MINUTES = 15;
const DEMO_EMAIL = "alex.morgan@alooola.dev";

/**
 * Builds a JWT access token for the given user.
 * @param userId - The user ID to encode as the subject.
 * @param email - Optional email claim.
 * @returns signed JWT as string.
 */
function buildAccessToken(userId: string, email?: string) {
  return jwt.sign({ sub: userId, email }, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

/**
 * Creates a secure refresh token and persists its hash in the database.
 * Optionally marks an old token as replaced.
 * @param params - Information needed to create the refresh token.
 * @returns the raw refresh token and the database entity.
 */
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

/**
 * Determines whether a user profile is incomplete and the user needs onboarding.
 * @param user - User with at least a name and possibly an investmentProfile.
 * @returns true if missing name or investment profile is incomplete.
 */
function computeNeedsOnboarding(user: { name: string | null; investmentProfile?: { completedAt: Date | null } | null }) {
  return !user.name || !user.investmentProfile?.completedAt;
}

/**
 * Sanitizes a user object by removing relational properties not meant for API response.
 * @param user - The user object.
 * @returns Cleaned user object.
 */
function stripUserRelations<T extends { auth?: unknown; investmentProfile?: unknown }>(user: T) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { auth, investmentProfile, ...rest } = user;
  return rest;
}

/**
 * Creates and returns access and refresh tokens for a user, including the refresh ID.
 * @param userId - The user identity.
 * @param email - Optional user email.
 * @param meta - Optional request metadata for logging/audit.
 * @returns Access token, refresh token, and refresh database entity id.
 */
export async function issueTokens(userId: string, email?: string, meta?: RequestMeta) {
  const accessToken = buildAccessToken(userId, email);
  const { rawToken, refresh } = await createRefreshToken({
    userId,
    userAgent: meta?.userAgent,
    ipAddress: meta?.ipAddress,
  });

  return { accessToken, refreshToken: rawToken, refreshId: refresh.id };
}

/**
 * Looks up and validates a referral code, returning the referrer's name if found.
 * Throws on invalid.
 * @param code - The referral code to check.
 * @returns Success with referrer's name.
 */
export async function validateReferralCode(code: ValidateReferralBody["code"]) {
  const referral = await prisma.referral.findUnique({
    where: { code },
    include: { owner: { select: { id: true, name: true } } },
  });
  
  if (!referral) {
    throw badRequest("Invalid referral code", "INVALID_REFERRAL_CODE");
  }
  
  return { valid: true, referrerName: referral.owner.name };
}

/**
 * Generates a unique referral code not in use.
 * Tries up to 5 times to avoid collisions, returns a longer code if needed.
 * @returns Uppercase referral code string.
 */
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

/**
 * Ensures a referral code exists for the specified user. Creates a new code if not.
 * @param userId - User ID for which to ensure a code.
 */
async function ensureReferralCode(userId: string) {
  const existing = await prisma.referral.findFirst({ where: { ownerUserId: userId } });
  if (existing) return;

  const code = await generateUniqueReferralCode();
  await prisma.referral.create({
    data: { ownerUserId: userId, code },
  });
}

/**
 * Sends a signup verification email with a unique token to newly registered users.
 * Adds a database entry for future validation.
 * @param userId - ID of the user being verified.
 * @param email - User's email address to receive the token.
 */
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

  const emailPayload = buildVerificationEmail({
    token,
    verifyLink,
    deepLink,
    expiresMinutes: EMAIL_TOKEN_MINUTES,
  });

  await sendEmail({
    to: email,
    ...emailPayload,
  });
}

/**
 * Registers a user using email and password. 
 * Handles duplicate/partial accounts and referral logic.
 * Always sends email verification token.
 * @param email - The email for the new user.
 * @param password - Password in plain text.
 * @param name - Optional display name.
 * @param referralCode - Optional referral code provided during signup.
 * @returns New or existing userId, and if this is a new user.
 */
export async function registerWithPassword(
  email: RegisterBody["email"],
  password: RegisterBody["password"],
  name: RegisterBody["name"],
  referralCode?: RegisterBody["referralCode"],
) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { auth: true },
  });

  if (existingUser?.auth) {
    // Existing user, not yet verified.
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

  // Associate with a referrer if referral code exists and account is new.
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

  // If not already present, create the user entity.
  const user =
    existingUser ??
    (await prisma.user.create({
      data: {
        email,
        name,
        ...(referredByUserId && { referredByUserId }),
      },
    }));

  // Update name for existing user if not set.
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

/**
 * Verifies a user's email using a token and email address.
 * On success, marks verification, issues tokens, and signals onboarding state.
 * @param email - Email address of the user.
 * @param token - One-time verification token.
 * @param meta - Optional request metadata.
 * @returns User entity (sanitized), tokens, and needsOnboarding flag.
 */
export async function verifyEmailToken(email: EmailVerifyBody["email"], token: EmailVerifyBody["token"], meta?: RequestMeta) {
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

  const needsOnboarding = computeNeedsOnboarding(user);

  return { user: stripUserRelations(user), tokens, needsOnboarding };
}

/**
 * Attempts to log a user in using email and password.
 * Checks credentials, verification state, and signals onboarding state.
 * @param email - User login email.
 * @param password - User password (plain text).
 * @param meta - Optional request metadata.
 * @returns User (sanitized), tokens, and needsOnboarding.
 */
export async function loginWithPassword(email: LoginBody["email"], password: LoginBody["password"], meta?: RequestMeta) {
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
  const needsOnboarding = computeNeedsOnboarding(user);
  return { user: stripUserRelations(user), ...tokens, needsOnboarding };
}

/**
 * Performs refresh token rotation.
 * - Validates the old refresh token and expiry.
 * - Revokes previous refresh/token row.
 * - Issues new access and refresh token and marks rotation.
 * @param rawRefreshToken - The raw refresh token string provided by the client.
 * @param meta - Optional request metadata.
 * @returns New access/refresh tokens and user details.
 */
export async function refreshTokens(rawRefreshToken: RefreshBody["refreshToken"], meta?: RequestMeta) {
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
    replaceTokenId: refresh.id,
  });

  await prisma.refreshToken.update({
    where: { id: refresh.id },
    data: { revokedAt: new Date(), replacedById: newRefresh.id },
  });

  const accessToken = buildAccessToken(user.id, user.email);

  return { accessToken, refreshToken: rawToken, user };
}

/**
 * Revokes a single refresh token, effectively logging out the session.
 * @param rawRefreshToken - The refresh token to revoke.
 */
export async function revokeRefreshToken(rawRefreshToken: RefreshBody["refreshToken"]) {
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

/**
 * Revokes all active refresh tokens for a user.
 * Typically used for account-wide logout or on password reset.
 * @param userId - The user whose tokens should be revoked.
 */
export async function revokeAllRefreshTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/**
 * Provides a demo login flow, for development or demo purposes.
 * Attempts upsert of a demo user by email, overriding name if specified.
 * @param meta - Optional request meta.
 * @param overrides - Optionally override default email and name.
 * @returns Demo user entity and tokens.
 */
export async function loginDemoAccount(meta?: RequestMeta, overrides?: DemoBody) {
  const email = overrides?.email ?? DEMO_EMAIL;
  const name = overrides?.name ?? "Alex Morgan";

  const user = await prisma.user.upsert({
    where: { email },
    update: { name: overrides?.name ?? undefined },
    create: { email, name },
  });

  const tokens = await issueTokens(user.id, user.email, meta);
  return { user, ...tokens };
}
