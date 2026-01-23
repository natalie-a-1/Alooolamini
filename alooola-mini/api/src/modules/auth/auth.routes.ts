/**
 * Route handlers for the auth module.
 *
 * This file defines REST API endpoints for authentication-related actions, such as:
 * - Registering a new user
 * - Logging in and out
 * - Refreshing tokens
 * - Email verification
 * - Referral code validation
 * - Logging in as a demo account
 *
 * Uses validation middleware, rate limiting, and request metadata extraction on incoming requests.
 */

import { Router } from "express";
import { validate } from "../../middleware/validate";
import { createRateLimiter } from "../../middleware/rateLimit";
import { requireAuth } from "../../middleware/auth";
import { getRequestMeta } from "../../lib/requestMeta";
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
  loginDemoAccount,
  loginWithPassword,
  refreshTokens,
  registerWithPassword,
  revokeAllRefreshTokens,
  revokeRefreshToken,
  validateReferralCode,
  verifyEmailToken,
} from "./auth.service";

/**
 * The main Express router for authentication endpoints.
 */
export const authRouter = Router();

/**
 * Rate limiter that restricts email-related actions (register) to 10 requests/minute per IP.
 */
const emailLimiter = createRateLimiter(60 * 1000, 10);

/**
 * @route POST /register
 * @desc Register a new user with email and password, and send verification email.
 * @access Public
 */
authRouter.post("/register", emailLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, referralCode, name } = req.body;
    const result = await registerWithPassword(email, password, name, referralCode);
    res.json({ data: { sent: true, isNewUser: result.isNewUser } });
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /login
 * @desc Login with email and password, returns issued tokens and user info.
 * @access Public
 */
authRouter.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginWithPassword(email, password, getRequestMeta(req));
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

/**
 * @route POST /referral/validate
 * @desc Validate a referral code; checks if code exists and is valid.
 * @access Public
 */
authRouter.post("/referral/validate", validate(validateReferralSchema), async (req, res, next) => {
  try {
    const { code } = req.body;
    const result = await validateReferralCode(code);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /email/verify
 * @desc Verify signup email by confirming the token sent to user.
 * @access Public
 */
authRouter.post("/email/verify", validate(emailVerifySchema), async (req, res, next) => {
  try {
    const { email, token } = req.body;
    const result = await verifyEmailToken(email, token, getRequestMeta(req));
    res.json({ data: { user: result.user, ...result.tokens, needsOnboarding: result.needsOnboarding } });
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /refresh
 * @desc Refreshes an expired access token using a refresh token.
 * @access Public
 */
authRouter.post("/refresh", validate(refreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await refreshTokens(refreshToken, getRequestMeta(req));
    res.json({ data: { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken } });
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /logout
 * @desc Revoke a refresh token or all of the current user's tokens; ends session.
 * @access Protected (Auth required)
 */
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

/**
 * @route POST /demo
 * @desc Log in using a pre-seeded demo account (for testing/demo with full mock data).
 * @access Public
 */
authRouter.post("/demo", validate(demoSchema), async (req, res, next) => {
  try {
    const result = await loginDemoAccount(getRequestMeta(req), req.body);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});
