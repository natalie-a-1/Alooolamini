/**
 * Opportunity detail screen.
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { COLORS } from '@/theme/colors';
import { styles } from './OpportunityDetailScreen.styles';
import {
  CHART_DATA,
  getPerformanceData,
  MOCK_BENEFITS,
  MOCK_KEY_METRICS,
  MOCK_RISK_FACTORS,
  type Opportunity,
} from './OpportunityDetailScreen.mock';

interface OpportunityDetailScreenProps {
  opportunity: Opportunity;
  onBack: () => void;
}

export function OpportunityDetailScreen({ opportunity, onBack }: OpportunityDetailScreenProps) {
  const [amount, setAmount] = useState('');
  const performanceData = getPerformanceData(opportunity);

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Icon name="chevronRight" size={18} color={COLORS.ink} style={styles.backIcon} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {opportunity.name}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {opportunity.ticker}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="trendingUp" size={16} color={COLORS.accentEmerald} />
            <Text style={styles.cardTitle}>Performance</Text>
          </View>
          <View style={styles.performanceRow}>
            {performanceData.map((perf) => (
              <View key={perf.period} style={styles.performanceCell}>
                <Text style={styles.performanceLabel}>{perf.period}</Text>
                <Text style={styles.performanceValue}>{perf.value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.barChart}>
            {CHART_DATA.map((height, index) => (
              <View key={`${height}-${index}`} style={[styles.bar, { height: `${height}%` }]} />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="info" size={16} color={COLORS.mutedInk} />
            <Text style={styles.cardTitle}>Key Metrics</Text>
          </View>
          <View style={styles.metricsGrid}>
            {MOCK_KEY_METRICS.map((metric) => (
              <View key={metric.label} style={styles.metricCell}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricValue}>{metric.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="alert" size={16} color={COLORS.mutedInk} />
            <Text style={styles.cardTitle}>Risk Factors</Text>
          </View>
          <View style={styles.riskList}>
            {MOCK_RISK_FACTORS.map((factor) => (
              <View key={factor} style={styles.riskRow}>
                <View style={styles.riskDot} />
                <Text style={styles.riskText}>{factor}</Text>
              </View>
            ))}
          </View>
          <View style={styles.riskLevel}>
            <Text style={styles.riskLabel}>Risk Level</Text>
            <Text style={styles.riskValue}>{opportunity.risk}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.bodyText}>
            This investment focuses on healthcare sector opportunities, providing exposure to medical properties, innovation,
            and industry leaders. Designed for investors who understand sector dynamics and long-term growth potential.
          </Text>
        </View>

        <View style={[styles.card, styles.benefitCard]}>
          <Text style={styles.cardTitle}>Key Benefits</Text>
          <View style={styles.benefitList}>
            {MOCK_BENEFITS.map((benefit) => (
              <View key={benefit} style={styles.benefitRow}>
                <Icon name="arrowUpRight" size={12} color={COLORS.mutedInk} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Investment Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amountPrefix}>$</Text>
            <TextInput
              placeholder="0"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={styles.amountInput}
            />
          </View>
        </View>
        <View style={styles.footerButtons}>
          <Pressable style={[styles.footerButton, styles.footerSecondary]}>
            <Text style={styles.footerSecondaryText}>Add to Watchlist</Text>
          </Pressable>
          <Pressable
            style={[styles.footerButton, amount ? styles.footerPrimary : styles.footerDisabled]}
            disabled={!amount}
          >
            <Text style={amount ? styles.footerPrimaryText : styles.footerDisabledText}>Invest Now</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
