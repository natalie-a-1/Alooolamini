import { prisma } from "../../db/prisma";
import { Prisma } from "@prisma/client";
import { generateToken } from "../../lib/crypto";
import { notFound } from "../../lib/errors";

async function generateUniqueCode() {
  for (let i = 0; i < 5; i += 1) {
    const code = generateToken(4);
    const exists = await prisma.referral.findUnique({ where: { code } });
    if (!exists) {
      return code;
    }
  }
  return generateToken(6);
}

export async function getOrCreateReferral(userId: string) {
  const existing = await prisma.referral.findFirst({ where: { ownerUserId: userId } });
  if (existing) return existing;

  const code = await generateUniqueCode();
  return prisma.referral.create({ data: { ownerUserId: userId, code } });
}

export async function getReferralStats(userId: string) {
  const referral = await prisma.referral.findFirst({ where: { ownerUserId: userId } });
  if (!referral) {
    return { referral: null, counts: { click: 0, signup: 0, complete: 0 } };
  }

  const grouped = await prisma.referralEvent.groupBy({
    by: ["eventType"],
    where: { referralId: referral.id },
    _count: { eventType: true },
  });

  const counts = { click: 0, signup: 0, complete: 0 };
  grouped.forEach((row) => {
    counts[row.eventType] = row._count.eventType;
  });

  return { referral, counts };
}

export async function createReferralEvent(code: string, eventType: "click" | "signup" | "complete", meta?: Record<string, unknown>) {
  const referral = await prisma.referral.findUnique({ where: { code } });
  if (!referral) {
    throw notFound("Referral not found");
  }

  return prisma.referralEvent.create({
    data: {
      referralId: referral.id,
      eventType,
      meta: meta as Prisma.InputJsonValue | undefined,
    },
  });
}
