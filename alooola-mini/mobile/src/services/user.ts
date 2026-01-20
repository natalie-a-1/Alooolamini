/**
 * User API service.
 */
import { apiGet } from './api';
import type { User } from '../context/AuthContext';

export interface UserProfile {
  userId: string;
  avatarUrl: string | null;
  profession: string | null;
  memberTier: string | null;
  memberSince: string | null;
}

export interface Referral {
  id: string;
  code: string;
  successfulCount: number;
  totalEarned: number;
}

export interface Household {
  id: string;
  name: string;
  role: 'owner' | 'member' | 'viewer';
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
 * Get current user's referral info.
 */
export async function getMyReferral(): Promise<Referral> {
  return apiGet<Referral>('/referrals/me');
}

/**
 * Get current user's households.
 */
export async function getMyHouseholds(): Promise<Household[]> {
  return apiGet<Household[]>('/households');
}
