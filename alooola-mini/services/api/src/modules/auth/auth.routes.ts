import { Router } from "express";
import { validate } from "../../middleware/validate";
import { createRateLimiter } from "../../middleware/rateLimit";
import { requireAuth } from "../../middleware/auth";
import {
  demoSchema,
  emailStartSchema,
  emailVerifySchema,
  logoutSchema,
  refreshSchema,
} from "./auth.schemas";
import {
  issueTokens,
  refreshTokens,
  revokeAllRefreshTokens,
  revokeRefreshToken,
  startEmailVerification,
  verifyEmailToken,
} from "./auth.service";
import { prisma } from "../../db/prisma";
import { generateToken } from "../../lib/crypto";

export const authRouter = Router();

const emailLimiter = createRateLimiter(60 * 1000, 10);

authRouter.post("/email/start", emailLimiter, validate(emailStartSchema), async (req, res, next) => {
  try {
    const { email } = req.body;
    await startEmailVerification(email);
    res.json({ data: { sent: true } });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/email/verify", validate(emailVerifySchema), async (req, res, next) => {
  try {
    const { email, token } = req.body;
    const meta = { userAgent: req.get("user-agent") ?? undefined, ipAddress: req.ip };
    const result = await verifyEmailToken(email, token, meta);
    res.json({ data: { user: result.user, ...result.tokens } });
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

authRouter.post("/demo", validate(demoSchema), async (req, res, next) => {
  try {
    const email = req.body.email ?? `demo+${generateToken(6)}@alooola.local`;
    const name = req.body.name ?? "Demo User";
    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: { email, name },
    });
    const tokens = await issueTokens(user.id, user.email, { userAgent: req.get("user-agent") ?? undefined, ipAddress: req.ip });
    res.json({ data: { user, ...tokens } });
  } catch (err) {
    next(err);
  }
});
