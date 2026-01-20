/**
 * Styles for the Discover screen.
 */
import { StyleSheet } from 'react-native';
import { COLORS } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/layout';

export const styles = StyleSheet.create({
  header: {
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: 30,
    fontWeight: '300',
    color: COLORS.ink,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.mutedInk,
  },
  aiButton: {
    backgroundColor: COLORS.ink,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xxl,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  aiButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  aiButtonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.surface,
  },
  aiButtonText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
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
  opportunityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  opportunityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  opportunityText: {
    flex: 1,
  },
  opportunityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: SPACING.xs,
  },
  opportunityTicker: {
    fontSize: 11,
    color: COLORS.subtleInk,
  },
  opportunityMetaRow: {
    flexDirection: 'row',
    gap: SPACING.xxl,
  },
  metaLabel: {
    fontSize: 10,
    color: COLORS.subtleInk,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.ink,
  },
  metaValuePositive: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accentEmerald,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
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
  chatHeaderText: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.ink,
  },
  chatSubtitle: {
    fontSize: 10,
    color: COLORS.subtleInk,
  },
  chatMessages: {
    flex: 1,
  },
  chatMessagesContent: {
    gap: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
  },
  messageUser: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.ink,
  },
  messageAi: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
  },
  messageUserText: {
    fontSize: 12,
    color: COLORS.surface,
  },
  messageAiText: {
    fontSize: 12,
    color: COLORS.ink,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  scheduleButtonText: {
    fontSize: 11,
    color: COLORS.ink,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  quickActionChip: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  quickActionText: {
    fontSize: 10,
    color: COLORS.ink,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.sm,
  },
  chatInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.ink,
    paddingHorizontal: SPACING.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: COLORS.ink,
  },
  sendButtonInactive: {
    backgroundColor: COLORS.border,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: SPACING.sm,
  },
  dateCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  dateCardActive: {
    backgroundColor: COLORS.ink,
  },
  dateCardInactive: {
    backgroundColor: COLORS.surface,
  },
  dateTextActive: {
    color: COLORS.surface,
    fontSize: 12,
  },
  dateTextInactive: {
    color: COLORS.ink,
    fontSize: 12,
  },
  timeBlock: {
    marginTop: SPACING.lg,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  timeChip: {
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  timeChipActive: {
    backgroundColor: COLORS.ink,
  },
  timeChipInactive: {
    backgroundColor: COLORS.surface,
  },
  timeTextActive: {
    color: COLORS.surface,
    fontSize: 11,
  },
  timeTextInactive: {
    color: COLORS.ink,
    fontSize: 11,
  },
  confirmButton: {
    backgroundColor: COLORS.ink,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '600',
  },
});
