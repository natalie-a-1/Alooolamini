/**
 * Accounts screen with card carousel and transaction history.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  ViewToken,
} from 'react-native';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { useHousehold } from '@/hooks/useHousehold';
import {
  Account,
  Transaction,
  createAccount,
  getAccounts,
  getTransactions,
} from '@/services/spending';
import { COLORS } from '@/theme/colors';
import { styles, ACCOUNT_COLORS } from './AvailableScreen.styles';
import { formatCurrency, formatDate } from '@/lib/format';

type AccountType = 'checking' | 'savings' | 'investment' | 'credit';

const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
  checking: 'building',
  savings: 'piggyBank',
  investment: 'trendingUp',
  credit: 'creditCard',
};

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Checking',
  savings: 'Savings',
  investment: 'Invest',
  credit: 'Credit',
};

interface AccountCardProps {
  account: Account;
}

function AccountCard({ account }: AccountCardProps) {
  const accentColor = ACCOUNT_COLORS[account.type] || COLORS.accentBlue;
  const balance = account.balance?.currentBalance ?? 0;

  return (
    <View style={styles.accountCard}>
      <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName}>{account.name}</Text>
          <View style={[styles.cardTypeIcon, { backgroundColor: `${accentColor}15` }]}>
            <Icon
              name={ACCOUNT_TYPE_ICONS[account.type]}
              size={16}
              color={accentColor}
            />
          </View>
        </View>

        <View style={styles.cardBalanceContainer}>
          <Text style={styles.cardBalanceLabel}>Current Balance</Text>
          <Text style={styles.cardBalance}>{formatCurrency(balance)}</Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.cardInstitution}>{account.institution || 'No institution'}</Text>
          {account.last4 && (
            <Text style={styles.cardLast4}>•••• {account.last4}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

interface TransactionRowProps {
  transaction: Transaction;
}

function TransactionRow({ transaction }: TransactionRowProps) {
  const isDebit = transaction.txnType === 'debit';
  const amount = isDebit ? -transaction.amount : transaction.amount;
  const userName = transaction.attributedUser?.name || 'Unknown';
  const date = formatDate(transaction.txnDate);

  return (
    <View style={styles.transactionCard}>
      <View style={styles.transactionIcon}>
        <Icon name="dollar" size={18} color={COLORS.mutedInk} />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionMerchant}>{transaction.merchant}</Text>
        <Text style={styles.transactionMeta}>
          {userName} · {date}
        </Text>
      </View>
      <View style={styles.transactionAmountContainer}>
        <Text
          style={[
            styles.transactionAmount,
            isDebit ? styles.amountDebit : styles.amountCredit,
          ]}
        >
          {formatCurrency(amount)}
        </Text>
      </View>
    </View>
  );
}

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; type: AccountType; institution?: string; last4?: string }) => Promise<void>;
  isSubmitting: boolean;
}

function AddAccountModal({ visible, onClose, onSubmit, isSubmitting }: AddAccountModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [institution, setInstitution] = useState('');
  const [last4, setLast4] = useState('');

  const canSubmit = name.trim().length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onSubmit({
      name: name.trim(),
      type,
      institution: institution.trim() || undefined,
      last4: last4.trim() || undefined,
    });
    // Reset form
    setName('');
    setType('checking');
    setInstitution('');
    setLast4('');
  };

  const accountTypes: AccountType[] = ['checking', 'savings', 'investment', 'credit'];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Account</Text>
              <Pressable style={styles.modalCloseButton} onPress={onClose}>
                <Icon name="x" size={24} color={COLORS.ink} />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Name</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Primary Checking"
                placeholderTextColor={COLORS.subtleInk}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Type</Text>
              <View style={styles.typeSelector}>
                {accountTypes.map((t) => (
                  <Pressable
                    key={t}
                    style={[styles.typeOption, type === t && styles.typeOptionSelected]}
                    onPress={() => setType(t)}
                  >
                    <Icon
                      name={ACCOUNT_TYPE_ICONS[t]}
                      size={20}
                      color={type === t ? ACCOUNT_COLORS[t] : COLORS.subtleInk}
                    />
                    <Text
                      style={[
                        styles.typeOptionText,
                        type === t && styles.typeOptionTextSelected,
                      ]}
                    >
                      {ACCOUNT_TYPE_LABELS[t]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Institution (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={institution}
                onChangeText={setInstitution}
                placeholder="e.g., Chase Bank"
                placeholderTextColor={COLORS.subtleInk}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last 4 Digits (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={last4}
                onChangeText={(text) => setLast4(text.replace(/\D/g, '').slice(0, 4))}
                placeholder="1234"
                placeholderTextColor={COLORS.subtleInk}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            <Pressable
              style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.surface} />
              ) : (
                <Text style={styles.submitButtonText}>Add Account</Text>
              )}
            </Pressable>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function AvailableScreen() {
  const { household } = useHousehold();
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const selectedAccount = accounts[selectedIndex];

  // Calculate total balance across all accounts
  const totalBalance = accounts.reduce((sum, acc) => {
    return sum + (acc.balance?.currentBalance ?? 0);
  }, 0);

  // Load accounts
  const loadAccounts = useCallback(async () => {
    if (!household?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await getAccounts(household.id);
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, [household?.id]);

  // Load transactions for selected account
  const loadTransactions = useCallback(async () => {
    if (!household?.id || !selectedAccount) {
      setTransactions([]);
      return;
    }

    setIsLoadingTransactions(true);
    try {
      const result = await getTransactions(household.id, {
        accountId: selectedAccount.id,
        limit: 10,
      });
      setTransactions(result.items);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [household?.id, selectedAccount?.id]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Handle card scroll
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setSelectedIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  // Handle add account
  const handleAddAccount = async (data: {
    name: string;
    type: AccountType;
    institution?: string;
    last4?: string;
  }) => {
    if (!household?.id) return;

    setIsSubmitting(true);
    try {
      await createAccount(household.id, data);
      await loadAccounts();
      setShowAddModal(false);
      // Scroll to the new account (last one)
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to create account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.ink} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Accounts</Text>
          <Text style={styles.totalBalance}>
            {formatCurrency(totalBalance)} total
          </Text>
        </View>
        <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Icon name="plus" size={16} color={COLORS.surface} />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {accounts.length > 0 ? (
        <>
          {/* Card Carousel */}
          <View style={styles.carouselContainer}>
            <FlatList
              ref={flatListRef}
              data={accounts}
              renderItem={({ item }) => <AccountCard account={item} />}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToAlignment="start"
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
            />
          </View>

          {/* Page Indicator */}
          {accounts.length > 1 && (
            <View style={styles.pageIndicator}>
              {accounts.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, index === selectedIndex && styles.dotActive]}
                />
              ))}
            </View>
          )}

          {/* Transactions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transactions</Text>

            {isLoadingTransactions ? (
              <ActivityIndicator color={COLORS.ink} />
            ) : transactions.length > 0 ? (
              <View style={styles.transactionList}>
                {transactions.map((txn) => (
                  <TransactionRow key={txn.id} transaction={txn} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Icon name="dollar" size={24} color={COLORS.subtleInk} />
                </View>
                <Text style={styles.emptyTitle}>No Transactions</Text>
                <Text style={styles.emptyText}>
                  Transactions for this account will appear here.
                </Text>
              </View>
            )}
          </View>
        </>
      ) : (
        /* Empty State */
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Icon name="creditCard" size={28} color={COLORS.subtleInk} />
          </View>
          <Text style={styles.emptyTitle}>No Accounts Yet</Text>
          <Text style={styles.emptyText}>
            Add your first account to start tracking balances and transactions.
          </Text>
          <Pressable style={styles.emptyButton} onPress={() => setShowAddModal(true)}>
            <Text style={styles.emptyButtonText}>Add Your First Account</Text>
          </Pressable>
        </View>
      )}

      {/* Add Account Modal */}
      <AddAccountModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddAccount}
        isSubmitting={isSubmitting}
      />
    </Screen>
  );
}
