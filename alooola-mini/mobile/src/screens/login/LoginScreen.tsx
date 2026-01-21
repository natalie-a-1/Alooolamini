/**
 * Login/register screen with API integration.
 */
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { demoLogin, loginWithPassword, registerWithPassword, verifyEmailToken } from '@/services/auth';
import { ApiClientError } from '@/services/api';
import { COLORS } from '@/theme/colors';
import { styles } from './LoginScreen.styles';
import { isValidEmail } from '@/lib/format';

const REFRESH_TOKEN_KEY = 'refresh_token';

export function LoginScreen() {
  const { login, loginWithBiometrics, setShowOnboarding } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Use Biometrics');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [hasStoredRefreshToken, setHasStoredRefreshToken] = useState(false);

  useEffect(() => {
    let isMounted = true;

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
        setHasStoredRefreshToken(!!storedRefresh);

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

  const handleDemoLogin = async () => {
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
  };

  const handleBiometricLogin = async () => {
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
  };

  const handleLogin = async () => {
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
  };

  const handleSignup = async () => {
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
      await registerWithPassword(
        trimmedEmail,
        password,
        name.trim(),
        referralCode.trim() || undefined
      );
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

      // Show onboarding if user hasn't completed profile setup
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
  };

  const handleSubmit = () => {
    if (showVerification) {
      handleVerifyCode();
    } else if (isLogin) {
      handleLogin();
    } else {
      handleSignup();
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {/* Use require to load local images in React Native */}
        <Image
          source={require('../../../assets/alooola.png')}
          style={styles.logo}
          resizeMode="contain"
        />
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

      {biometricAvailable && hasStoredRefreshToken && (
        <Pressable
          style={[styles.demoButton, isLoading && styles.buttonDisabled]}
          onPress={handleBiometricLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.ink} />
          ) : (
            <>
              <Icon name="shield" size={16} color={COLORS.ink} />
              <Text style={styles.demoButtonText}>{biometricLabel}</Text>
            </>
          )}
        </Pressable>
      )}

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
        <>
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
          <View style={styles.inputCard}>
            <View style={styles.inputRow}>
              <Icon name="gift" size={16} color={COLORS.subtleInk} />
              <TextInput
                placeholder="Referral Code (optional)"
                value={referralCode}
                onChangeText={(text) => setReferralCode(text.toUpperCase())}
                autoCapitalize="characters"
                style={styles.input}
                placeholderTextColor={COLORS.subtleInk}
              />
            </View>
          </View>
        </>
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
      ) : null}

      {!showVerification ? (
        <View style={styles.inputCard}>
          <View style={styles.inputRow}>
            <Icon name="lock" size={16} color={COLORS.subtleInk} />
            <TextInput
              placeholder={isLogin ? 'Password' : 'Create Password'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
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
            {showVerification ? 'Verify Code' : isLogin ? 'Log In' : 'Create Account'}
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
