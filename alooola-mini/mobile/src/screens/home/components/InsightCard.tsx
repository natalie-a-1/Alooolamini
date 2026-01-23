/**
 * Displays the personalized insight block.
 */
import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../HomeScreen.styles';

type InsightCardProps = {
  message: string;
};

export function InsightCard({ message }: InsightCardProps) {
  return (
    <View style={[styles.card, styles.insightCard]}>
      <View style={styles.insightRow}>
        <View style={styles.aiBadge}>
          <Text style={styles.aiText}>AI</Text>
        </View>
        <View style={styles.insightContent}>
          <Text style={styles.cardTitle}>Personalized Insight</Text>
          <Text style={styles.insightText}>{message}</Text>
        </View>
      </View>
    </View>
  );
}
