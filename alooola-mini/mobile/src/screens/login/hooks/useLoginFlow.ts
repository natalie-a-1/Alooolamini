/**
 * Custom hook that manages the login and registration flow: handles UI state, input, validations, and API logic.
 * 
 * Provides input setters, loading state, and submit handlers for login, signup, and email verification. 
 *
 * ## State
 * - isLogin: boolean, true for login mode, false for registration mode
 * - email: string, the user's email input
 * - name: string, the user's name input (signup only)
 * - referralCode: string, optional code for signup
 * - password: string, the password input
 * - verificationCode: string, code required to verify email
 * - showVerification: boolean, toggles email code verification UI
 * - isLoading: boolean, true while an async API operation is in progress
 * - biometricLabel: string, dynamic label for biometric auth button
 * - biometricAvailable: boolean, is biometric authentication available/enabled
 * - hasStoredRefreshToken: boolean, is a refresh token present in secure storage
 * 
 * ## Returns
 * All state, setters, and useful handler functions:
 *  {
 *    biometricAvailable,
 *    biometricLabel,
 *    email,
 *    hasStoredRefreshToken,
 *    handleBiometricLogin,
 *    handleDemoLogin,
 *    handleSubmit,
 *    isLoading,
 *    isLogin,
 *    name,
 *    password,
 *    referralCode,
 *    setEmail,
 *    setIsLogin,
 *    setName,
 *    setPassword,
 *    setReferralCode,
 *    setShowVerification,
 *    setVerificationCode,
 *    showVerification,
 *    verificationCode,
 *  }
 */
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail } from '@/lib/format';
import { ApiClientError } from '@/services/api';
import { demoLogin, loginWithPassword, registerWithPassword, verifyEmailToken } from '@/services/auth';
import { REFRESH_TOKEN_KEY } from '@/lib/constants';

/**
 * useLoginFlow - React hook for login/registration/verification UI & logic
 */
export function useLoginFlow() {
  const { login, loginWithBiometrics, setShowOnboarding } = useAuth();

  // --- UI & input state ---
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [referralCode, setReferralCode] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [showVerification, setShowVerification] = useState<boolean>(false);

  // --- Auth state ---
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [biometricLabel, setBiometricLabel] = useState<string>('Use Biometrics');
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false);
  const [hasStoredRefreshToken, setHasStoredRefreshToken] = useState<boolean>(false);

  // --- Effects for biometric availability and label ---
  useEffect(() => {
    let isMounted = true;

    /**
     * Checks if device supports biometrics. Updates UI state accordingly.
     */
    async function checkBiometrics() {
      try {
        const [hasHardware, isEnrolled, types, storedRefresh] = await Promise.all([
          LocalAuthentication.hasHardwareAsync(),
          LocalAuthentication.isEnrolledAsync(),
          LocalAuthentication.supportedAuthenticationTypesAsync(),
          SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
        ]);

        if (!isMounted) return;

        setBiometricAvailable(hasHardware && isEnrolled);
        setHasStoredRefreshToken(Boolean(storedRefresh));

        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricLabel('Use Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricLabel('Use Touch ID');
        } else {
          setBiometricLabel('Use Biometrics');
        }
      } catch (error) {
        console.error('Failed to check biometrics:', error);
      }
    }

    checkBiometrics();
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Handler to login with demo user (for demo/testing only).
   * If successful, logs user in and updates app state.
   */
  const handleDemoLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await demoLogin();
      await login(result.user, result.accessToken, result.refreshToken);
    } catch (error) {
      Alert.alert('Error', 'Failed to login to demo account. Is the API running and seeded?');
      console.error('Demo login error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  /**
   * Handler to login with biometrics (Touch/Face ID).
   * If successful, logs user in.
   */
  const handleBiometricLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const success = await loginWithBiometrics();
      if (!success) {
        Alert.alert('Biometric Login Failed', 'Unable to log in with biometrics.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to login with biometrics.');
      console.error('Biometric login error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loginWithBiometrics]);

  /**
   * Handler to perform email+password login. Provides validation+error UI.
   */
  const handleLogin = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginWithPassword(trimmedEmail, password);
      await login(result.user, result.accessToken, result.refreshToken);

      if (result.needsOnboarding) {
        setShowOnboarding(true);
      }
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'ACCOUNT_NOT_FOUND') {
        Alert.alert('Create an account', 'No account found for this email. Please sign up.');
        setShowVerification(false);
        setIsLogin(false);
      } else if (error instanceof ApiClientError && error.code === 'INVALID_PASSWORD') {
        Alert.alert('Invalid Login', 'The password is incorrect.');
      } else if (error instanceof ApiClientError && error.code === 'INVALID_CREDENTIALS') {
        Alert.alert('Invalid Login', 'The email or password is incorrect.');
      } else if (error instanceof ApiClientError && error.code === 'EMAIL_NOT_VERIFIED') {
        Alert.alert('Verify your email', 'Please verify your email before logging in.');
      } else {
        Alert.alert('Error', 'Failed to log in. Please try again.');
        console.error('Login error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, login, password, setShowOnboarding]);

  /**
   * Handles email/password registration. Provides validation and relevant alerts.
   */
  const handleSignup = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please create a password');
      return;
    }

    setIsLoading(true);
    try {
      await registerWithPassword(trimmedEmail, password, name.trim(), referralCode.trim() || undefined);
      setShowVerification(true);
      Alert.alert('Check your email', 'We sent you a verification code');
    } catch (error) {
      if (error instanceof ApiClientError && error.code === 'ACCOUNT_EXISTS') {
        Alert.alert('Account Exists', 'An account already exists. Please log in.');
        setIsLogin(true);
      } else {
        Alert.alert('Error', 'Failed to create account. Please try again.');
        console.error('Signup error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, name, password, referralCode]);

  /**
   * Handles email code verification during signup. Completes registration and logs user in.
   */
  const handleVerifyCode = useCallback(async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyEmailToken(email, verificationCode);
      await login(result.user, result.accessToken, result.refreshToken);

      if (result.needsOnboarding) {
        setShowOnboarding(true);
      }
    } catch (error) {
      if (error instanceof ApiClientError) {
        Alert.alert('Invalid Code', 'The verification code is incorrect or has expired. Please try again.');
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
        console.error('Verify error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, login, setShowOnboarding, verificationCode]);

  /**
   * Smart submit handler: calls appropriate function for current step (login, signup, or verify).
   */
  const handleSubmit = useCallback(() => {
    if (showVerification) {
      handleVerifyCode();
    } else if (isLogin) {
      handleLogin();
    } else {
      handleSignup();
    }
  }, [handleLogin, handleSignup, handleVerifyCode, isLogin, showVerification]);

  // Documentation for returned values is at the top of this file.
  return {
    biometricAvailable,
    biometricLabel,
    email,
    hasStoredRefreshToken,
    handleBiometricLogin,
    handleDemoLogin,
    handleSubmit,
    isLoading,
    isLogin,
    name,
    password,
    referralCode,
    setEmail,
    setIsLogin,
    setName,
    setPassword,
    setReferralCode,
    setShowVerification,
    setVerificationCode,
    showVerification,
    verificationCode,
  };
}
