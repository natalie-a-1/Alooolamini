/**
 * Styles for the Assistant (AI chat) screen.
 */
import { StyleSheet } from 'react-native';
import { COLORS } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/layout';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  list: {
    gap: SPACING.sm,
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
  confirmButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  confirmButtonText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  timeFooter: {
    marginTop: SPACING.md,
  },
});
