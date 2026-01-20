"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateReferral = getOrCreateReferral;
exports.getReferralStats = getReferralStats;
exports.createReferralEvent = createReferralEvent;
const prisma_1 = require("../../db/prisma");
const crypto_1 = require("../../lib/crypto");
const errors_1 = require("../../lib/errors");
async function generateUniqueCode() {
    for (let i = 0; i < 5; i += 1) {
        const code = (0, crypto_1.generateToken)(4);
        const exists = await prisma_1.prisma.referral.findUnique({ where: { code } });
        if (!exists) {
            return code;
        }
    }
    return (0, crypto_1.generateToken)(6);
}
async function getOrCreateReferral(userId) {
    const existing = await prisma_1.prisma.referral.findFirst({ where: { ownerUserId: userId } });
    if (existing)
        return existing;
    const code = await generateUniqueCode();
    return prisma_1.prisma.referral.create({ data: { ownerUserId: userId, code } });
}
async function getReferralStats(userId) {
    const referral = await prisma_1.prisma.referral.findFirst({ where: { ownerUserId: userId } });
    if (!referral) {
        return { referral: null, counts: { click: 0, signup: 0, complete: 0 } };
    }
    const grouped = await prisma_1.prisma.referralEvent.groupBy({
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
async function createReferralEvent(code, eventType, meta) {
    const referral = await prisma_1.prisma.referral.findUnique({ where: { code } });
    if (!referral) {
        throw (0, errors_1.notFound)("Referral not found");
    }
    return prisma_1.prisma.referralEvent.create({
        data: {
            referralId: referral.id,
            eventType,
            meta: meta,
        },
    });
}
