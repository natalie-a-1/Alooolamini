/**
 * Login/register screen with API integration.
 */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { demoLogin, startEmailVerification, verifyEmailToken } from '@/services/auth';
import { COLORS } from '@/theme/colors';
import type { AuthStackParamList } from '@/navigation/types';
import { styles } from './LoginScreen.styles';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'LoginRegister'>;

export function LoginScreen() {
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
