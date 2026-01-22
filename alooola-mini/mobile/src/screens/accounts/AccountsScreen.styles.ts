/**
 * Styles for the Available screen.
 */
import { Dimensions, StyleSheet } from 'react-native';
import { COLORS } from '@/theme/colors';
import { RADIUS, SPACING, SCREEN_PADDING } from '@/theme/layout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - SCREEN_PADDING * 2;
const CARD_HEIGHT = CARD_WIDTH * 0.58; // Credit card aspect ratio ~1.6:1

export const ACCOUNT_COLORS = {
  checking: COLORS.accentBlue,
  savings: COLORS.accentGreen,
  investment: COLORS.accentPurple,
  credit: COLORS.accentRose,
} as const;

export const styles = StyleSheet.create({
  detailText: {
    fontSize: 13,
    color: COLORS.subtleInk,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.ink,
    marginBottom: SPACING.xs,
  },
  totalBalance: {
    fontSize: 14,
    color: COLORS.mutedInk,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ink,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    gap: SPACING.xs,
  },
  addButtonText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: '600',
  },

  // Card Carousel
  carouselContainer: {
    marginBottom: SPACING.md,
    marginHorizontal: -SCREEN_PADDING,
  },
  carouselContent: {
    paddingHorizontal: SCREEN_PADDING,
  },
  accountCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginRight: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    borderTopLeftRadius: RADIUS.xl,
    borderBottomLeftRadius: RADIUS.xl,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: SPACING.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.mutedInk,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardBalanceContainer: {
    marginVertical: SPACING.md,
  },
  cardBalanceLabel: {
    fontSize: 11,
    color: COLORS.subtleInk,
    marginBottom: SPACING.xs,
  },
  cardBalance: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.ink,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardInstitution: {
    fontSize: 12,
    color: COLORS.subtleInk,
  },
  cardLast4: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.mutedInk,
    letterSpacing: 2,
  },
  cardTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Page Indicator
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.ink,
    width: 24,
  },

  // Transactions Section
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '300',
    color: COLORS.ink,
  },
  transactionList: {
    gap: SPACING.sm,
  },
  transactionCard: {
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
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionMerchant: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.ink,
  },
  transactionMeta: {
    fontSize: 12,
    color: COLORS.subtleInk,
    marginTop: 2,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  amountDebit: {
    color: COLORS.ink,
  },
  amountCredit: {
    color: COLORS.success,
  },

  // Empty State
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.pill,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.mutedInk,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: COLORS.ink,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  emptyButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.ink,
  },
  modalCloseButton: {
    padding: SPACING.sm,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.mutedInk,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.ink,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeOption: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionSelected: {
    borderColor: COLORS.ink,
    backgroundColor: COLORS.surface,
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.mutedInk,
    marginTop: SPACING.xs,
  },
  typeOptionTextSelected: {
    color: COLORS.ink,
  },
  submitButton: {
    backgroundColor: COLORS.ink,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  // Category grid for add-transaction modal
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryTile: {
    flexBasis: '31%',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  categoryTileSelected: {
    borderColor: COLORS.ink,
    backgroundColor: COLORS.surface,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: COLORS.ink,
    textAlign: 'center',
    paddingHorizontal: SPACING.xs,
  },
});
