/**
 * @file onboarding.service.ts
 * @description Business logic for user onboarding module. Handles onboarding options,
 * user state fetch and update, household membership, and onboarding completion.
 */

import { prisma } from "../../db/prisma";
import { badRequest, notFound } from "../../lib/errors";
import type { OnboardingMeInput } from "./onboarding.schemas";
import { DEFAULT_AVATAR_URL } from "../../lib/assets";

// -----------------------------------------------------------------------------
// Constants & Mappings
// -----------------------------------------------------------------------------

/**
 * Icon mappings for goals, for front-end display.
 * Supports both legacy and current keys.
 */
const GOAL_ICONS: Record<string, string> = {
  retirement: "target",
  wealth: "trendingUp",
  wealth_building: "trendingUp",
  education: "graduationCap",
  education_fund: "graduationCap",
  property: "home",
  property_investment: "home",
  emergency: "shield",
  emergency_fund: "shield",
  other: "crosshair",
};

/**
 * Risk tolerance options including id, label, and description.
 */
const RISK_TOLERANCES = [
  { id: "conservative", label: "Conservative", description: "Lower risk, steady growth" },
  { id: "moderate", label: "Moderate", description: "Balanced risk and reward" },
  { id: "aggressive", label: "Aggressive", description: "Higher risk, maximum growth" },
] as const;

/**
 * Default starter investment amounts for users to select from.
 */
const STARTER_AMOUNTS = [1000, 5000, 10000, 25000, 50000] as const;

// -----------------------------------------------------------------------------
// Service Functions
// -----------------------------------------------------------------------------

/**
 * Fetch available onboarding options (goals, risk levels, starter amounts).
 * @returns {Promise<{goals, riskTolerances, starterAmounts}>}
 */
export async function getOnboardingOptions() {
  const dbGoals = await prisma.goalOption.findMany({ orderBy: { createdAt: "asc" } });
  return {
    goals: dbGoals.map((goal) => ({
      key: goal.key,
      label: goal.label,
      icon: GOAL_ICONS[goal.key] ?? "crosshair",
    })),
    riskTolerances: RISK_TOLERANCES,
    starterAmounts: STARTER_AMOUNTS,
  };
}

/**
 * Fetch current onboarding data for the given user.
 * @param userId User's unique identifier
 * @returns {Promise<UserOnboardingResponse>}
 */
export async function getOnboardingForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  const userProfile = await prisma.userProfile.findUnique({ where: { userId } });

  const selections = await prisma.userGoalSelection.findMany({
    where: { userId },
    include: { goal: true },
  });

  const investmentProfile = await prisma.userInvestmentProfile.findUnique({ where: { userId } });

  // Check for user's household membership (accepted status)
  const householdMembership = await prisma.householdMember.findFirst({
    where: { userId, status: "accepted" },
    include: { household: true },
  });

  return {
    name: user?.name ?? null,
    avatarUrl: userProfile?.avatarUrl ?? null,
    goalKeys: selections.map((selection) => selection.goal.key),
    goalOtherText: investmentProfile?.goalOtherText ?? null,
    riskTolerance: investmentProfile?.riskTolerance ?? null,
    starterAmount: investmentProfile?.starterAmount ? Number(investmentProfile.starterAmount) : null,
    starterAmountCustom: investmentProfile?.starterAmountCustom ? Number(investmentProfile.starterAmountCustom) : null,
    completedAt: investmentProfile?.completedAt ?? null,
    household: householdMembership?.household ?? null,
  };
}

/**
 * Accepts an invite code and joins the user's account to the household,
 * if invite is valid and not expired or already used.
 * @param userId User's unique identifier
 * @param inviteCode The invite token/code
 * @returns {Promise<{household, membership}>}
 */
export async function joinHouseholdWithInviteCode(userId: string, inviteCode: string) {
  const invite = await prisma.invite.findUnique({
    where: { token: inviteCode },
    include: { household: true },
  });

  if (!invite) {
    throw notFound("Invalid invite code");
  }
  if (invite.status !== "pending") {
    throw badRequest("Invite has already been used");
  }
  if (invite.expiresAt <= new Date()) {
    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: "expired" },
    });
    throw badRequest("Invite has expired");
  }

  // Add or update household membership
  const membership = await prisma.householdMember.upsert({
    where: {
      householdId_userId: {
        householdId: invite.householdId,
        userId,
      },
    },
    update: {
      status: "accepted",
      joinedAt: new Date(),
    },
    create: {
      householdId: invite.householdId,
      userId,
      role: "member",
      status: "accepted",
      joinedAt: new Date(),
      invitedAt: invite.createdAt,
    },
  });

  // Mark invite as accepted
  await prisma.invite.update({
    where: { id: invite.id },
    data: { status: "accepted", acceptedAt: new Date() },
  });

  return { household: invite.household, membership };
}

