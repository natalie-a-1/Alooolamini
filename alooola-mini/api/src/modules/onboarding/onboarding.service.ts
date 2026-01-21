/**
 * Business logic for the onboarding module.
 */
import { prisma } from "../../db/prisma";
import { badRequest, notFound } from "../../lib/errors";

const DEFAULT_AVATAR_URL = "/assets/profile-pictures/Calm.svg";

/** Get onboarding options. */
export async function getOnboardingOptions() {
  const goals = await prisma.goalOption.findMany({ orderBy: { createdAt: "asc" } });
  return {
    goals,
    riskTolerance: ["conservative", "moderate", "aggressive"],
  };
}

/** Get onboarding for user. */
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
  
  // Check if user has a household
  const householdMembership = await prisma.householdMember.findFirst({
    where: { userId, status: "accepted" },
    include: { household: true },
  });
  
  return { 
    name: user?.name ?? null,
    avatarUrl: userProfile?.avatarUrl ?? null,
    selections, 
    investmentProfile,
    household: householdMembership?.household ?? null,
  };
}

/** Join a household with invite code. */
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

  // Create or update household membership
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

/** Create a personal household for user. */
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

/** Upsert onboarding. */
export async function upsertOnboarding(userId: string, data: {
  name?: string;
  avatarUrl?: string | null;
  goalKeys?: string[];
  goalOtherText?: string | null;
  riskTolerance?: "conservative" | "moderate" | "aggressive";
  starterAmount?: number | null;
  starterAmountCustom?: number | null;
}) {
  // Update user name
  if (data.name !== undefined) {
    await prisma.user.update({
      where: { id: userId },
      data: { name: data.name },
    });
  }

  // Update avatar URL - use default if explicitly set to null/empty
  if (data.avatarUrl !== undefined) {
    const avatarUrl = data.avatarUrl || DEFAULT_AVATAR_URL;
    await prisma.userProfile.upsert({
      where: { userId },
      update: { avatarUrl },
      create: { userId, avatarUrl },
    });
  }

  if (data.goalKeys) {
    const goals = await prisma.goalOption.findMany({
      where: { key: { in: data.goalKeys } },
    });

    await prisma.userGoalSelection.deleteMany({ where: { userId } });
    if (goals.length > 0) {
      await prisma.userGoalSelection.createMany({
        data: goals.map((goal) => ({ userId, goalId: goal.id })),
      });
    }
  }

  if (data.riskTolerance || data.goalOtherText !== undefined || data.starterAmount !== undefined || data.starterAmountCustom !== undefined) {
    await prisma.userInvestmentProfile.upsert({
      where: { userId },
      update: {
        riskTolerance: data.riskTolerance ?? undefined,
        goalOtherText: data.goalOtherText ?? undefined,
        starterAmount: data.starterAmount ?? undefined,
        starterAmountCustom: data.starterAmountCustom ?? undefined,
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

/** Complete onboarding - creates household if needed and tracks referral completion. */
export async function completeOnboarding(userId: string) {
  // Get user with referral info
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

  // Check if user has a household, create personal one if not
  const existingMembership = await prisma.householdMember.findFirst({
    where: { userId, status: "accepted" },
  });

  let household = null;
  if (!existingMembership) {
    household = await createPersonalHousehold(userId);
  } else {
    const membership = await prisma.householdMember.findFirst({
      where: { userId, status: "accepted" },
      include: { household: true },
    });
    household = membership?.household ?? null;
  }

  // Track referral completion if user was referred
  if (user.referredByUserId) {
    const referral = await prisma.referral.findFirst({
      where: { ownerUserId: user.referredByUserId },
    });

    if (referral) {
      // Check if we've already tracked completion for this user
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
