/**
 * Styles for the Available screen.
 */
import { StyleSheet } from 'react-native';
import { COLORS } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/layout';

export const styles = StyleSheet.create({
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.pill,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.mutedInk,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    backgroundColor: COLORS.ink,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  emptyButtonText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '600',
  },
});
