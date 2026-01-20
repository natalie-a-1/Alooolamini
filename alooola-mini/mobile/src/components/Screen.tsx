/**
 * Screen wrapper that applies safe-area-aware spacing for mobile devices.
 */
import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { SCREEN_PADDING, SPACING } from '../theme/layout';

export interface ScreenProps {
  children: React.ReactNode;
  /** Use a ScrollView screen wrapper (default: true). */
  scroll?: boolean;
  /** Outer container style. */
  style?: StyleProp<ViewStyle>;
  /** Inner content container style (applies to ScrollView contentContainerStyle). */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Background color for the screen. */
  backgroundColor?: string;
}

export function Screen({
  children,
  scroll = true,
  style,
  contentContainerStyle,
  backgroundColor = COLORS.background,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const baseContentStyle: ViewStyle = {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: SCREEN_PADDING + insets.top,
    paddingBottom: SPACING.xxxl + insets.bottom,
  };

  if (!scroll) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor }, style]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[baseContentStyle, style]}>
          {children}
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[baseContentStyle, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
});

