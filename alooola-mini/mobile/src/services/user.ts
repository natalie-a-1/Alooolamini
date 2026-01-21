/**
 * User API service.
 */
import { apiDelete, apiGet, apiPost } from './api';
import type { User } from '../context/AuthContext';

export interface UserProfile {
  userId: string;
  avatarUrl: string | null;
  profession: string | null;
  memberTier: string | null;
  memberSince: string | null;
}

export interface ReferralStats {
  code: string;
  signupCount: number;
  completeCount: number;
  totalEarned: number;
}

export interface FullUserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string;
  profession: string | null;
  memberTier: string;
  memberSince: string;
  onboardingCompleted: boolean;
  referral: ReferralStats | null;
  createdAt: string;
}

export interface Household {
  id: string;
  name: string;
  role: 'owner' | 'member' | 'viewer';
}

export interface HouseholdInvite {
  id: string;
  householdId: string;
  email: string;
  token: string;
  status: string;
  expiresAt: string;
  household: {
    id: string;
    name: string;
  };
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  userId: string;
  role: 'owner' | 'member' | 'viewer';
  status: 'pending' | 'accepted';
  joinedAt: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    profile?: {
      avatarUrl: string | null;
    } | null;
  };
}

/**
 * Get current user.
 */
export async function getCurrentUser(): Promise<User> {
  return apiGet<User>('/users/me');
}

/**
 * Get current user's profile.
 */
export async function getUserProfile(): Promise<UserProfile> {
  return apiGet<UserProfile>('/users/me/profile');
}

/**
 * Get current user's full profile with referral info.
 */
export async function getFullUserProfile(): Promise<FullUserProfile> {
  return apiGet<FullUserProfile>('/users/me/full');
}

/**
 * Get current user's referral stats.
 */
export async function getMyReferralStats(): Promise<{ referral: { code: string } | null; counts: { click: number; signup: number; complete: number } }> {
  return apiGet('/referrals/me');
}

/**
 * Get current user's households.
 */
export async function getMyHouseholds(): Promise<Household[]> {
  return apiGet<Household[]>('/households');
}

/**
 * Create a household.
 */
export async function createHousehold(name: string): Promise<Household> {
  return apiPost<Household>('/households', { name });
}

/**
 * Send an invite to join a household.
 */
export async function sendHouseholdInvite(householdId: string, email: string): Promise<HouseholdInvite> {
  return apiPost<HouseholdInvite>(`/households/${householdId}/invites`, { email });
}

/**
 * Leave a household.
 */
export async function leaveHousehold(householdId: string): Promise<{ success: boolean; householdId: string }> {
  return apiDelete<{ success: boolean; householdId: string }>(`/households/${householdId}/leave`);
}

/**
 * Get household members.
 */
export async function getHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
  return apiGet<HouseholdMember[]>(`/households/${householdId}/members`);
}

/**
 * Remove a member from household (owner only).
 */
export async function removeHouseholdMember(householdId: string, memberId: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`/households/${householdId}/members/${memberId}`);
}
