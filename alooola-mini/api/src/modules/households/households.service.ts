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
    include: { 
      user: {
        include: { profile: true }
      }
    },
    orderBy: { createdAt: "asc" },
  });
}

/** Remove a member from household (owner only). */
export async function removeMember(householdId: string, memberId: string, requestingUserId: string) {
  // Verify the requesting user is the owner
  const requestingMembership = await prisma.householdMember.findFirst({
    where: { householdId, userId: requestingUserId, role: "owner" },
  });

  if (!requestingMembership) {
    throw badRequest("Only the owner can remove members");
  }

  // Find the member to remove
  const memberToRemove = await prisma.householdMember.findUnique({
    where: { id: memberId },
  });

  if (!memberToRemove || memberToRemove.householdId !== householdId) {
    throw notFound("Member not found");
  }

  // Cannot remove yourself (owner) - use leave instead
  if (memberToRemove.userId === requestingUserId) {
    throw badRequest("Cannot remove yourself. Use leave household instead.");
  }

  // Delete the membership
  await prisma.householdMember.delete({
    where: { id: memberId },
  });

  return { success: true };
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
export async function createInvite(householdId: string, email: string, inviterUserId: string) {
  const existing = await prisma.invite.findFirst({
    where: { householdId, email, status: "pending" },
  });

  if (existing) {
    throw conflict("Invite already exists");
  }

  // Get household and inviter info
  const [household, inviter] = await Promise.all([
    prisma.household.findUnique({ where: { id: householdId } }),
    prisma.user.findUnique({ where: { id: inviterUserId }, include: { profile: true } }),
  ]);

  if (!household) {
    throw notFound("Household not found");
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

  // Check if the invited email belongs to an existing user
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  const inviterName = inviter?.name || inviter?.email || "Someone";

  if (existingUser) {
    // Create an in-app notification for the existing user
    await prisma.notification.create({
      data: {
        userId: existingUser.id,
        type: "household_invite",
        title: "Household Invite",
        body: `${inviterName} invited you to join "${household.name}"`,
        data: {
          inviteId: invite.id,
          inviteToken: invite.token,
          householdId: household.id,
          householdName: household.name,
          inviterName,
          inviterEmail: inviter?.email,
        },
      },
    });
  }

  // Always send email as a backup (for users who may not check the app)
  const inviteLink = `${env.APP_BASE_URL}/invites/${invite.token}`;
  const deepLink = `${env.MOBILE_DEEPLINK_BASE}invites/${invite.token}`;

  await sendEmail({
    to: email,
    subject: `You're invited to ${invite.household.name}`,
    text: `${inviterName} invited you to join "${household.name}". Accept invite: ${inviteLink} (mobile: ${deepLink})`,
    html: `
      <p><strong>${inviterName}</strong> invited you to join <strong>${household.name}</strong>.</p>
      <p><a href="${inviteLink}">Accept invite</a></p>
      <p>Mobile: ${deepLink}</p>
    `,
  });

  return { ...invite, existingUser: !!existingUser };
}

/** Leave household - removes user from household. */
export async function leaveHousehold(userId: string, householdId: string) {
  // Find the membership
  const membership = await prisma.householdMember.findUnique({
    where: {
      householdId_userId: {
        householdId,
        userId,
      },
    },
    include: {
      household: {
        include: {
          members: true,
        },
      },
    },
  });

  if (!membership) {
    throw notFound("Membership not found");
  }

  // If user is the owner and there are other members, transfer ownership first
  if (membership.role === "owner") {
    const otherMembers = membership.household.members.filter(
      (m) => m.userId !== userId && m.status === "accepted"
    );
    
    if (otherMembers.length > 0) {
      // Transfer ownership to another member
      await prisma.householdMember.update({
        where: { id: otherMembers[0].id },
        data: { role: "owner" },
      });
    }
  }

  // Delete the membership
  await prisma.householdMember.delete({
    where: { id: membership.id },
  });

  // Check if household has any remaining members
  const remainingMembers = await prisma.householdMember.count({
    where: { householdId },
  });

  // If no members left, optionally delete the household
  // For now, we'll keep the household (it may have transaction history, etc.)
  
  return { success: true, householdId };
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

  // Mark any related notification as read
  if (options.userId) {
    await prisma.notification.updateMany({
      where: {
        userId: options.userId,
        type: "household_invite",
        data: {
          path: ["inviteToken"],
          equals: token,
        },
      },
      data: { readAt: new Date() },
    });
  }

  return { invite, membership, tokens };
}

/** Decline an invite. */
export async function declineInvite(token: string, userId: string) {
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { household: true },
  });

  if (!invite) {
    throw notFound("Invite not found");
  }

  if (invite.status !== "pending") {
    throw badRequest("Invite is no longer pending");
  }

  // Verify the invite is for this user
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.email !== invite.email) {
    throw badRequest("This invite is not for you");
  }

  // Update invite status to declined (using 'revoked' status since there's no 'declined')
  await prisma.invite.update({
    where: { id: invite.id },
    data: { status: "revoked" },
  });

  // Mark any related notification as read
  await prisma.notification.updateMany({
    where: {
      userId,
      type: "household_invite",
      data: {
        path: ["inviteToken"],
        equals: token,
      },
    },
    data: { readAt: new Date() },
  });

  return { success: true, invite };
}
