/**
 * Modal for adding a new account.
 */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles, ACCOUNT_COLORS } from '../AccountsScreen.styles';
import { ACCOUNT_TYPE_ICONS, ACCOUNT_TYPE_LABELS } from '../helpers/accountTypes';
import { type AccountType } from '../hooks/useAccountsData';

type AddAccountModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; type: AccountType; institution?: string; last4?: string }) => Promise<number | null>;
  isSubmitting: boolean;
};

export function AddAccountModal({ visible, onClose, onSubmit, isSubmitting }: AddAccountModalProps) {
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
    setName('');
    setType('checking');
    setInstitution('');
    setLast4('');
  };

  const accountTypes: AccountType[] = ['checking', 'savings', 'investment', 'credit'];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
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
                    <Text style={[styles.typeOptionText, type === t && styles.typeOptionTextSelected]}>
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
              {isSubmitting ? <ActivityIndicator color={COLORS.surface} /> : <Text style={styles.submitButtonText}>Add Account</Text>}
            </Pressable>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
