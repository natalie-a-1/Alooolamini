/**
 * Styles for the Login screen.
 */
import { StyleSheet } from 'react-native';
import { COLORS } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/layout';

export const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: 200,
    height: 60,
    borderRadius: RADIUS.sm,
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.ink,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.mutedInk,
    textAlign: 'center',
    marginBottom: 64,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: '#dcfce7',
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    marginTop: 56,
    marginBottom: SPACING.lg,
    width: '100%',
  },
  demoButtonText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    fontSize: 11,
    color: COLORS.subtleInk,
  },
  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    padding: 4,
    marginBottom: SPACING.xl,
    width: '100%',
  },
  tabButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.ink,
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabTextActive: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextInactive: {
    color: COLORS.mutedInk,
    fontSize: 12,
    fontWeight: '600',
  },
  inputCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: COLORS.ink,
  },
  primaryButton: {
    backgroundColor: COLORS.ink,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    width: '100%',
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  linkText: {
    fontSize: 12,
    color: COLORS.mutedInk,
  },
  features: {
    marginTop: SPACING.xl,
    gap: SPACING.sm,
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: RADIUS.pill,
  },
  featureText: {
    fontSize: 12,
    color: COLORS.mutedInk,
  },
  terms: {
    fontSize: 10,
    color: COLORS.subtleInk,
    textAlign: 'center',
    marginTop: SPACING.xl,
    width: '100%',
  },
});
