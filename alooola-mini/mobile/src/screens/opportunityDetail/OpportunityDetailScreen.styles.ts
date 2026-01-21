/**
 * Styles for the OpportunityDetail screen.
 */
import { StyleSheet } from 'react-native';
import { COLORS } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/layout';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 32,
    height: 32,
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
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.ink,
  },
  headerSubtitle: {
    fontSize: 10,
    color: COLORS.subtleInk,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 1,
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
    paddingTop: SPACING.md,
    paddingBottom: 0,
    gap: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
    marginBottom: SPACING.xs,
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
    paddingVertical: 0,
    minHeight: 24,
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
