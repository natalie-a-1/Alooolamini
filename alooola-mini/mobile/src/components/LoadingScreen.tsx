/**
 * Full-screen loading component shown while the app initializes.
 * Displayed after login/registration while critical data loads.
 */
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '@/theme/colors';

type LoadingScreenProps = {
  message?: string;
  /** Optional progress value between 0 and 1 */
  progress?: number;
  /** Optional error message to display */
  error?: string | null;
  /** Optional retry callback when error occurs */
  onRetry?: () => void;
};

export function LoadingScreen({
  message = 'Loading your account...',
  progress,
  error,
  onRetry,
}: LoadingScreenProps) {
  const showProgress = progress !== undefined && progress > 0 && progress < 1;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>alooola</Text>

        {error ? (
          <>
            <Text style={styles.errorMessage}>{error}</Text>
            {onRetry && (
              <Text style={styles.retryButton} onPress={onRetry}>
                Tap to retry
              </Text>
            )}
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color={COLORS.ink} style={styles.spinner} />

            {showProgress && (
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
                </View>
              </View>
            )}

            <Text style={styles.message}>{message}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    fontSize: 36,
    fontWeight: '300',
    color: COLORS.ink,
    marginBottom: 40,
    letterSpacing: 2,
  },
  spinner: {
    marginBottom: 20,
  },
  progressContainer: {
    width: 200,
    marginBottom: 20,
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.ink,
    borderRadius: 2,
  },
  message: {
    fontSize: 14,
    color: COLORS.mutedInk,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    fontSize: 16,
    color: COLORS.ink,
    fontWeight: '600',
  },
});
