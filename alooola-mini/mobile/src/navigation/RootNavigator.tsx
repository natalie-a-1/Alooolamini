/**
 * Root navigator that handles auth state and navigation.
 * Shows a loading screen after authentication while all critical data loads.
 *
 * This ensures a seamless UX where screens are fully ready when displayed.
 */
import React, { useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { OnboardingScreen } from '@/screens/onboarding';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, isLoading: isAuthLoading, showOnboarding } = useAuth();
  const { isLoading: isHouseholdLoading, household, refetch: refetchHousehold } = useHousehold();

  // Prefetch all critical app data in parallel once household is available
  const {
    isInitializing,
    isReady,
    error: initError,
    progress,
  } = useAppInitialization({
    householdId: household?.id,
    enabled: isAuthenticated && !showOnboarding && !!household,
  });

  // Retry callback for initialization errors
  const handleRetry = useCallback(() => {
    refetchHousehold();
  }, [refetchHousehold]);

  // Show loading screen while checking initial auth state
  if (isAuthLoading) {
    return <LoadingScreen message="Starting up..." />;
  }

  // If not authenticated, show auth stack (no loading needed)
  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthStack} />
      </Stack.Navigator>
    );
  }

  // Show onboarding for new users who just signed up
  if (showOnboarding) {
    return <OnboardingScreen />;
  }

  // Show loading screen while household loads
  if (isHouseholdLoading || !household) {
    return <LoadingScreen message="Loading your profile..." />;
  }

  // Show loading screen while prefetching critical data
  // This ensures all screens are ready before showing the app
  if (isInitializing || !isReady) {
    return (
      <LoadingScreen
        message="Preparing your dashboard..."
        progress={progress}
        error={initError}
        onRetry={initError ? handleRetry : undefined}
      />
    );
  }

  // App is ready - all critical data is loaded
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}
