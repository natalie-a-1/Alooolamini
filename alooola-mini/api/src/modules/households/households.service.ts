/**
 * Household Service
 * 
 * Provides business logic for households, including:
 * - Creating and listing households
 * - Managing membership (add/update/remove/leave)
 * - Invites (create/accept/decline)
 * - Fetching detailed information
 */

import { prisma } from "../../db/prisma";
import { generateToken } from "../../lib/crypto";
import { badRequest, conflict, notFound } from "../../lib/errors";
import { env } from "../../config/env";
import { sendEmail } from "../email/email.provider";
import { issueTokens } from "../auth/auth.service";

/**
 * Creates a new household with the creator as the owner.
 * 
 * @param userId - ID of the user creating the household
 * @param name - Name of the household
 * @returns The created household with its members
 */
export async function createHousehold(userId: string, name: string) {
  return prisma.household.create({
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
}

/**
 * Lists all households that the user is an accepted member of.
 * 
 * @param userId - ID of the user
 * @returns Array of household objects with membership role/status
 */
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

/**
 * Retrieves detailed information about a specific household,
 * verifying that the user is an accepted member.
 * 
 * @param userId - ID of the user
 * @param householdId - ID of the household
 * @returns Household detail object
 * @throws NotFound if the user is not an accepted member
 */
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

/**
 * Lists all members of a specified household.
 * 
 * @param householdId - ID of the household
 * @returns Array of member objects with user/profile info
 */
export async function listMembers(householdId: string) {
  return prisma.householdMember.findMany({
    where: { householdId },
    include: {
      user: { include: { profile: true } }
    },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Removes a member from the household (owner-only).
 * Owner cannot remove themselves (must use leaveHousehold).
 * 
 * @param householdId - ID of the household
 * @param memberId - Membership ID to remove
 * @param requestingUserId - User ID making the request
 * @returns Success response
 * @throws BadRequest/NotFound based on validation
 */
export async function removeMember(
  householdId: string,
  memberId: string,
  requestingUserId: string
) {
  // Verify owner role
  const ownerMembership = await prisma.householdMember.findFirst({
    where: { householdId, userId: requestingUserId, role: "owner" },
  });
  if (!ownerMembership) throw badRequest("Only the owner can remove members");

  // Find the member to remove
  const memberToRemove = await prisma.householdMember.findUnique({
    where: { id: memberId },
  });
  if (!memberToRemove || memberToRemove.householdId !== householdId) {
    throw notFound("Member not found");
  }

  // Prevent owner from removing themselves
  if (memberToRemove.userId === requestingUserId) {
    throw badRequest("Cannot remove yourself. Use leave household instead.");
  }

  await prisma.householdMember.delete({
    where: { id: memberId },
  });

  return { success: true };
}

/**
 * Updates a household member's role or status.
 * Optionally sets joinedAt when status changes to "accepted".
 * 
 * @param householdId - Household ID
 * @param memberId - Membership ID to update
 * @param data - Update data (role/status)
 * @returns The updated membership object
 */
export async function updateMember(
  householdId: string,
  memberId: string,
  data: { role?: string; status?: string }
) {
  return prisma.householdMember.update({
    where: { id: memberId },
    data: {
      role: data.role as "owner" | "member" | "viewer" | undefined,
      status: data.status as "pending" | "accepted" | undefined,
      joinedAt: data.status === "accepted" ? new Date() : undefined,
    },
  });
}

/**
 * Creates an invite to join a household and sends an email/in-app notification.
 * 
 * @param householdId - ID of the target household
 * @param email - Email address to invite
 * @param inviterUserId - ID of the inviting user
 * @returns The invite object and flag indicating if invitee is an existing user
 * @throws Conflict if there is an existing pending invite
 * @throws NotFound if the household does not exist
 */
export async function createInvite(
  householdId: string,
  email: string,
  inviterUserId: string
) {
  // Prevent duplicate pending invite
  const existing = await prisma.invite.findFirst({
    where: { householdId, email, status: "pending" },
  });
  if (existing) throw conflict("Invite already exists");

  // Fetch household and inviter details in parallel
  const [household, inviter] = await Promise.all([
    prisma.household.findUnique({ where: { id: householdId } }),
    prisma.user.findUnique({ where: { id: inviterUserId }, include: { profile: true } }),
  ]);
  if (!household) throw notFound("Household not found");

  // Create invite token and record
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

  // Check for existing user and send notification if so
  const existingUser = await prisma.user.findUnique({ where: { email } });
  const inviterName = inviter?.name || inviter?.email || "Someone";

  if (existingUser) {
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

  // Always send invite email (with deep & web links)
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

/**
 * Allows a user to leave a household.
 * If the user is the owner and others remain, transfers ownership.
 * 
 * @param userId - ID of the user leaving the household
 * @param householdId - ID of the household
 * @returns Success response with the household ID
 * @throws NotFound if membership does not exist
 */
export async function leaveHousehold(userId: string, householdId: string) {
  // Find the user's membership and household (with members)
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
  if (!membership) throw notFound("Membership not found");

  // If owner, transfer if needed
  if (membership.role === "owner") {
    const otherMembers = membership.household.members.filter(
      (m) => m.userId !== userId && m.status === "accepted"
    );
    if (otherMembers.length > 0) {
      await prisma.householdMember.update({
        where: { id: otherMembers[0].id },
        data: { role: "owner" },
      });
    }
  }

  // Remove member record
  await prisma.householdMember.delete({
    where: { id: membership.id },
  });

  // Household deletion is skipped if no members remain (can be revisited)
  // Count remaining members to determine if household is now empty (unused result for now)
  await prisma.householdMember.count({ where: { householdId } });

  return { success: true, householdId };
}

/**
 * Retrieves invite details given an invite token, ensuring it is pending and not expired.
 * 
 * @param token - Invite token string
 * @returns The invite object with household info
 * @throws NotFound if not found, BadRequest if expired/used
 */
export async function getInvite(token: string) {
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { household: true },
  });

  if (!invite) throw notFound("Invite not found");
  if (invite.status !== "pending" || invite.expiresAt <= new Date()) {
    throw badRequest("Invite expired or not available");
  }

  return invite;
}

/**
 * Accepts an invite given the invite token, optionally creating a user if not already present.
 * Issues auth tokens for new users.
 * 
 * @param token - Invite token
 * @param options - Options (userId and/or email)
 * @returns The invite, membership, and tokens (if new user)
 * @throws NotFound/BadRequest based on invite and user status
 */
export async function acceptInvite(
  token: string,
  options: { userId?: string; email?: string }
) {
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { household: true },
  });

  if (!invite) throw notFound("Invite not found");
  if (invite.status !== "pending") throw badRequest("Invite already used");
  if (invite.expiresAt <= new Date()) {
    await prisma.invite.update({ where: { id: invite.id }, data: { status: "expired" } });
    throw badRequest("Invite expired");
  }

  // Create user if necessary
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

  // Add or update membership to accepted
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

  // Issue auth tokens for signup via invite
  let tokens: { accessToken: string; refreshToken: string } | null = null;
  if (!options.userId) {
    const issued = await issueTokens(userId, invite.email);
    tokens = { accessToken: issued.accessToken, refreshToken: issued.refreshToken };
  }

  // Mark related notification as read (if user present)
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

/**
 * Declines a pending invite for a known user, updates status and notifications.
 * 
 * @param token - Invite token
 * @param userId - User declining the invite
 * @returns Success object and updated invite
 * @throws NotFound if invite does not exist, BadRequest for invalid state
 */
export async function declineInvite(token: string, userId: string) {
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { household: true },
  });

  if (!invite) throw notFound("Invite not found");
  if (invite.status !== "pending") throw badRequest("Invite is no longer pending");

  // Confirm that invite matches user
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.email !== invite.email) {
    throw badRequest("This invite is not for you");
  }

  // Use 'revoked' status to indicate decline
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
