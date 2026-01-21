/**
 * Authentication API service.
 */
import { apiPost } from './api';
import type { User } from '../context/AuthContext';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  needsOnboarding?: boolean;
}

interface EmailStartResponse {
  sent: boolean;
  isNewUser?: boolean;
}

interface LogoutResponse {
  revoked: boolean;
}

/**
 * Demo login - creates a demo user instantly.
 * Perfect for interview demos.
 */
export async function demoLogin(name?: string, email?: string): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/demo', { name, email });
}

/**
 * Start email verification flow.
 * Sends a verification code to the email address.
 * @param mode - "login" requires existing account, "signup" creates new account
 * @param name - optional name for signup (collected during account creation)
 * @param referralCode - optional referral code for signup
 */
export async function startEmailVerification(
  email: string,
  mode: 'login' | 'signup' = 'login',
  name?: string,
  referralCode?: string
): Promise<EmailStartResponse> {
  return apiPost<EmailStartResponse>('/auth/email/start', { email, mode, name, referralCode });
}

interface ValidateReferralResponse {
  valid: boolean;
  referrerName: string | null;
}

/**
 * Validate a referral code.
 */
export async function validateReferralCode(code: string): Promise<ValidateReferralResponse> {
  return apiPost<ValidateReferralResponse>('/auth/referral/validate', { code });
}

/**
 * Verify email with token.
 * Returns user and tokens if successful.
 */
export async function verifyEmailToken(email: string, token: string): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/email/verify', { email, token });
}

/**
 * Refresh access token using refresh token.
 */
export async function refreshTokens(refreshToken: string): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/refresh', { refreshToken });
}

/**
 * Logout and revoke tokens.
 */
export async function logout(refreshToken?: string): Promise<LogoutResponse> {
  return apiPost<LogoutResponse>('/auth/logout', { refreshToken });
}
