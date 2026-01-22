/**
 * AddAccountModal
 * ---------------
 * Modal component for creating a new financial account.
 * Allows user to input account details including name, type,
 * institution, and (optional) initial balance.
 *
 * Props:
 *  - visible: boolean
 *      Whether the modal is visible.
 *  - onClose: () => void
 *      Triggered to close the modal.
 *  - onSubmit: (data: { name, type, institution?, last4?, currentBalance? }) => Promise<number | null>
 *      Handles submission of the account form and should return a Promise.
 *  - isSubmitting: boolean
 *      Whether the form is currently submitting.
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Modal,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles, ACCOUNT_COLORS } from '../AccountsScreen.styles';
import { formatMoneyInput } from '@/lib/format';
import { ACCOUNT_TYPE_ICONS, ACCOUNT_TYPE_LABELS, ACCOUNT_TYPES } from '../helpers/accountTypes';
import { AccountType } from '../hooks/useAccountsData';
/**
 * Props for AddAccountModal component.
 */
type AddAccountModalProps = {
  /** Whether the modal is visible */
  visible: boolean;
  /** Closes the modal */
  onClose: () => void;
  /**
   * Handles form submission.
   * Returns a promise, typically the account id or null on error.
   */
  onSubmit: (data: {
    name: string;
    type: AccountType;
    institution?: string;
    last4?: string;
    currentBalance?: number;
  }) => Promise<number | null>;
  /** Whether form data is being submitted */
  isSubmitting: boolean;
};

/**
 * Renders a modal for adding a new financial account.
 */
export function AddAccountModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
}: AddAccountModalProps) {
  // Bottom inset for devices with home indicators
  const insets = useSafeAreaInsets();

  // Internal state for form data
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const INSTITUTIONS = ['Chase', 'Bank of America', 'Wells Fargo', 'Citi'];
  const [institution, setInstitution] = useState(INSTITUTIONS[0]);
  const [currentBalance, setCurrentBalance] = useState('');

  /** Form validity: must have a name and not be submitting */
  const canSubmit = name.trim().length > 0 && !isSubmitting;

  /**
   * Handles pressing the Add Account button.
   * Resets form fields upon successful submission.
   */
  const handleSubmit = async () => {
    if (!canSubmit) return;

    // Generate fake last 4 digits for demo UX
    const generatedLast4 = Math.floor(1000 + Math.random() * 9000).toString();

    await onSubmit({
      name: name.trim(),
      type,
      institution: institution.trim() || undefined,
      last4: generatedLast4,
      currentBalance: currentBalance ? Number(currentBalance) : undefined,
    });

    // Reset form
    setName('');
    setType('checking');
    setInstitution(INSTITUTIONS[0]);
    setCurrentBalance('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
    >
      <View style={styles.modalOverlay}>
        {/* First Pressable: tap outside to close */}
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          {/* Second Pressable: content container, stop propagation */}
          <Pressable
            style={styles.modalContent}
            onPress={e => e.stopPropagation()}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: insets.bottom + 320,
              }}
              keyboardDismissMode="interactive"
            >
              {/* Modal header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Account</Text>
                <Pressable
                  style={styles.modalCloseButton}
                  onPress={onClose}
                  accessibilityLabel="Close"
                >
                  <Icon name="x" size={24} color={COLORS.ink} />
                </Pressable>
              </View>

              {/* Account Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g., Primary Checking"
                  placeholderTextColor={COLORS.subtleInk}
                  autoCorrect={false}
                  autoCapitalize="words"
                  returnKeyType="done"
                />
              </View>

              {/* Account Type Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Type</Text>
                <View style={styles.typeSelector}>
                  {ACCOUNT_TYPES.map((accType: AccountType) => (
                    <Pressable
                      key={accType}
                      style={[
                        styles.typeOption,
                        type === accType && styles.typeOptionSelected,
                      ]}
                      onPress={() => setType(accType)}
                      accessibilityLabel={
                        ACCOUNT_TYPE_LABELS[accType as AccountType] +
                        (type === accType ? ' (selected)' : '')
                      }
                    >
                      <Icon
                        name={ACCOUNT_TYPE_ICONS[accType as AccountType]}
                        size={20}
                        color={
                          type === accType
                            ? ACCOUNT_COLORS[accType as AccountType]
                            : COLORS.subtleInk
                        }
                      />
                      <Text
                        style={[
                          styles.typeOptionText,
                          type === accType && styles.typeOptionTextSelected,
                        ]}
                      >
                        {ACCOUNT_TYPE_LABELS[accType as AccountType]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Institution Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Institution</Text>
                <View style={styles.typeSelector}>
                  {INSTITUTIONS.map(bank => (
                    <Pressable
                      key={bank}
                      style={[
                        styles.typeOption,
                        institution === bank && styles.typeOptionSelected,
                      ]}
                      onPress={() => setInstitution(bank)}
                      accessibilityLabel={
                        bank + (institution === bank ? ' (selected)' : '')
                      }
                    >
                      <Text
                        style={[
                          styles.typeOptionText,
                          institution === bank &&
                            styles.typeOptionTextSelected,
                        ]}
                      >
                        {bank}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Current Balance Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Balance (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={currentBalance}
                  onChangeText={text => setCurrentBalance(formatMoneyInput(text))}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.subtleInk}
                  keyboardType="decimal-pad"
                  autoCorrect={false}
                  returnKeyType="done"
                />
              </View>

              {/* Submit Button */}
              <Pressable
                style={[
                  styles.submitButton,
                  !canSubmit && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!canSubmit}
                accessibilityLabel="Submit new account"
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.surface} />
                ) : (
                  <Text style={styles.submitButtonText}>Add Account</Text>
                )}
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
}
