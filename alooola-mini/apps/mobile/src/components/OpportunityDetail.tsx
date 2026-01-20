/**
 * Opportunity detail screen translated to React Native.
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from './Icon';
import { Screen } from './Screen';
import { COLORS } from '../theme/colors';
import { RADIUS, SPACING } from '../theme/layout';

interface Opportunity {
  id: number;
  name: string;
  ticker: string;
  return: string;
  risk: string;
}

interface OpportunityDetailProps {
  opportunity: Opportunity;
  onBack: () => void;
}

/** React Native component for Opportunity Detail. */
export function OpportunityDetail({ opportunity, onBack }: OpportunityDetailProps) {
  const [amount, setAmount] = useState('');

  const performanceData = [
    { period: '1W', value: '+2.1%' },
    { period: '1M', value: '+5.3%' },
    { period: '3M', value: '+8.7%' },
    { period: '1Y', value: opportunity.return },
    { period: 'ALL', value: '+24.5%' },
  ];

  const keyMetrics = [
    { label: 'Market Cap', value: '$12.4B' },
    { label: 'P/E Ratio', value: '18.5' },
    { label: 'Dividend Yield', value: '3.2%' },
    { label: 'Expense Ratio', value: '0.45%' },
  ];

  const riskFactors = [
    'Healthcare sector volatility',
    'Regulatory changes',
    'Market concentration risk',
    'Interest rate sensitivity',
  ];

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
            {[40, 55, 48, 65, 58, 72, 68, 80, 75, 85].map((height, index) => (
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
            {keyMetrics.map((metric) => (
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
            {riskFactors.map((factor) => (
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
            {[
              'Leverage sector knowledge and expertise',
              'Align investments with professional background',
              'Long-term sector growth potential',
            ].map((benefit) => (
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

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    transform: [{ rotate: '180deg' }],
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.ink,
  },
  headerSubtitle: {
    fontSize: 10,
    color: COLORS.subtleInk,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ink,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  performanceCell: {
    alignItems: 'center',
    flex: 1,
  },
  performanceLabel: {
    fontSize: 10,
    color: COLORS.subtleInk,
    marginBottom: SPACING.xs,
  },
  performanceValue: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.accentEmerald,
  },
  barChart: {
    height: 120,
    backgroundColor: '#f8fafc',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  bar: {
    width: 12,
    backgroundColor: '#d1d5db',
    borderRadius: RADIUS.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.lg,
  },
  metricCell: {
    width: '45%',
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.subtleInk,
    marginBottom: SPACING.xs,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.ink,
  },
  riskList: {
    gap: SPACING.sm,
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  riskDot: {
    width: 6,
    height: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.subtleInk,
  },
  riskText: {
    fontSize: 12,
    color: COLORS.mutedInk,
  },
  riskLevel: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#f3f4f6',
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  riskLabel: {
    fontSize: 10,
    color: COLORS.subtleInk,
  },
  riskValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.ink,
  },
  bodyText: {
    fontSize: 12,
    color: COLORS.mutedInk,
    marginTop: SPACING.sm,
  },
  benefitCard: {
    backgroundColor: '#f8fafc',
  },
  benefitList: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  benefitText: {
    fontSize: 12,
    color: COLORS.mutedInk,
  },
  footer: {
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  amountCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  amountLabel: {
    fontSize: 10,
    color: COLORS.subtleInk,
    marginBottom: SPACING.xs,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  amountPrefix: {
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.ink,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.ink,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  footerButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
  },
  footerSecondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  footerSecondaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.mutedInk,
  },
  footerPrimary: {
    backgroundColor: COLORS.ink,
  },
  footerPrimaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.surface,
  },
  footerDisabled: {
    backgroundColor: COLORS.border,
  },
  footerDisabledText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.subtleInk,
  },
});
