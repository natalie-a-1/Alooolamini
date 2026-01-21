/**
 * Toggle between login and signup modes.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from '../LoginScreen.styles';

type AuthModeSwitchProps = {
  isLogin: boolean;
  onSelectLogin: () => void;
  onSelectSignup: () => void;
};

export function AuthModeSwitch({ isLogin, onSelectLogin, onSelectSignup }: AuthModeSwitchProps) {
  return (
    <View style={styles.tabSwitch}>
      <Pressable
        onPress={onSelectLogin}
        style={[styles.tabButton, isLogin ? styles.tabActive : styles.tabInactive]}
      >
        <Text style={isLogin ? styles.tabTextActive : styles.tabTextInactive}>Log In</Text>
      </Pressable>
      <Pressable
        onPress={onSelectSignup}
        style={[styles.tabButton, !isLogin ? styles.tabActive : styles.tabInactive]}
      >
        <Text style={!isLogin ? styles.tabTextActive : styles.tabTextInactive}>Sign Up</Text>
      </Pressable>
    </View>
  );
}
