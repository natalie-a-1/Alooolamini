/**
 * Modal for adding a new transaction to an account.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles } from '../AccountsScreen.styles';
import { type Category } from '@/services/spending';

type AddTransactionModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    txnType: 'spend' | 'receive';
    amount: number;
    merchant: string;
    categoryId?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  categories: Category[];
  isLoadingCategories: boolean;
};

export function AddTransactionModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  categories,
  isLoadingCategories,
}: AddTransactionModalProps) {
  const insets = useSafeAreaInsets();
  const [txnType, setTxnType] = useState<'spend' | 'receive'>('spend');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const canSubmit = useMemo(
    () => merchant.trim().length > 0 && amount.trim().length > 0 && !Number.isNaN(Number(amount)),
    [merchant, amount]
  );

  const formatMoneyInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (!cleaned) {
      setAmount('');
      return;
    }
    const value = (parseInt(cleaned, 10) / 100).toFixed(2);
    setAmount(value);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const numericAmount = Number(amount);
    await onSubmit({
      txnType,
      amount: numericAmount,
      merchant: merchant.trim(),
      categoryId: categoryId ?? undefined,
    });
    if (!isSubmitting) {
      setTxnType('spend');
      setAmount('');
      setMerchant('');
      setCategoryId(categories[0]?.id);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="interactive"
              contentContainerStyle={{ paddingBottom: insets.bottom + 320 }}
            >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Transaction</Text>
              <Pressable style={styles.modalCloseButton} onPress={onClose}>
                <Icon name="x" size={24} color={COLORS.ink} />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Transaction Type</Text>
              <View style={styles.typeSelector}>
                {(['spend', 'receive'] as const).map((type) => (
                  <Pressable
                    key={type}
                    style={[styles.typeOption, txnType === type && styles.typeOptionSelected]}
                    onPress={() => setTxnType(type)}
                  >
                    <Text style={[styles.typeOptionText, txnType === type && styles.typeOptionTextSelected]}>
                      {type === 'spend' ? 'Spend' : 'Receive'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Transaction Name</Text>
              <TextInput
                style={styles.textInput}
                value={merchant}
                onChangeText={setMerchant}
                placeholder="e.g., Coffee, Brokerage buy"
                placeholderTextColor={COLORS.subtleInk}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                style={styles.textInput}
                value={amount}
                onChangeText={formatMoneyInput}
                placeholder={txnType === 'spend' ? '0.00 (Spend)' : '0.00 (Receive)'}
                placeholderTextColor={COLORS.subtleInk}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              {isLoadingCategories ? (
                <ActivityIndicator color={COLORS.ink} />
              ) : categories.length === 0 ? (
                <Text style={styles.detailText}>No categories found for this household.</Text>
              ) : (
                <View style={styles.categoryGrid}>
                  {categories.map((cat) => {
                    const isSelected = categoryId === cat.id;
                    const lower = cat.name.toLowerCase();
                    const iconName =
                      lower.includes('groc') || lower.includes('food') || lower.includes('dining')
                        ? 'shoppingCart'
                        : lower.includes('home') || lower.includes('rent') || lower.includes('mort')
                        ? 'home'
                        : lower.includes('util') || lower.includes('bill') || lower.includes('power')
                        ? 'zap'
                        : lower.includes('health') || lower.includes('med')
                        ? 'heart'
                        : lower.includes('trans') || lower.includes('fuel') || lower.includes('gas')
                        ? 'car'
                        : lower.includes('invest')
                        ? 'trendingUp'
                        : 'moreHorizontal';
                    return (
                      <Pressable
                        key={cat.id}
                        style={[styles.categoryTile, isSelected && styles.categoryTileSelected]}
                        onPress={() => setCategoryId(cat.id)}
                      >
                        <View style={styles.categoryIcon}>
                          <Icon name={iconName} size={24} color={COLORS.ink} />
                        </View>
                        <Text style={styles.categoryLabel} numberOfLines={1}>
                          {cat.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            <Pressable
              style={[styles.submitButton, (!canSubmit || isSubmitting) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? <ActivityIndicator color={COLORS.surface} /> : <Text style={styles.submitButtonText}>Add Transaction</Text>}
            </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
}
