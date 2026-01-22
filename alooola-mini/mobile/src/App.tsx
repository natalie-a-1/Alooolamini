/**
 * Root application component with navigation, auth, and query providers.
 */
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { COLORS } from '@/theme/colors';
import { queryClient } from '@/lib/queryClient';

const theme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.ink,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.ink,
    border: COLORS.border,
    notification: COLORS.accentPurple,
  },
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer theme={theme}>
            <StatusBar style="dark" backgroundColor={COLORS.background} />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