/**
 * Creates a new personal household for the user with themselves as owner,
 * typically used if user doesn't belong to an existing household.
 * @param userId User's unique identifier
 * @returns {Promise<Household>}
 */
export async function createPersonalHousehold(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  const householdName = user?.name ? `${user.name}'s Household` : "My Household";

  const household = await prisma.household.create({
    data: {
      name: householdName,
      members: {
        create: {
          userId,
          role: "owner",
          status: "accepted",
          joinedAt: new Date(),
        },
      },
    },
    include: { members: true },
  });

  return household;
}

/**
 * Upserts onboarding information for the user, including:
 * - Name, avatar, goals, goal text, risk tolerance, and starter amounts.
 * Updates user profile, investment profile, and goal selections as needed.
 * Returns new onboarding state.
 * @param userId User's unique identifier
 * @param data Onboarding input containing updates
 * @returns {Promise<UserOnboardingResponse>}
 */
export async function upsertOnboarding(userId: string, data: OnboardingMeInput) {
  // --- User Name ---
  if (data.name !== undefined) {
    await prisma.user.update({
      where: { id: userId },
      data: { name: data.name },
    });
  }

  // --- Avatar (set to default if null/empty provided) ---
  if (data.avatarUrl !== undefined) {
    const avatarUrl = data.avatarUrl || DEFAULT_AVATAR_URL;
    await prisma.userProfile.upsert({
      where: { userId },
      update: { avatarUrl },
      create: { userId, avatarUrl },
    });
  }

  // --- Goals ---
  if (data.goalKeys !== undefined) {
    const goals = await prisma.goalOption.findMany({
      where: { key: { in: data.goalKeys } },
    });

    // Remove previous selections, then create new ones
    await prisma.userGoalSelection.deleteMany({ where: { userId } });
    if (goals.length > 0) {
      await prisma.userGoalSelection.createMany({
        data: goals.map((goal) => ({ userId, goalId: goal.id })),
      });
    }
  }

  // --- Investment Profile (risk/other/starter amounts) ---
  const hasInvestmentUpdate =
    data.riskTolerance !== undefined ||
    data.goalOtherText !== undefined ||
    data.starterAmount !== undefined ||
    data.starterAmountCustom !== undefined;

  if (hasInvestmentUpdate) {
    await prisma.userInvestmentProfile.upsert({
      where: { userId },
      update: {
        ...(data.riskTolerance !== undefined && { riskTolerance: data.riskTolerance }),
        ...(data.goalOtherText !== undefined && { goalOtherText: data.goalOtherText }),
        ...(data.starterAmount !== undefined && { starterAmount: data.starterAmount }),
        ...(data.starterAmountCustom !== undefined && { starterAmountCustom: data.starterAmountCustom }),
        completedAt: new Date(),
      },
      create: {
        userId,
        riskTolerance: data.riskTolerance ?? "moderate",
        goalOtherText: data.goalOtherText ?? null,
        starterAmount: data.starterAmount ?? null,
        starterAmountCustom: data.starterAmountCustom ?? null,
        completedAt: new Date(),
      },
    });
  }

  return getOnboardingForUser(userId);
}

/**
 * Marks the onboarding as complete for the user.
 * Ensures a household exists, and tracks referral event completion if user was referred.
 * @param userId User's unique identifier
 * @returns {Promise<{completed: true, household: ...}>}
 */
export async function completeOnboarding(userId: string) {
  // --- Fetch user including referral info ---
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      referredByUserId: true,
    },
  });

  if (!user) {
    throw notFound("User not found");
  }

  // --- Ensure user belongs to household, create if not ---
  let household: any = null;
  const existingMembership = await prisma.householdMember.findFirst({
    where: { userId, status: "accepted" },
  });

  if (!existingMembership) {
    household = await createPersonalHousehold(userId);
  } else {
    const membership = await prisma.householdMember.findFirst({
      where: { userId, status: "accepted" },
      include: { household: true },
    });
    household = membership?.household ?? null;
  }

  // --- Track referral milestone if user has a referrer ---
  if (user.referredByUserId) {
    const referral = await prisma.referral.findFirst({
      where: { ownerUserId: user.referredByUserId },
    });

    if (referral) {
      // Only record referral event if not yet marked "complete" for this user
      const existingComplete = await prisma.referralEvent.findFirst({
        where: {
          referralId: referral.id,
          eventType: "complete",
          meta: {
            path: ["userId"],
            equals: userId,
          },
        },
      });

      if (!existingComplete) {
        await prisma.referralEvent.create({
          data: {
            referralId: referral.id,
            eventType: "complete",
            meta: { userId, completedAt: new Date().toISOString() },
          },
        });
      }
    }
  }

  return {
    completed: true,
    household,
  };
}
