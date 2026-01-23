/**
 * Route handlers for the users module.
 */
import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { prisma } from "../../db/prisma";
import { DEFAULT_AVATAR_URL } from "../../lib/assets";

/** Router for users routes. */
export const usersRouter = Router();

usersRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        referredByUserId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/me/profile", requireAuth, async (req, res, next) => {
  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: req.user!.id },
    });
    
    // Return profile with default avatar if none set
    res.json({ 
      data: {
        userId: req.user!.id,
        avatarUrl: profile?.avatarUrl ?? DEFAULT_AVATAR_URL,
        profession: profile?.profession ?? null,
        memberTier: profile?.memberTier ?? "standard",
        memberSince: profile?.memberSince ?? null,
      }
    });
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/me/full", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        profile: true,
        investmentProfile: true,
        referrals: {
          take: 1,
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
      return;
    }

    // Get referral stats
    const referral = user.referrals[0];
    let referralStats = null;
    if (referral) {
      const counts = await prisma.referralEvent.groupBy({
        by: ["eventType"],
        where: { referralId: referral.id },
        _count: { eventType: true },
      });
      
      const signupCount = counts.find(c => c.eventType === "signup")?._count.eventType ?? 0;
      const completeCount = counts.find(c => c.eventType === "complete")?._count.eventType ?? 0;
      
      referralStats = {
        code: referral.code,
        signupCount,
        completeCount,
        totalEarned: completeCount * 200, // $200 per referral
      };
    }

    res.json({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.profile?.avatarUrl ?? DEFAULT_AVATAR_URL,
        profession: user.profile?.profession ?? null,
        memberTier: user.profile?.memberTier ?? "standard",
        memberSince: user.profile?.memberSince ?? user.createdAt,
        onboardingCompleted: !!user.investmentProfile?.completedAt,
        referral: referralStats,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});
