/**
 * AddTransactionModal
 * -------------------
 * Modal component for adding a new transaction to an account.
 * Allows user to specify transaction type, name, amount, and category.
 * 
 * Props:
 *   visible: Whether the modal is open.
 *   onClose: Callback for closing the modal.
 *   onSubmit: Callback on submit (receives transaction data).
 *   isSubmitting: Whether submission is in progress.
 *   categories: List of available categories.
 *   isLoadingCategories: Whether categories are being loaded.
 * 
 * Usage:
 *   <AddTransactionModal ...props />
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconProps } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles } from '../AccountsScreen.styles';
import { type Category } from '@/services/spending';
import { formatMoneyInput, normalizeName } from '@/lib/format';
import { CATEGORY_MAP } from '@/lib/constants';

/**
 * Shape describing visual config for a category.
 */
type CategoryVisual = {
  icon: IconProps['name'];
  color: string;
  label: string;
};

/**
 * Utility: Appends an alpha code to a hex color if valid.
 * @param hex - Color string, e.g. '#123456'
 * @param alpha - Hex alpha ('00'...'FF')
 * @returns Color hex string with alpha, or original if not 7 chars
 */
const withAlpha = (hex: string, alpha: string): string =>
  hex.startsWith('#') && hex.length === 7 ? `${hex}${alpha}` : hex;

/**
 * Determines the category's icon/color/label visual spec for rendering.
 * @param name - Category name (arbitrary case/spacing)
 */
const getCategoryVisual = (name: string): CategoryVisual => {
  const key = normalizeName(name);
  return CATEGORY_MAP[key] ?? CATEGORY_MAP.other;
};

type AddTransactionModalProps = {
  /** Whether the modal is visible */
  visible: boolean;
  /** Called when user closes the modal */
  onClose: () => void;
  /** Called when user submits the transaction data */
  onSubmit: (data: {
    txnType: 'spend' | 'receive';
    amount: number;
    merchant: string;
    categoryId?: string;
  }) => Promise<void>;
  /** True if the transaction is being submitted */
  isSubmitting: boolean;
  /** List of selectable categories */
  categories: Category[];
  /** True if categories are loading from backend */
  isLoadingCategories: boolean;
};

/**
 * AddTransactionModal implementation.
 */
export function AddTransactionModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  categories,
  isLoadingCategories
}: AddTransactionModalProps) {
  const insets = useSafeAreaInsets();
  // State for form fields
  const [txnType, setTxnType] = useState<'spend' | 'receive'>('spend');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  /**
   * Selects the first available category as default, if not already set.
   */
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  /**
   * Whether form can be submitted (basic validation).
   */
  const canSubmit = useMemo(() => {
    return (
      merchant.trim().length > 0 &&
      amount.trim().length > 0 &&
      !Number.isNaN(Number(amount))
    );
  }, [merchant, amount]);

  /**
   * Handles submit button press. Calls onSubmit prop, resets state on completion.
   */
  const handleSubmit = async () => {
    if (!canSubmit) return;
    const numericAmount = Number(amount);
    await onSubmit({
      txnType,
      amount: numericAmount,
      merchant: merchant.trim(),
      categoryId: categoryId ?? undefined
    });
    if (!isSubmitting) {
      setTxnType('spend');
      setAmount('');
      setMerchant('');
      setCategoryId(categories[0]?.id);
    }
  };

  // ========== JSX RENDER ==========
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
            onPress={e => e.stopPropagation()}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="interactive"
              contentContainerStyle={{ paddingBottom: insets.bottom + 320 }}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Transaction</Text>
                <Pressable style={styles.modalCloseButton} onPress={onClose}>
                  <Icon name="x" size={24} color={COLORS.ink} />
                </Pressable>
              </View>

              {/* Transaction Type Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Transaction Type</Text>
                <View style={styles.typeSelector}>
                  {(['spend', 'receive'] as const).map(type => (
                    <Pressable
                      key={type}
                      style={[
                        styles.typeOption,
                        txnType === type && styles.typeOptionSelected
                      ]}
                      onPress={() => setTxnType(type)}
                    >
                      <Text
                        style={[
                          styles.typeOptionText,
                          txnType === type && styles.typeOptionTextSelected
                        ]}
                      >
                        {type === 'spend' ? 'Spend' : 'Receive'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Transaction Name Input */}
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

              {/* Amount Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount</Text>
                <TextInput
                  style={styles.textInput}
                  value={amount}
                  onChangeText={text => setAmount(formatMoneyInput(text))}
                  placeholder={
                    txnType === 'spend'
                      ? '0.00 (Spend)'
                      : '0.00 (Receive)'
                  }
                  placeholderTextColor={COLORS.subtleInk}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Category Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                {isLoadingCategories ? (
                  <ActivityIndicator color={COLORS.ink} />
                ) : categories.length === 0 ? (
                  <Text style={styles.detailText}>
                    No categories found for this household.
                  </Text>
                ) : (
                  <View style={styles.categoryGrid}>
                    {categories.map(cat => {
                      const isSelected = categoryId === cat.id;
                      const visual = getCategoryVisual(cat.name);
                      return (
                        <Pressable
                          key={cat.id}
                          style={[
                            styles.categoryTile,
                            isSelected && [
                              styles.categoryTileSelected,
                              { borderColor: visual.color }
                            ]
                          ]}
                          onPress={() => setCategoryId(cat.id)}
                        >
                          <View
                            style={[
                              styles.categoryIcon,
                              {
                                backgroundColor: withAlpha(
                                  visual.color,
                                  '14'
                                )
                              }
                            ]}
                          >
                            <Icon
                              name={visual.icon}
                              size={24}
                              color={visual.color}
                            />
                          </View>
                          <Text
                            style={styles.categoryLabel}
                            numberOfLines={1}
                            ellipsizeMode="clip"
                          >
                            {visual.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Submit Button */}
              <Pressable
                style={[
                  styles.submitButton,
                  (!canSubmit || isSubmitting) && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.surface} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    Add Transaction
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
}
