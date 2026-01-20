/**
 * Profile screen with user info and settings.
 */
import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Icon } from './Icon';
import { Screen } from './Screen';
import { useAuth } from '../hooks/useAuth';
import { COLORS } from '../theme/colors';
import { RADIUS, SPACING } from '../theme/layout';

/** React Native component for Profile. */
export function Profile() {
  const { user, logout } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [jointAccountEnabled, setJointAccountEnabled] = useState(false);

  // Demo data - in production would come from API
  const referralCode = 'ALOOLA2024';
  const referralCount = 3;
  const referralReward = 200;

  const handleCopyReferralCode = async () => {
    try {
      await Clipboard.setStringAsync(referralCode);
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
              <Text style={styles.referralTitle}>Earn ${referralReward} per referral</Text>
              <Text style={styles.referralSubtitle}>
                Invite friends and colleagues and you'll both receive ${referralReward} when they
                fund their account.
              </Text>
            </View>
          </View>

          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Your Referral Code</Text>
            <View style={styles.codeRow}>
              <Text style={styles.codeValue}>{referralCode}</Text>
              <Pressable onPress={handleCopyReferralCode} style={styles.copyButton}>
                <Icon name={copiedCode ? 'check' : 'copy'} size={14} color={COLORS.surface} />
                <Text style={styles.copyButtonText}>{copiedCode ? 'Copied!' : 'Copy'}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Successful Referrals</Text>
              <Text style={styles.statValue}>{referralCount}</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Total Earned</Text>
              <Text style={styles.statValuePositive}>
                ${(referralCount * referralReward).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share Referral Code</Text>
        </Pressable>
      </View>

      <View style={styles.menuList}>
        {['Account Details', 'Security', 'Notifications', 'Help & Support'].map((label) => (
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

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: 30,
    fontWeight: '300',
    color: COLORS.ink,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.pill,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.ink,
  },
  profileRole: {
    fontSize: 12,
    color: COLORS.subtleInk,
  },
  profileMeta: {
    fontSize: 10,
    color: COLORS.subtleInk,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.ink,
    marginBottom: SPACING.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
  },
  toggleSubtitle: {
    fontSize: 10,
    color: COLORS.subtleInk,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: COLORS.ink,
  },
  toggleOff: {
    backgroundColor: COLORS.border,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
  },
  toggleKnobOn: {
    marginLeft: 24,
  },
  toggleKnobOff: {
    marginLeft: 4,
  },
  jointBlock: {
    marginTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: SPACING.lg,
    gap: SPACING.md,
  },
  jointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  jointAvatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
  },
  jointText: {
    flex: 1,
  },
  jointName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.ink,
  },
  jointRole: {
    fontSize: 10,
    color: COLORS.subtleInk,
  },
  removeText: {
    fontSize: 10,
    color: COLORS.danger,
  },
  addMemberButton: {
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  addMemberText: {
    fontSize: 11,
    color: COLORS.mutedInk,
    fontWeight: '600',
  },
  referralCard: {
    backgroundColor: '#ecfdf5',
  },
  referralHeader: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  referralIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralHeaderText: {
    flex: 1,
  },
  referralTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: SPACING.xs,
  },
  referralSubtitle: {
    fontSize: 11,
    color: COLORS.mutedInk,
  },
  codeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  codeLabel: {
    fontSize: 10,
    color: COLORS.subtleInk,
    marginBottom: SPACING.xs,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  codeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.ink,
    letterSpacing: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.ink,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
  },
  copyButtonText: {
    fontSize: 11,
    color: COLORS.surface,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBlock: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.subtleInk,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.ink,
    marginTop: SPACING.xs,
  },
  statValuePositive: {
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.accentGreen,
    marginTop: SPACING.xs,
  },
  shareButton: {
    backgroundColor: COLORS.ink,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  shareButtonText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  menuList: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  menuItem: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
  },
  logoutButton: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger,
    marginTop: SPACING.md,
  },
  logoutButtonText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
  },
});
