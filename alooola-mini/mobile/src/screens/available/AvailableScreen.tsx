/**
 * Available balance screen.
 */
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { COLORS } from '@/theme/colors';
import { styles } from './AvailableScreen.styles';
import {
  AVAILABLE_BALANCE,
  MOCK_ACTIVITIES,
  REWARD_RATE,
  TOTAL_REWARDS,
} from './AvailableScreen.mock';

export function AvailableScreen() {
  return (
    <Screen>
      <View style={styles.balanceBlock}>
        <Text style={styles.label}>Available</Text>
        <Text style={styles.balance}>
          ${AVAILABLE_BALANCE.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>Total earned rewards</Text>
          <Icon name="gift" size={18} color={COLORS.subtleInk} />
        </View>
        <Text style={styles.cardValue}>
          ${TOTAL_REWARDS.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <Text style={styles.cardMeta}>earning {REWARD_RATE}% in stock</Text>
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
          {MOCK_ACTIVITIES.map((activity) => (
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
