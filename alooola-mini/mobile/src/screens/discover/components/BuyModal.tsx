/**
 * BuyModal - Modal for purchasing a portfolio with account selection.
 * 
 * Features:
 * - Dollar amount input
 * - Account selection (checking/savings only)
 * - Validation for no eligible accounts and insufficient funds
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/layout';
import { formatMoneyInput, formatCurrency } from '@/lib/format';
import { type Account } from '@/services/spending';
import { type CuratedPortfolio } from '@/services/portfolios';

type BuyModalProps = {
  /** Whether the modal is visible */
  visible: boolean;
  /** The portfolio being purchased */
  portfolio: CuratedPortfolio | null;
  /** Available accounts (will be filtered to checking/savings) */
  accounts: Account[];
  /** Whether accounts are loading */
  isLoadingAccounts: boolean;
  /** Called when user closes the modal */
  onClose: () => void;
  /** Called when user submits purchase */
  onSubmit: (data: { amount: number; accountId: string }) => Promise<void>;
  /** True if purchase is being submitted */
  isSubmitting: boolean;
};

export function BuyModal({
  visible,
  portfolio,
  accounts,
  isLoadingAccounts,
  onClose,
  onSubmit,
  isSubmitting,
}: BuyModalProps) {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Filter to only checking and savings accounts
  const eligibleAccounts = useMemo(
    () => accounts.filter((acc) => acc.type === 'checking' || acc.type === 'savings'),
    [accounts]
  );

  // Auto-select first eligible account
  useEffect(() => {
    if (eligibleAccounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(eligibleAccounts[0].id);
    }
  }, [eligibleAccounts, selectedAccountId]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!visible) {
      setAmount('');
      setSelectedAccountId(null);
    }
  }, [visible]);

  const selectedAccount = eligibleAccounts.find((acc) => acc.id === selectedAccountId);
  const numericAmount = parseFloat(amount) || 0;
  const hasInsufficientFunds =
    selectedAccount && numericAmount > (selectedAccount.balance?.currentBalance ?? 0);

  const canSubmit =
    numericAmount > 0 &&
    selectedAccountId &&
    !hasInsufficientFunds &&
    !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit || !selectedAccountId) return;

    try {
      await onSubmit({ amount: numericAmount, accountId: selectedAccountId });
      setAmount('');
      setSelectedAccountId(null);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const noEligibleAccounts = !isLoadingAccounts && eligibleAccounts.length === 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Buy {portfolio?.name ?? 'Portfolio'}
                </Text>
                <Pressable style={styles.modalCloseButton} onPress={onClose}>
                  <Icon name="x" size={24} color={COLORS.ink} />
                </Pressable>
              </View>

              {/* No Eligible Accounts Warning */}
              {noEligibleAccounts ? (
                <View style={styles.warningBox}>
                  <Icon name="alert" size={20} color={COLORS.warning} />
                  <Text style={styles.warningText}>
                    You need to set up a checking or savings account to make purchases.
                  </Text>
                </View>
              ) : (
                <>
                  {/* Amount Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Amount to Invest</Text>
                    <View style={styles.amountInputWrapper}>
                      <Text style={styles.currencySymbol}>$</Text>
                      <TextInput
                        style={styles.amountInput}
                        value={amount}
                        onChangeText={(text) => setAmount(formatMoneyInput(text))}
                        placeholder="0.00"
                        placeholderTextColor={COLORS.subtleInk}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>

                  {/* Account Selection */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Fund From</Text>
                    {isLoadingAccounts ? (
                      <ActivityIndicator color={COLORS.ink} />
                    ) : (
                      <View style={styles.accountList}>
                        {eligibleAccounts.map((account) => {
                          const isSelected = selectedAccountId === account.id;
                          const balance = account.balance?.currentBalance ?? 0;
                          const wouldBeInsufficient =
                            numericAmount > 0 && numericAmount > balance;

                          return (
                            <Pressable
                              key={account.id}
                              style={[
                                styles.accountOption,
                                isSelected && styles.accountOptionSelected,
                                wouldBeInsufficient && styles.accountOptionWarning,
                              ]}
                              onPress={() => setSelectedAccountId(account.id)}
                            >
                              <View style={styles.accountInfo}>
                                <Text style={styles.accountName}>{account.name}</Text>
                                <Text style={styles.accountType}>
                                  {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                                  {account.last4 ? ` ••${account.last4}` : ''}
                                </Text>
                              </View>
                              <View style={styles.accountBalanceWrapper}>
                                <Text
                                  style={[
                                    styles.accountBalance,
                                    wouldBeInsufficient && styles.accountBalanceWarning,
                                  ]}
                                >
                                  {formatCurrency(balance)}
                                </Text>
                                {wouldBeInsufficient && (
                                  <Text style={styles.insufficientText}>
                                    Insufficient
                                  </Text>
                                )}
                              </View>
                              {isSelected && (
                                <Icon name="check" size={16} color={COLORS.accentEmerald} />
                              )}
                            </Pressable>
                          );
                        })}
                      </View>
                    )}
                  </View>

                  {/* Insufficient Funds Warning */}
                  {hasInsufficientFunds && (
                    <View style={styles.errorBox}>
                      <Icon name="alert" size={16} color={COLORS.danger} />
                      <Text style={styles.errorText}>
                        Insufficient funds in selected account.
                      </Text>
                    </View>
                  )}

                  {/* Submit Button */}
                  <Pressable
                    style={[
                      styles.submitButton,
                      !canSubmit && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={COLORS.surface} />
                    ) : (
                      <Text style={styles.submitButtonText}>
                        Buy {numericAmount > 0 ? formatCurrency(numericAmount) : ''}
                      </Text>
                    )}
                  </Pressable>
                </>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.xl,
    maxHeight: '80%',
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
    padding: SPACING.xs,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.ink,
    marginBottom: SPACING.sm,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.ink,
    marginRight: SPACING.xs,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.ink,
  },
  accountList: {
    gap: SPACING.sm,
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  accountOptionSelected: {
    borderColor: COLORS.accentEmerald,
  },
  accountOptionWarning: {
    borderColor: COLORS.warning,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ink,
  },
  accountType: {
    fontSize: 11,
    color: COLORS.subtleInk,
    marginTop: 2,
  },
  accountBalanceWrapper: {
    alignItems: 'flex-end',
    marginRight: SPACING.sm,
  },
  accountBalance: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ink,
  },
  accountBalanceWarning: {
    color: COLORS.warning,
  },
  insufficientText: {
    fontSize: 10,
    color: COLORS.warning,
    marginTop: 2,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#FEF3C7',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.ink,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
  },
  submitButton: {
    backgroundColor: COLORS.ink,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  submitButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});
