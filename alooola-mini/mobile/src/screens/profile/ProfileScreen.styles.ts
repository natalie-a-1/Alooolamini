/**
 * Styles for the Profile screen.
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.pill,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.ink,
  },
  profileRole: {
    fontSize: 12,
    color: COLORS.subtleInk,
  },
  profileMeta: {
    fontSize: 10,
    color: COLORS.subtleInk,
    marginTop: SPACING.xs,
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
  },
  toggleSubtitle: {
    fontSize: 10,
    color: COLORS.subtleInk,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: COLORS.ink,
  },
  toggleOff: {
    backgroundColor: COLORS.border,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
  },
  toggleKnobOn: {
    marginLeft: 24,
  },
  toggleKnobOff: {
    marginLeft: 4,
  },
  jointBlock: {
    marginTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: SPACING.lg,
    gap: SPACING.md,
  },
  jointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  jointAvatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
  },
  jointText: {
    flex: 1,
  },
  jointName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.ink,
  },
  jointRole: {
    fontSize: 10,
    color: COLORS.subtleInk,
  },
  removeText: {
    fontSize: 10,
    color: COLORS.danger,
  },
  addMemberButton: {
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  addMemberText: {
    fontSize: 11,
    color: COLORS.mutedInk,
    fontWeight: '600',
  },
  referralCard: {
    backgroundColor: '#ecfdf5',
  },
  referralHeader: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  referralIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralHeaderText: {
    flex: 1,
  },
  referralTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: SPACING.xs,
  },
  referralSubtitle: {
    fontSize: 11,
    color: COLORS.mutedInk,
  },
  codeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  codeLabel: {
    fontSize: 10,
    color: COLORS.subtleInk,
    marginBottom: SPACING.xs,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  codeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.ink,
    letterSpacing: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.ink,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
  },
  copyButtonText: {
    fontSize: 11,
    color: COLORS.surface,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBlock: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.subtleInk,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.ink,
    marginTop: SPACING.xs,
  },
  statValuePositive: {
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.accentGreen,
    marginTop: SPACING.xs,
  },
  shareButton: {
    backgroundColor: COLORS.ink,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  shareButtonText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  menuList: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  menuItem: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
  },
  logoutButton: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger,
    marginTop: SPACING.md,
  },
  logoutButtonText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
  },
});
