/**
 * Authentication context for managing user auth state.
 */
import React, { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { refreshTokens } from '@/services/auth';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  login: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  loginWithBiometrics: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Load stored auth state on mount
  useEffect(() => {
    async function loadAuthState() {
      try {
        const [storedToken, storedUser, storedRefreshToken] = await Promise.all([
          SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
          SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
        ]);

        const hasBiometrics = await LocalAuthentication.hasHardwareAsync();
        const hasEnrollment = hasBiometrics ? await LocalAuthentication.isEnrolledAsync() : false;

        if (storedRefreshToken && hasBiometrics && hasEnrollment) {
          const unlocked = await loginWithBiometrics();
          if (unlocked) {
            return;
          }
        }

        if (storedToken && storedUser) {
          setAccessToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAuthState();
  }, [loginWithBiometrics]);

  const login = useCallback(async (newUser: User, newAccessToken: string, refreshToken: string) => {
    try {
      await Promise.all([
        SecureStore.setItemAsync(ACCESS_TOKEN_KEY, newAccessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
        SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser)),
      ]);

      setAccessToken(newAccessToken);
      setUser(newUser);
    } catch (error) {
      console.error('Failed to save auth state:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_KEY),
      ]);

      setAccessToken(null);
      setUser(null);
      setShowOnboarding(false);
    } catch (error) {
      console.error('Failed to clear auth state:', error);
    }
  }, []);

  const loginWithBiometrics = useCallback(async () => {
    try {
      const [hasHardware, isEnrolled, storedRefreshToken] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      ]);

      if (!hasHardware || !isEnrolled || !storedRefreshToken) {
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Log in with biometrics',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
      });

      if (!result.success) {
        return false;
      }

      const refreshed = await refreshTokens(storedRefreshToken);
      await login(refreshed.user, refreshed.accessToken, refreshed.refreshToken);

      if (refreshed.needsOnboarding) {
        setShowOnboarding(true);
      }

      return true;
    } catch (error) {
      console.error('Biometric login failed:', error);
      return false;
    }
  }, [login, setShowOnboarding]);

  const getAccessToken = useCallback(async () => {
    // Return cached token if available
    if (accessToken) {
      return accessToken;
    }
    // Otherwise try to load from storage
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  }, [accessToken]);

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    showOnboarding,
    setShowOnboarding,
    login,
    logout,
    getAccessToken,
    loginWithBiometrics,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
