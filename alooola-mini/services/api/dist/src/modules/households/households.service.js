/**
 * Project source file.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHousehold = createHousehold;
exports.listHouseholds = listHouseholds;
exports.getHouseholdDetail = getHouseholdDetail;
exports.listMembers = listMembers;
exports.updateMember = updateMember;
exports.createInvite = createInvite;
exports.getInvite = getInvite;
exports.acceptInvite = acceptInvite;
const prisma_1 = require("../../db/prisma");
const crypto_1 = require("../../lib/crypto");
const errors_1 = require("../../lib/errors");
const env_1 = require("../../config/env");
const email_provider_1 = require("../email/email.provider");
const auth_service_1 = require("../auth/auth.service");
async function createHousehold(userId, name) {
    const household = await prisma_1.prisma.household.create({
        data: {
            name,
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
async function listHouseholds(userId) {
    const memberships = await prisma_1.prisma.householdMember.findMany({
        where: { userId, status: "accepted" },
        include: { household: true },
    });
    return memberships.map((member) => ({
        ...member.household,
        role: member.role,
        status: member.status,
    }));
}
async function getHouseholdDetail(userId, householdId) {
    const membership = await prisma_1.prisma.householdMember.findFirst({
        where: { userId, householdId, status: "accepted" },
        include: { household: true },
    });
    if (!membership) {
        throw (0, errors_1.notFound)("Household not found");
    }
    return membership.household;
}
async function listMembers(householdId) {
    return prisma_1.prisma.householdMember.findMany({
        where: { householdId },
        include: { user: true },
        orderBy: { createdAt: "asc" },
    });
}
async function updateMember(householdId, memberId, data) {
    return prisma_1.prisma.householdMember.update({
        where: { id: memberId },
        data: {
            role: data.role,
            status: data.status,
            joinedAt: data.status === "accepted" ? new Date() : undefined,
        },
    });
}
async function createInvite(householdId, email) {
    const existing = await prisma_1.prisma.invite.findFirst({
        where: { householdId, email, status: "pending" },
    });
    if (existing) {
        throw (0, errors_1.conflict)("Invite already exists");
    }
    const token = (0, crypto_1.generateToken)(24);
    const invite = await prisma_1.prisma.invite.create({
        data: {
            householdId,
            email,
            token,
            status: "pending",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        include: { household: true },
    });
    const inviteLink = `${env_1.env.APP_BASE_URL}/invites/${invite.token}`;
    const deepLink = `${env_1.env.MOBILE_DEEPLINK_BASE}invites/${invite.token}`;
    await (0, email_provider_1.sendEmail)({
        to: email,
        subject: `You're invited to ${invite.household.name}`,
        text: `Accept invite: ${inviteLink} (mobile: ${deepLink})`,
        html: `
      <p>You've been invited to join <strong>${invite.household.name}</strong>.</p>
      <p><a href="${inviteLink}">Accept invite</a></p>
      <p>Mobile: ${deepLink}</p>
    `,
    });
    return invite;
}
async function getInvite(token) {
    const invite = await prisma_1.prisma.invite.findUnique({
        where: { token },
        include: { household: true },
    });
    if (!invite) {
        throw (0, errors_1.notFound)("Invite not found");
    }
    if (invite.status !== "pending" || invite.expiresAt <= new Date()) {
        throw (0, errors_1.badRequest)("Invite expired or not available");
    }
    return invite;
}
async function acceptInvite(token, options) {
    const invite = await prisma_1.prisma.invite.findUnique({
        where: { token },
        include: { household: true },
    });
    if (!invite) {
        throw (0, errors_1.notFound)("Invite not found");
    }
    if (invite.status !== "pending") {
        throw (0, errors_1.badRequest)("Invite already used");
    }
    if (invite.expiresAt <= new Date()) {
        await prisma_1.prisma.invite.update({
            where: { id: invite.id },
            data: { status: "expired" },
        });
        throw (0, errors_1.badRequest)("Invite expired");
    }
    let userId = options.userId;
    if (!userId) {
        const email = options.email ?? invite.email;
        const user = await prisma_1.prisma.user.upsert({
            where: { email },
            update: {},
            create: { email },
        });
        userId = user.id;
    }
    const membership = await prisma_1.prisma.householdMember.upsert({
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
    await prisma_1.prisma.invite.update({
        where: { id: invite.id },
        data: { status: "accepted", acceptedAt: new Date() },
    });
    let tokens = null;
    if (!options.userId) {
        const issued = await (0, auth_service_1.issueTokens)(userId, invite.email);
        tokens = { accessToken: issued.accessToken, refreshToken: issued.refreshToken };
    }
    return { invite, membership, tokens };
}
