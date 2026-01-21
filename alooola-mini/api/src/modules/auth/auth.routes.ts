/**
 * Route handlers for the auth module.
 */
import { Router } from "express";
import { validate } from "../../middleware/validate";
import { createRateLimiter } from "../../middleware/rateLimit";
import { requireAuth } from "../../middleware/auth";
import {
  demoSchema,
  emailVerifySchema,
  loginSchema,
  logoutSchema,
  registerSchema,
  refreshSchema,
  validateReferralSchema,
} from "./auth.schemas";
import {
  issueTokens,
  loginWithPassword,
  refreshTokens,
  registerWithPassword,
  revokeAllRefreshTokens,
  revokeRefreshToken,
  validateReferralCode,
  verifyEmailToken,
} from "./auth.service";
import { prisma } from "../../db/prisma";

/** Router for auth routes. */
export const authRouter = Router();

const emailLimiter = createRateLimiter(60 * 1000, 10);

authRouter.post("/register", emailLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, referralCode, name } = req.body;
    const result = await registerWithPassword(email, password, name, referralCode);
    res.json({ data: { sent: true, isNewUser: result.isNewUser } });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const meta = { userAgent: req.get("user-agent") ?? undefined, ipAddress: req.ip };
    const result = await loginWithPassword(email, password, meta);
    res.json({
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        needsOnboarding: result.needsOnboarding,
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/referral/validate", validate(validateReferralSchema), async (req, res, next) => {
  try {
    const { code } = req.body;
    const result = await validateReferralCode(code);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/email/verify", validate(emailVerifySchema), async (req, res, next) => {
  try {
    const { email, token } = req.body;
    const meta = { userAgent: req.get("user-agent") ?? undefined, ipAddress: req.ip };
    const result = await verifyEmailToken(email, token, meta);
    res.json({ data: { user: result.user, ...result.tokens, needsOnboarding: result.needsOnboarding } });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/refresh", validate(refreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const meta = { userAgent: req.get("user-agent") ?? undefined, ipAddress: req.ip };
    const result = await refreshTokens(refreshToken, meta);
    res.json({ data: { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken } });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", requireAuth, validate(logoutSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    } else if (req.user) {
      await revokeAllRefreshTokens(req.user.id);
    }
    res.json({ data: { revoked: true } });
  } catch (err) {
    next(err);
  }
});

// Demo login - uses the pre-seeded demo account with full mock data
const DEMO_EMAIL = "alex.morgan@alooola.dev";

authRouter.post("/demo", validate(demoSchema), async (req, res, next) => {
  try {
    // Always use the pre-seeded demo account
    const user = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL },
    });

    if (!user) {
      // If demo user doesn't exist, it means seed hasn't been run
      // Create a minimal demo user as fallback
      const fallbackUser = await prisma.user.upsert({
        where: { email: DEMO_EMAIL },
        update: {},
        create: { email: DEMO_EMAIL, name: "Alex Morgan" },
      });
      const tokens = await issueTokens(fallbackUser.id, fallbackUser.email, { 
        userAgent: req.get("user-agent") ?? undefined, 
        ipAddress: req.ip 
      });
      res.json({ data: { user: fallbackUser, ...tokens } });
      return;
    }

    const tokens = await issueTokens(user.id, user.email, { 
      userAgent: req.get("user-agent") ?? undefined, 
      ipAddress: req.ip 
    });
    res.json({ data: { user, ...tokens } });
  } catch (err) {
    next(err);
  }
});
