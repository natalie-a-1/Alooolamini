/**
 * Login/register screen with API integration.
 */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon } from './Icon';
import { Screen } from './Screen';
import { useAuth } from '../hooks/useAuth';
import { demoLogin, startEmailVerification, verifyEmailToken } from '../services/auth';
import { COLORS } from '../theme/colors';
import { RADIUS, SPACING } from '../theme/layout';
import type { AuthStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'LoginRegister'>;

/** React Native component for Login Register. */
export function LoginRegister() {
  const navigation = useNavigation<NavigationProp>();
  const { login, setShowOnboarding } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const result = await demoLogin('Demo User');
      await login(result.user, result.accessToken, result.refreshToken);
    } catch (error) {
      Alert.alert('Error', 'Failed to create demo account. Is the API running?');
      console.error('Demo login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await startEmailVerification(email);
      setShowVerification(true);
      Alert.alert('Check your email', 'We sent you a verification code');
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification email');
      console.error('Email start error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyEmailToken(email, verificationCode);
      await login(result.user, result.accessToken, result.refreshToken);

      // If signing up, go to onboarding
      if (!isLogin) {
        setShowOnboarding(true);
        navigation.navigate('Onboarding', { isNewUser: true });
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid verification code');
      console.error('Verify error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (showVerification) {
      handleVerifyCode();
    } else {
      handleEmailSubmit();
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {/* Use require to load local images in React Native */}
        <Image
          source={require('../../assets/alooola.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {/* <Text style={styles.title}>Alooola Mini</Text> */}
        {/* <Text style={styles.subtitle}>AI-Powered Wealth Building for Professionals</Text> */}
      </View>

      {/* Demo Login Button - for interviews */}
      <Pressable
        style={[styles.demoButton, isLoading && styles.buttonDisabled]}
        onPress={handleDemoLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.ink} />
        ) : (
          <>
            <Icon name="gift" size={16} color={COLORS.ink} />
            <Text style={styles.demoButtonText}>Try Demo (No Sign Up)</Text>
          </>
        )}
      </Pressable>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.tabSwitch}>
        <Pressable
          onPress={() => {
            setIsLogin(true);
            setShowVerification(false);
          }}
          style={[styles.tabButton, isLogin ? styles.tabActive : styles.tabInactive]}
        >
          <Text style={isLogin ? styles.tabTextActive : styles.tabTextInactive}>Log In</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setIsLogin(false);
            setShowVerification(false);
          }}
          style={[styles.tabButton, !isLogin ? styles.tabActive : styles.tabInactive]}
        >
          <Text style={!isLogin ? styles.tabTextActive : styles.tabTextInactive}>Sign Up</Text>
        </Pressable>
      </View>

      {!isLogin && !showVerification && (
        <View style={styles.inputCard}>
          <View style={styles.inputRow}>
            <Icon name="user" size={16} color={COLORS.subtleInk} />
            <TextInput
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholderTextColor={COLORS.subtleInk}
            />
          </View>
        </View>
      )}

      {!showVerification ? (
        <View style={styles.inputCard}>
          <View style={styles.inputRow}>
            <Icon name="mail" size={16} color={COLORS.subtleInk} />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              placeholderTextColor={COLORS.subtleInk}
            />
          </View>
        </View>
      ) : (
        <View style={styles.inputCard}>
          <View style={styles.inputRow}>
            <Icon name="lock" size={16} color={COLORS.subtleInk} />
            <TextInput
              placeholder="Verification Code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              style={styles.input}
              placeholderTextColor={COLORS.subtleInk}
            />
          </View>
        </View>
      )}

      <Pressable
        style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.surface} />
        ) : (
          <Text style={styles.primaryButtonText}>
            {showVerification ? 'Verify Code' : isLogin ? 'Send Code' : 'Get Started'}
          </Text>
        )}
      </Pressable>

      {showVerification && (
        <Pressable style={styles.linkButton} onPress={() => setShowVerification(false)}>
          <Text style={styles.linkText}>Use different email</Text>
        </Pressable>
      )}

      {!isLogin && !showVerification && (
        <View style={styles.features}>
          <View style={styles.featureRow}>
            <View style={[styles.featureDot, { backgroundColor: COLORS.accentPurple }]} />
            <Text style={styles.featureText}>AI-powered investment insights</Text>
          </View>
          <View style={styles.featureRow}>
            <View style={[styles.featureDot, { backgroundColor: COLORS.accentBlue }]} />
            <Text style={styles.featureText}>Personalized wealth strategies</Text>
          </View>
          <View style={styles.featureRow}>
            <View style={[styles.featureDot, { backgroundColor: COLORS.accentGreen }]} />
            <Text style={styles.featureText}>Earn rewards on every transaction</Text>
          </View>
        </View>
      )}

      <Text style={styles.terms}>By continuing, you agree to our Terms of Service and Privacy Policy</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: 200,
    height: 60,
    borderRadius: RADIUS.sm,
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.ink,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.mutedInk,
    textAlign: 'center',
    marginBottom: 64,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: '#dcfce7',
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    marginTop: 56,
    marginBottom: SPACING.lg,
    width: '100%',
  },
  demoButtonText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    fontSize: 11,
    color: COLORS.subtleInk,
  },
  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    padding: 4,
    marginBottom: SPACING.xl,
    width: '100%',
  },
  tabButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.ink,
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabTextActive: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextInactive: {
    color: COLORS.mutedInk,
    fontSize: 12,
    fontWeight: '600',
  },
  inputCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: COLORS.ink,
  },
  primaryButton: {
    backgroundColor: COLORS.ink,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    width: '100%',
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  linkText: {
    fontSize: 12,
    color: COLORS.mutedInk,
  },
  features: {
    marginTop: SPACING.xl,
    gap: SPACING.sm,
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: RADIUS.pill,
  },
  featureText: {
    fontSize: 12,
    color: COLORS.mutedInk,
  },
  terms: {
    fontSize: 10,
    color: COLORS.subtleInk,
    textAlign: 'center',
    marginTop: SPACING.xl,
    width: '100%',
  },
});
