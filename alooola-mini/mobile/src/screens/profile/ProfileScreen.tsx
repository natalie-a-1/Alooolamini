/**
 * Profile screen with user info and settings.
 */
import React, { useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { COLORS } from '@/theme/colors';
import { styles } from './ProfileScreen.styles';
import { MENU_ITEMS, REFERRAL_CODE, REFERRAL_COUNT, REFERRAL_REWARD } from './ProfileScreen.mock';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [jointAccountEnabled, setJointAccountEnabled] = useState(false);

  const handleCopyReferralCode = async () => {
    try {
      await Clipboard.setStringAsync(REFERRAL_CODE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback for when clipboard isn't available
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const userName = user?.name || 'Demo User';
  const userEmail = user?.email || 'demo@alooola.local';

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Pressable style={styles.settingsButton}>
          <Icon name="settings" size={18} color={COLORS.ink} />
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.profileRow}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop',
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileRole}>Professional Member</Text>
            <Text style={styles.profileMeta}>{userEmail}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={styles.toggleIcon}>
                <Icon name="users" size={16} color={COLORS.accentPurple} />
              </View>
              <View style={styles.toggleText}>
                <Text style={styles.toggleTitle}>Joint Account</Text>
                <Text style={styles.toggleSubtitle}>Share with partner or family</Text>
              </View>
            </View>
            <Pressable
              onPress={() => setJointAccountEnabled(!jointAccountEnabled)}
              style={[styles.toggleSwitch, jointAccountEnabled ? styles.toggleOn : styles.toggleOff]}
            >
              <View
                style={[styles.toggleKnob, jointAccountEnabled ? styles.toggleKnobOn : styles.toggleKnobOff]}
              />
            </Pressable>
          </View>

          {jointAccountEnabled && (
            <View style={styles.jointBlock}>
              <View style={styles.jointRow}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
                  }}
                  style={styles.jointAvatar}
                />
                <View style={styles.jointText}>
                  <Text style={styles.jointName}>Dr. Jamie Morgan</Text>
                  <Text style={styles.jointRole}>Co-owner</Text>
                </View>
                <Pressable>
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>
              <Pressable style={styles.addMemberButton}>
                <Text style={styles.addMemberText}>+ Add Another Member</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Referrals</Text>
        <View style={[styles.card, styles.referralCard]}>
          <View style={styles.referralHeader}>
            <View style={styles.referralIcon}>
              <Icon name="gift" size={16} color={COLORS.surface} />
            </View>
            <View style={styles.referralHeaderText}>
              <Text style={styles.referralTitle}>Earn ${REFERRAL_REWARD} per referral</Text>
              <Text style={styles.referralSubtitle}>
                Invite friends and colleagues and you'll both receive ${REFERRAL_REWARD} when they
                fund their account.
              </Text>
            </View>
          </View>

          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Your Referral Code</Text>
            <View style={styles.codeRow}>
              <Text style={styles.codeValue}>{REFERRAL_CODE}</Text>
              <Pressable onPress={handleCopyReferralCode} style={styles.copyButton}>
                <Icon name={copiedCode ? 'check' : 'copy'} size={14} color={COLORS.surface} />
                <Text style={styles.copyButtonText}>{copiedCode ? 'Copied!' : 'Copy'}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Successful Referrals</Text>
              <Text style={styles.statValue}>{REFERRAL_COUNT}</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Total Earned</Text>
              <Text style={styles.statValuePositive}>
                ${(REFERRAL_COUNT * REFERRAL_REWARD).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share Referral Code</Text>
        </Pressable>
      </View>

      <View style={styles.menuList}>
        {MENU_ITEMS.map((label) => (
          <Pressable key={label} style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Icon name="settings" size={16} color={COLORS.mutedInk} />
              <Text style={styles.menuLabel}>{label}</Text>
            </View>
            <Icon name="chevronRight" size={16} color={COLORS.subtleInk} />
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </Pressable>
    </Screen>
  );
}
