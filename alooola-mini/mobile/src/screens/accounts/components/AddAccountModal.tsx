/**
 * Modal for adding a new account.
 */
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles, ACCOUNT_COLORS } from '../AccountsScreen.styles';
import { ACCOUNT_TYPE_ICONS, ACCOUNT_TYPE_LABELS } from '../helpers/accountTypes';
import { type AccountType } from '../hooks/useAccountsData';

type AddAccountModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    type: AccountType;
    institution?: string;
    last4?: string;
    currentBalance?: number;
  }) => Promise<number | null>;
  isSubmitting: boolean;
};

export function AddAccountModal({ visible, onClose, onSubmit, isSubmitting }: AddAccountModalProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const INSTITUTIONS = ['Chase', 'Bank of America', 'Wells Fargo', 'Citi'];
  const [institution, setInstitution] = useState(INSTITUTIONS[0]);
  const [currentBalance, setCurrentBalance] = useState('');

  const formatMoneyInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (!cleaned) {
      setCurrentBalance('');
      return;
    }
    const value = (parseInt(cleaned, 10) / 100).toFixed(2);
    setCurrentBalance(value);
  };

  const canSubmit = name.trim().length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const generatedLast4 = Math.floor(1000 + Math.random() * 9000).toString();
    await onSubmit({
      name: name.trim(),
      type,
      institution: institution.trim() || undefined,
      last4: generatedLast4,
      currentBalance: currentBalance ? Number(currentBalance) : undefined,
    });
    setName('');
    setType('checking');
    setInstitution(INSTITUTIONS[0]);
    setCurrentBalance('');
  };

  const accountTypes: AccountType[] = ['checking', 'savings', 'investment', 'credit'];

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 320 }}
              keyboardDismissMode="interactive"
            >
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
                    <Text style={[styles.typeOptionText, type === t && styles.typeOptionTextSelected]}>
                      {ACCOUNT_TYPE_LABELS[t]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Institution</Text>
              <View style={styles.typeSelector}>
                {INSTITUTIONS.map((bank) => (
                  <Pressable
                    key={bank}
                    style={[styles.typeOption, institution === bank && styles.typeOptionSelected]}
                    onPress={() => setInstitution(bank)}
                  >
                    <Text style={[styles.typeOptionText, institution === bank && styles.typeOptionTextSelected]}>
                      {bank}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Balance (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={currentBalance}
                onChangeText={formatMoneyInput}
                placeholder="0.00"
                placeholderTextColor={COLORS.subtleInk}
                keyboardType="decimal-pad"
              />
            </View>

            <Pressable
              style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              {isSubmitting ? <ActivityIndicator color={COLORS.surface} /> : <Text style={styles.submitButtonText}>Add Account</Text>}
            </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
}
