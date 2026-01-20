import { prisma } from "../../db/prisma";

export async function getOnboardingOptions() {
  const goals = await prisma.goalOption.findMany({ orderBy: { createdAt: "asc" } });
  return {
    goals,
    riskTolerance: ["conservative", "moderate", "aggressive"],
  };
}

export async function getOnboardingForUser(userId: string) {
  const selections = await prisma.userGoalSelection.findMany({
    where: { userId },
    include: { goal: true },
  });
  const profile = await prisma.userInvestmentProfile.findUnique({ where: { userId } });
  return { selections, profile };
}

export async function upsertOnboarding(userId: string, data: {
  goalKeys?: string[];
  goalOtherText?: string | null;
  riskTolerance?: "conservative" | "moderate" | "aggressive";
  starterAmount?: number | null;
  starterAmountCustom?: number | null;
}) {
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
