/**
 * Styles for the Onboarding screen.
 */
import { StyleSheet } from 'react-native';
import { COLORS } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/layout';

export const styles = StyleSheet.create({
  progressBlock: {
    paddingBottom: SPACING.md,
  },
  progressRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: RADIUS.pill,
  },
  progressActive: {
    backgroundColor: COLORS.ink,
  },
  progressInactive: {
    backgroundColor: COLORS.border,
  },
  stepLabel: {
    fontSize: 10,
    color: COLORS.subtleInk,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  heading: {
    fontSize: 24,
    fontWeight: '300',
    color: COLORS.ink,
    marginBottom: SPACING.xs,
  },
  subheading: {
    fontSize: 12,
    color: COLORS.mutedInk,
    marginBottom: SPACING.lg,
  },
  list: {
    gap: SPACING.sm,
  },
  optionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    backgroundColor: '#f3f4f6',
    borderColor: COLORS.ink,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconDefault: {
    backgroundColor: '#f3f4f6',
  },
  optionIconSelected: {
    backgroundColor: COLORS.ink,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
    flex: 1,
  },
  optionDescription: {
    fontSize: 11,
    color: COLORS.mutedInk,
  },
  tipCard: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#dbeafe',
    borderRadius: RADIUS.lg,
  },
  tipCardSuccess: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#dcfce7',
    borderRadius: RADIUS.lg,
  },
  tipText: {
    fontSize: 11,
    color: COLORS.mutedInk,
  },
  customCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  customLabel: {
    fontSize: 10,
    color: COLORS.mutedInk,
    marginBottom: SPACING.xs,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  customPrefix: {
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.ink,
  },
  customInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.ink,
  },
  benefitCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  benefitHighlight: {
    backgroundColor: '#ecfdf5',
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: SPACING.xs,
  },
  benefitText: {
    fontSize: 11,
    color: COLORS.mutedInk,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.pill,
    flex: 1,
  },
  footerButtonSecondary: {
    backgroundColor: COLORS.surface,
  },
  footerButtonPrimary: {
    backgroundColor: COLORS.ink,
  },
  footerButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  footerButtonSecondaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.mutedInk,
  },
  footerButtonPrimaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.surface,
  },
  footerButtonDisabledText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.subtleInk,
  },
});
