/**
 * Root navigator that handles auth state and navigation.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { OnboardingScreen } from '@/screens/onboarding';
import { useAuth } from '@/hooks/useAuth';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, isLoading, showOnboarding } = useAuth();

  // Could show a splash/loading screen here while checking auth state
  if (isLoading) {
    return null;
  }

  // Show onboarding for new users who just signed up
  if (isAuthenticated && showOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}
