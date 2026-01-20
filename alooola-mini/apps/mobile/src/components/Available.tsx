/**
 * Available balance screen translated to React Native.
 */
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { Screen } from './Screen';
import { COLORS } from '../theme/colors';
import { RADIUS, SPACING } from '../theme/layout';

/** React Native component for Available. */
export function Available() {
  const availableBalance = 32547.0;
  const totalRewards = 1542.0;
  const rewardRate = 2;

  const activities = [
    {
      id: 1,
      name: 'Logan Stein',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      description: 'Here is some cash :)',
      amount: 80.0,
      date: '10/26/2023',
    },
    {
      id: 2,
      name: 'Anisa Pearson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      description: 'For concert shopping',
      amount: -50.0,
      date: '10/25/2023',
    },
    {
      id: 3,
      name: 'Professional Conference',
      avatar: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&h=100&fit=crop',
      description: 'Registration fee',
      amount: -450.0,
      date: '10/24/2023',
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      description: 'Referral bonus',
      amount: 200.0,
      date: '10/23/2023',
    },
  ];

  return (
    <Screen>
      <View style={styles.balanceBlock}>
        <Text style={styles.label}>Available</Text>
        <Text style={styles.balance}>
          ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>Total earned rewards</Text>
          <Icon name="gift" size={18} color={COLORS.subtleInk} />
        </View>
        <Text style={styles.cardValue}>
          ${totalRewards.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <Text style={styles.cardMeta}>earning {rewardRate}% in stock</Text>
      </View>

      <View style={styles.buttonRow}>
        <Pressable style={[styles.primaryButton, styles.button]}>
          <Text style={styles.primaryButtonText}>Add Funds</Text>
        </Pressable>
        <Pressable style={[styles.secondaryButton, styles.button]}>
          <Text style={styles.secondaryButtonText}>Move Funds</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity</Text>
        <View style={styles.list}>
          {activities.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <Image source={{ uri: activity.avatar }} style={styles.avatar} />
              <View style={styles.activityInfo}>
                <Text style={styles.activityName}>{activity.name}</Text>
                <Text style={styles.activityDescription} numberOfLines={1}>
                  {activity.description}
                </Text>
                <Text style={styles.activityDate}>{activity.date}</Text>
              </View>
              <Text style={[styles.activityAmount, activity.amount > 0 ? styles.amountPositive : styles.amountNeutral]}>
                {activity.amount > 0 ? '+' : ''}${Math.abs(activity.amount).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  balanceBlock: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 12,
    color: COLORS.mutedInk,
    marginBottom: SPACING.sm,
  },
  balance: {
    fontSize: 40,
    fontWeight: '300',
    color: COLORS.ink,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardLabel: {
    fontSize: 12,
    color: COLORS.mutedInk,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.ink,
    marginBottom: SPACING.xs,
  },
  cardMeta: {
    fontSize: 11,
    color: COLORS.subtleInk,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.ink,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '600',
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
  list: {
    gap: SPACING.sm,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.pill,
    marginRight: SPACING.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
  },
  activityDescription: {
    fontSize: 11,
    color: COLORS.subtleInk,
  },
  activityDate: {
    fontSize: 10,
    color: COLORS.subtleInk,
    marginTop: SPACING.xs,
  },
  activityAmount: {
    fontSize: 13,
    fontWeight: '600',
  },
  amountPositive: {
    color: COLORS.success,
  },
  amountNeutral: {
    color: COLORS.ink,
  },
});
