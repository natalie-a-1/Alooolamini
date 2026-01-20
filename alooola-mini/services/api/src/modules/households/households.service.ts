/**
 * Business logic for the households module.
 */
import { prisma } from "../../db/prisma";
import { generateToken } from "../../lib/crypto";
import { badRequest, conflict, notFound } from "../../lib/errors";
import { env } from "../../config/env";
import { sendEmail } from "../email/email.provider";
import { issueTokens } from "../auth/auth.service";

/** Create household. */
export async function createHousehold(userId: string, name: string) {
  const household = await prisma.household.create({
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

/** List households. */
export async function listHouseholds(userId: string) {
  const memberships = await prisma.householdMember.findMany({
    where: { userId, status: "accepted" },
    include: { household: true },
  });

  return memberships.map((member) => ({
    ...member.household,
    role: member.role,
    status: member.status,
  }));
}

/** Get household detail. */
export async function getHouseholdDetail(userId: string, householdId: string) {
  const membership = await prisma.householdMember.findFirst({
    where: { userId, householdId, status: "accepted" },
    include: { household: true },
  });

  if (!membership) {
    throw notFound("Household not found");
  }

  return membership.household;
}

/** List members. */
export async function listMembers(householdId: string) {
  return prisma.householdMember.findMany({
    where: { householdId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
}

/** Update member. */
export async function updateMember(householdId: string, memberId: string, data: { role?: string; status?: string }) {
  return prisma.householdMember.update({
    where: { id: memberId },
    data: {
      role: data.role as "owner" | "member" | "viewer" | undefined,
      status: data.status as "pending" | "accepted" | undefined,
      joinedAt: data.status === "accepted" ? new Date() : undefined,
    },
  });
}

/** Create invite. */
export async function createInvite(householdId: string, email: string) {
  const existing = await prisma.invite.findFirst({
    where: { householdId, email, status: "pending" },
  });

  if (existing) {
    throw conflict("Invite already exists");
  }

  const token = generateToken(24);
  const invite = await prisma.invite.create({
    data: {
      householdId,
      email,
      token,
      status: "pending",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    include: { household: true },
  });

  const inviteLink = `${env.APP_BASE_URL}/invites/${invite.token}`;
  const deepLink = `${env.MOBILE_DEEPLINK_BASE}invites/${invite.token}`;

  await sendEmail({
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

/** Get invite. */
export async function getInvite(token: string) {
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { household: true },
  });

  if (!invite) {
    throw notFound("Invite not found");
  }

  if (invite.status !== "pending" || invite.expiresAt <= new Date()) {
    throw badRequest("Invite expired or not available");
  }

  return invite;
}

/** Helper for accept invite. */
export async function acceptInvite(token: string, options: { userId?: string; email?: string }) {
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { household: true },
  });

  if (!invite) {
    throw notFound("Invite not found");
  }

  if (invite.status !== "pending") {
    throw badRequest("Invite already used");
  }

  if (invite.expiresAt <= new Date()) {
    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: "expired" },
    });
    throw badRequest("Invite expired");
  }

  let userId = options.userId;
  if (!userId) {
    const email = options.email ?? invite.email;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    });
    userId = user.id;
  }

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

  await prisma.invite.update({
    where: { id: invite.id },
    data: { status: "accepted", acceptedAt: new Date() },
  });

  let tokens: { accessToken: string; refreshToken: string } | null = null;
  if (!options.userId) {
    const issued = await issueTokens(userId, invite.email);
    tokens = { accessToken: issued.accessToken, refreshToken: issued.refreshToken };
  }

  return { invite, membership, tokens };
}
