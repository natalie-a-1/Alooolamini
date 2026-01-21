/**
 * Styles for the Home screen.
 */
import { StyleSheet } from 'react-native';
import { COLORS } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/layout';

export const styles = StyleSheet.create({
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
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.surface,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  balanceBlock: {
    marginBottom: SPACING.lg,
  },
  balanceValue: {
    fontSize: 40,
    fontWeight: '300',
    color: COLORS.ink,
    marginBottom: SPACING.sm,
  },
  balanceGainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  gainIconCircle: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.pill,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gainIconCircleNegative: {
    backgroundColor: '#fee2e2',
  },
  gainText: {
    fontSize: 12,
    color: COLORS.mutedInk,
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
    marginBottom: SPACING.lg,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
  },
  cardMeta: {
    fontSize: 12,
    color: COLORS.subtleInk,
    marginBottom: SPACING.xs,
  },
  cardTitle: {
    fontSize: 14,
    color: COLORS.ink,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.ink,
  },
  axisLabel: {
    fontSize: 10,
    color: COLORS.subtleInk,
  },
  axisLabelSpacer: {
    marginTop: SPACING.xl,
  },
  chartArea: {
    height: 120,
    position: 'relative',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
  },
  chartBarWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.subtleInk,
  },
  chartBarSelected: {
    backgroundColor: COLORS.accentPurple,
    width: 6,
  },
  chartTooltip: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  chartTooltipValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.ink,
  },
  chartTooltipDate: {
    fontSize: 12,
    color: COLORS.mutedInk,
    marginTop: 2,
  },
  chartDateLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  chartDateLabel: {
    fontSize: 10,
    color: COLORS.subtleInk,
  },
  timeframeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  timeframeChip: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
  },
  timeframeChipActive: {
    backgroundColor: COLORS.ink,
  },
  timeframeChipInactive: {
    backgroundColor: COLORS.surface,
  },
  timeframeTextActive: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  timeframeTextInactive: {
    color: COLORS.mutedInk,
    fontSize: 12,
    fontWeight: '600',
  },
  seeMore: {
    fontSize: 18,
    fontWeight: '300',
    color: COLORS.ink,
    marginBottom: SPACING.lg,
  },
  watchlistSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.ink,
    marginBottom: SPACING.lg,
  },
  watchlistList: {
    gap: SPACING.sm,
  },
  watchlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  watchlistItemLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  watchlistItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.ink,
    marginBottom: 2,
  },
  watchlistItemRisk: {
    fontSize: 11,
    color: COLORS.mutedInk,
  },
  watchlistItemRight: {
    alignItems: 'flex-end',
  },
  watchlistItemReturn: {
    fontSize: 14,
    fontWeight: '600',
  },
  watchlistItemLabel: {
    fontSize: 10,
    color: COLORS.subtleInk,
    marginTop: 2,
  },
  returnPositive: {
    color: COLORS.success,
  },
  returnNegative: {
    color: COLORS.danger,
  },
  watchlistViewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  watchlistViewAllText: {
    fontSize: 12,
    color: COLORS.mutedInk,
  },
  insightCard: {
    backgroundColor: COLORS.surface,
  },
  insightRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  aiBadge: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.accentPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiText: {
    color: COLORS.surface,
    fontWeight: '700',
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    fontSize: 12,
    color: COLORS.mutedInk,
  },
  gainTextNegative: {
    color: COLORS.danger,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.pill,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.mutedInk,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  ctaList: {
    width: '100%',
    gap: SPACING.sm,
  },
  ctaButton: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  ctaIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaContent: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
  },
  ctaText: {
    fontSize: 11,
    color: COLORS.mutedInk,
  },
});
