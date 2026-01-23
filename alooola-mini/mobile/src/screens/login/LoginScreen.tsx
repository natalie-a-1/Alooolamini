/**
 * Login/register screen that delegates logic to the login feature hook and composes feature-specific components.
 */
import React, { useMemo } from 'react';
import { Screen } from '@/components/Screen';
import { AuthModeSwitch } from './components/AuthModeSwitch';
import { BiometricButton } from './components/BiometricButton';
import { ChangeEmailLink } from './components/ChangeEmailLink';
import { DemoLoginButton } from './components/DemoLoginButton';
import { Divider } from './components/Divider';
import { EmailField } from './components/EmailField';
import { FeatureHighlights } from './components/FeatureHighlights';
import { Header } from './components/Header';
import { PasswordField } from './components/PasswordField';
import { PrimaryActionButton } from './components/PrimaryActionButton';
import { SignupFields } from './components/SignupFields';
import { TermsText } from './components/TermsText';
import { VerificationCodeField } from './components/VerificationCodeField';
import { styles } from './LoginScreen.styles';
import { useLoginFlow } from './hooks/useLoginFlow';

export function LoginScreen() {
  const {
    biometricAvailable,
    biometricLabel,
    email,
    hasStoredRefreshToken,
    handleBiometricLogin,
    handleDemoLogin,
    handleSubmit,
    isLoading,
    isLogin,
    name,
    password,
    referralCode,
    setEmail,
    setIsLogin,
    setName,
    setPassword,
    setReferralCode,
    setShowVerification,
    setVerificationCode,
    showVerification,
    verificationCode,
  } = useLoginFlow();

  const primaryLabel = useMemo(() => {
    if (showVerification) return 'Verify Code';
    return isLogin ? 'Log In' : 'Create Account';
  }, [isLogin, showVerification]);

  const isBiometricVisible = biometricAvailable && hasStoredRefreshToken;

  return (
    <Screen contentContainerStyle={styles.content}>
      <Header />
      <DemoLoginButton isLoading={isLoading} onPress={handleDemoLogin} />
      <BiometricButton
        isLoading={isLoading}
        label={biometricLabel}
        onPress={handleBiometricLogin}
        visible={isBiometricVisible}
      />
      <Divider />
      <AuthModeSwitch
        isLogin={isLogin}
        onSelectLogin={() => {
          setIsLogin(true);
          setShowVerification(false);
        }}
        onSelectSignup={() => {
          setIsLogin(false);
          setShowVerification(false);
        }}
      />

      {!isLogin && !showVerification ? (
        <SignupFields
          name={name}
          onChangeName={setName}
          referralCode={referralCode}
          onChangeReferral={(value) => setReferralCode(value.toUpperCase())}
        />
      ) : null}

      {!showVerification ? (
        <>
          <EmailField email={email} onChange={setEmail} />
          <PasswordField isLogin={isLogin} password={password} onChange={setPassword} />
        </>
      ) : (
        <VerificationCodeField verificationCode={verificationCode} onChange={setVerificationCode} />
      )}

      <PrimaryActionButton isLoading={isLoading} label={primaryLabel} onPress={handleSubmit} />

      {showVerification ? <ChangeEmailLink onPress={() => setShowVerification(false)} /> : null}

      {!isLogin && !showVerification ? <FeatureHighlights /> : null}

      <TermsText />
    </Screen>
  );
}
