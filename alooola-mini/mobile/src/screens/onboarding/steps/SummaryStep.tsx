/**
 * Summary/completion step for onboarding.
 */
import React from 'react';
import { Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles } from '../OnboardingScreen.styles';

interface SummaryStepProps {
  displayName: string;
}

export function SummaryStep({ displayName }: SummaryStepProps) {
  const firstName = displayName ? displayName.split(' ')[0] : '';

  return (
    <View>
      <Text style={styles.heading}>
        You're all set{firstName ? `, ${firstName}` : ''}!
      </Text>
      <Text style={styles.subheading}>Here's what you get with Alooola Mini:</Text>

      <View style={styles.list}>
        <View style={styles.benefitCard}>
          <View style={[styles.benefitIcon, { backgroundColor: '#ede9fe' }]}>
            <Icon name="trendingUp" size={16} color={COLORS.accentPurple} />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>AI-Powered Insights</Text>
            <Text style={styles.benefitText}>
              Personalized investment recommendations tailored to your goals and expertise
            </Text>
          </View>
        </View>

        <View style={styles.benefitCard}>
          <View style={[styles.benefitIcon, { backgroundColor: '#dcfce7' }]}>
            <Icon name="gift" size={16} color={COLORS.accentGreen} />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>2% Rewards on Everything</Text>
            <Text style={styles.benefitText}>
              Earn stock rewards on all your spending and transactions
            </Text>
          </View>
        </View>

        <View style={styles.benefitCard}>
          <View style={[styles.benefitIcon, { backgroundColor: '#dbeafe' }]}>
            <Icon name="users" size={16} color={COLORS.accentBlue} />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Joint Accounts</Text>
            <Text style={styles.benefitText}>
              Share and manage wealth with your partner or family
            </Text>
          </View>
        </View>

        <View style={[styles.benefitCard, styles.benefitHighlight]}>
          <View style={[styles.benefitIcon, { backgroundColor: COLORS.accentGreen }]}>
            <Icon name="gift" size={16} color={COLORS.surface} />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Refer & Earn $200</Text>
            <Text style={styles.benefitText}>
              Invite friends and colleagues and earn $200 for each successful referral
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
