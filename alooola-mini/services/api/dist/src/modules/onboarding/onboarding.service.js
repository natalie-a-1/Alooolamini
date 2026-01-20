/**
 * Project source file.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnboardingOptions = getOnboardingOptions;
exports.getOnboardingForUser = getOnboardingForUser;
exports.upsertOnboarding = upsertOnboarding;
const prisma_1 = require("../../db/prisma");
async function getOnboardingOptions() {
    const goals = await prisma_1.prisma.goalOption.findMany({ orderBy: { createdAt: "asc" } });
    return {
        goals,
        riskTolerance: ["conservative", "moderate", "aggressive"],
    };
}
async function getOnboardingForUser(userId) {
    const selections = await prisma_1.prisma.userGoalSelection.findMany({
        where: { userId },
        include: { goal: true },
    });
    const profile = await prisma_1.prisma.userInvestmentProfile.findUnique({ where: { userId } });
    return { selections, profile };
}
async function upsertOnboarding(userId, data) {
    if (data.goalKeys) {
        const goals = await prisma_1.prisma.goalOption.findMany({
            where: { key: { in: data.goalKeys } },
        });
        await prisma_1.prisma.userGoalSelection.deleteMany({ where: { userId } });
        if (goals.length > 0) {
            await prisma_1.prisma.userGoalSelection.createMany({
                data: goals.map((goal) => ({ userId, goalId: goal.id })),
            });
        }
    }
    if (data.riskTolerance || data.goalOtherText !== undefined || data.starterAmount !== undefined || data.starterAmountCustom !== undefined) {
        await prisma_1.prisma.userInvestmentProfile.upsert({
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
