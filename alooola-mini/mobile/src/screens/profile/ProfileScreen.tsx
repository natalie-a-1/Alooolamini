/**
 * Profile screen with user info and settings.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, Share, Text, TextInput, View, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { Icon } from '@/components/Icon';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';
import { ApiClientError } from '@/services/api';
import { createHousehold, getFullUserProfile, getHouseholdMembers, leaveHousehold, removeHouseholdMember, sendHouseholdInvite, type FullUserProfile, type HouseholdMember } from '@/services/user';
import { COLORS } from '@/theme/colors';
import { styles } from './ProfileScreen.styles';

const REFERRAL_REWARD = 200;

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { household, isLoading: householdLoading, refetch: refetchHousehold } = useHousehold();
  const [profile, setProfile] = useState<FullUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Joint account state - derived from actual household data
  const [isTogglingJoint, setIsTogglingJoint] = useState(false);
  
  // Household members state
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  
  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  
  // Leave household modal state
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isLeavingHousehold, setIsLeavingHousehold] = useState(false);
  
  // Derive joint account status from actual household data
  const jointAccountEnabled = !!household;
  
  // Check if current user is owner
  const currentUserMembership = householdMembers.find(m => m.userId === user?.id);
  const isOwner = currentUserMembership?.role === 'owner';

  const loadProfile = useCallback(async () => {
    try {
      const data = await getFullUserProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Load household members when household exists
  const loadHouseholdMembers = useCallback(async () => {
    if (!household?.id) {
      setHouseholdMembers([]);
      return;
    }

    setIsMembersLoading(true);
    try {
      const members = await getHouseholdMembers(household.id);
      // Filter to only show accepted members
      setHouseholdMembers(members.filter(m => m.status === 'accepted'));
    } catch (error) {
      console.error('Failed to load household members:', error);
      setHouseholdMembers([]);
    } finally {
      setIsMembersLoading(false);
    }
  }, [household?.id]);

  useEffect(() => {
    loadHouseholdMembers();
  }, [loadHouseholdMembers]);

  // Refresh household and members when screen is focused
  useFocusEffect(
    useCallback(() => {
      refetchHousehold();
      loadHouseholdMembers();
    }, [refetchHousehold, loadHouseholdMembers])
  );

  const handleCopyReferralCode = async () => {
    if (!profile?.referral?.code) return;
    try {
      await Clipboard.setStringAsync(profile.referral.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShareReferral = async () => {
    if (!profile?.referral?.code) return;
    try {
      await Share.share({
        message: `Join me on Alooola and we'll both get $${REFERRAL_REWARD}! Use my code: ${profile.referral.code}`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const handleToggleJoint = async () => {
    if (jointAccountEnabled) {
      // User wants to turn OFF - show warning modal
      setShowLeaveModal(true);
    } else {
      // User wants to turn ON - create household if none exists
      setIsTogglingJoint(true);
      try {
        const userName = profile?.name || user?.name || 'My';
        await createHousehold(`${userName}'s Household`);
        await refetchHousehold();
      } catch (error) {
        if (error instanceof ApiClientError) {
          Alert.alert('Error', error.message);
        } else {
          Alert.alert('Error', 'Failed to enable joint account. Please try again.');
        }
        console.error('Create household error:', error);
      } finally {
        setIsTogglingJoint(false);
      }
    }
  };

  const handleLeaveHousehold = async () => {
    if (!household) return;
    
    setIsLeavingHousehold(true);
    try {
      await leaveHousehold(household.id);
      setShowLeaveModal(false);
      await refetchHousehold();
      Alert.alert('Success', 'You have left the household.');
    } catch (error) {
      if (error instanceof ApiClientError) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to leave household. Please try again.');
      }
      console.error('Leave household error:', error);
    } finally {
      setIsLeavingHousehold(false);
    }
  };

  const handleInviteMember = () => {
    // Household is guaranteed to exist when Joint Account is ON
    setShowInviteModal(true);
  };

  const handleRemoveMember = (member: HouseholdMember) => {
    if (!household) return;
    
    const memberName = member.user.name || member.user.email;
    Alert.alert(
      'Remove Member',
      `Remove ${memberName} from the household?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeHouseholdMember(household.id, member.id);
              loadHouseholdMembers();
            } catch (error) {
              if (error instanceof ApiClientError) {
                Alert.alert('Error', error.message);
              } else {
                Alert.alert('Error', 'Failed to remove member.');
              }
            }
          },
        },
      ]
    );
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!household) {
      Alert.alert('Error', 'No household found');
      return;
    }

    setIsSendingInvite(true);
    try {
      await sendHouseholdInvite(household.id, inviteEmail.trim());
      Alert.alert('Invite Sent!', `An invitation has been sent to ${inviteEmail.trim()}`);
      setShowInviteModal(false);
      setInviteEmail('');
      refetchHousehold();
      loadHouseholdMembers();
    } catch (error) {
      if (error instanceof ApiClientError) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to send invite. Please try again.');
      }
      console.error('Send invite error:', error);
    } finally {
      setIsSendingInvite(false);
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.ink} />
        </View>
      </Screen>
    );
  }

  const userName = profile?.name || user?.name || 'User';
  const userEmail = profile?.email || user?.email || '';
  const avatarUrl = profile?.avatarUrl;
  const referralCode = profile?.referral?.code;
  const referralCount = profile?.referral?.completeCount ?? 0;
  const totalEarned = profile?.referral?.totalEarned ?? 0;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.profileRow}>
          {avatarUrl && !avatarUrl.startsWith('/') ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Icon name="user" size={28} color={COLORS.subtleInk} />
            </View>
          )}
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileRole}>{profile?.memberTier === 'premium' ? 'Premium Member' : 'Member'}</Text>
            <Text style={styles.profileMeta}>{userEmail}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={styles.toggleIcon}>
                <Icon name="users" size={16} color={COLORS.accentPurple} />
              </View>
              <View style={styles.toggleText}>
                <Text style={styles.toggleTitle}>Joint Account</Text>
                <Text style={styles.toggleSubtitle}>Share with partner or family</Text>
              </View>
            </View>
            <Pressable
              onPress={handleToggleJoint}
              disabled={isTogglingJoint || householdLoading}
              style={[
                styles.toggleSwitch,
                jointAccountEnabled ? styles.toggleOn : styles.toggleOff,
                (isTogglingJoint || householdLoading) && styles.toggleDisabled,
              ]}
            >
              {isTogglingJoint ? (
                <ActivityIndicator size="small" color={COLORS.surface} style={styles.toggleSpinner} />
              ) : (
                <View
                  style={[styles.toggleKnob, jointAccountEnabled ? styles.toggleKnobOn : styles.toggleKnobOff]}
                />
              )}
            </Pressable>
          </View>

          {jointAccountEnabled && (
            <View style={styles.jointBlock}>
              {isMembersLoading ? (
                <View style={styles.emptyState}>
                  <ActivityIndicator size="small" color={COLORS.ink} />
                </View>
              ) : householdMembers.length > 1 ? (
                <>
                  <Text style={styles.membersTitle}>Household Members</Text>
                  {householdMembers.map((member) => {
                    const avatarUrl = member.user.profile?.avatarUrl;
                    const isCurrentUser = member.userId === user?.id;
                    const canRemove = isOwner && !isCurrentUser;
                    
                    return (
                      <View key={member.id} style={styles.memberRow}>
                        {avatarUrl && !avatarUrl.startsWith('/') ? (
                          <Image source={{ uri: avatarUrl }} style={styles.memberAvatar} />
                        ) : (
                          <View style={[styles.memberAvatar, styles.memberAvatarPlaceholder]}>
                            <Icon name="user" size={14} color={COLORS.subtleInk} />
                          </View>
                        )}
                        <View style={styles.memberInfo}>
                          <Text style={styles.memberName}>
                            {member.user.name || member.user.email}
                            {isCurrentUser && ' (You)'}
                          </Text>
                          <Text style={styles.memberRole}>
                            {member.role === 'owner' ? 'Owner' : 'Member'}
                          </Text>
                        </View>
                        {canRemove && (
                          <Pressable 
                            onPress={() => handleRemoveMember(member)}
                            hitSlop={8}
                          >
                            <Text style={styles.removeText}>Remove</Text>
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                  <Pressable style={styles.addMemberButton} onPress={handleInviteMember}>
                    <Text style={styles.addMemberText}>+ Invite Another Member</Text>
                  </Pressable>
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="users" size={24} color={COLORS.subtleInk} />
                  <Text style={styles.emptyStateText}>No joint members yet</Text>
                  <Pressable style={styles.addMemberButton} onPress={handleInviteMember}>
                    <Text style={styles.addMemberText}>+ Invite a Member</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Referrals</Text>
        {referralCode ? (
          <>
            <View style={[styles.card, styles.referralCard]}>
              <View style={styles.referralHeader}>
                <View style={styles.referralIcon}>
                  <Icon name="gift" size={16} color={COLORS.surface} />
                </View>
                <View style={styles.referralHeaderText}>
                  <Text style={styles.referralTitle}>Earn ${REFERRAL_REWARD} per referral</Text>
                  <Text style={styles.referralSubtitle}>
                    Invite friends and you'll both receive ${REFERRAL_REWARD} when they fund their account.
                  </Text>
                </View>
              </View>

              <View style={styles.codeCard}>
                <Text style={styles.codeLabel}>Your Referral Code</Text>
                <View style={styles.codeRow}>
                  <Text style={styles.codeValue}>{referralCode}</Text>
                  <Pressable onPress={handleCopyReferralCode} style={styles.copyButton}>
                    <Icon name={copiedCode ? 'check' : 'copy'} size={14} color={COLORS.surface} />
                    <Text style={styles.copyButtonText}>{copiedCode ? 'Copied!' : 'Copy'}</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.statsCard}>
                <View style={styles.statBlock}>
                  <Text style={styles.statLabel}>Successful Referrals</Text>
                  <Text style={styles.statValue}>{referralCount}</Text>
                </View>
                <View style={styles.statBlock}>
                  <Text style={styles.statLabel}>Total Earned</Text>
                  <Text style={styles.statValuePositive}>
                    ${totalEarned.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            <Pressable style={styles.shareButton} onPress={handleShareReferral}>
              <Text style={styles.shareButtonText}>Share Referral Code</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.card}>
            <View style={styles.emptyState}>
              <Icon name="gift" size={24} color={COLORS.subtleInk} />
              <Text style={styles.emptyStateText}>Your referral code is being generated...</Text>
            </View>
          </View>
        )}
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </Pressable>

      {/* Invite Member Modal */}
      <Modal
        visible={showInviteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite a Member</Text>
              <Pressable onPress={() => setShowInviteModal(false)} style={styles.modalClose}>
                <Icon name="x" size={20} color={COLORS.mutedInk} />
              </Pressable>
            </View>
            
            <Text style={styles.modalDescription}>
              Enter the email address of the person you'd like to invite to your household.
            </Text>
            
            <View style={styles.modalInputCard}>
              <View style={styles.modalInputRow}>
                <Icon name="mail" size={18} color={COLORS.subtleInk} />
                <TextInput
                  placeholder="Email address"
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.modalInput}
                  placeholderTextColor={COLORS.subtleInk}
                  editable={!isSendingInvite}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable 
                onPress={() => setShowInviteModal(false)} 
                style={styles.modalCancelButton}
                disabled={isSendingInvite}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable 
                onPress={handleSendInvite} 
                style={[styles.modalSendButton, isSendingInvite && styles.modalButtonDisabled]}
                disabled={isSendingInvite || !inviteEmail.trim()}
              >
                {isSendingInvite ? (
                  <ActivityIndicator size="small" color={COLORS.surface} />
                ) : (
                  <Text style={styles.modalSendText}>Send Invite</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Leave Household Warning Modal */}
      <Modal
        visible={showLeaveModal}
        transparent
        animationType="fade"
        onRequestClose={() => !isLeavingHousehold && setShowLeaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Disable Joint Account?</Text>
              <Pressable 
                onPress={() => setShowLeaveModal(false)} 
                style={styles.modalClose}
                disabled={isLeavingHousehold}
              >
                <Icon name="x" size={20} color={COLORS.mutedInk} />
              </Pressable>
            </View>
            
            <View style={styles.warningIconContainer}>
              <Icon name="alert-triangle" size={32} color={COLORS.danger} />
            </View>
            
            <Text style={styles.modalDescription}>
              Disabling your joint account will remove you from the household. You will no longer share data with other members.
            </Text>
            
            <Text style={styles.warningText}>
              This action cannot be undone.
            </Text>

            <View style={styles.modalActions}>
              <Pressable 
                onPress={() => setShowLeaveModal(false)} 
                style={styles.modalCancelButton}
                disabled={isLeavingHousehold}
              >
                <Text style={styles.modalCancelText}>Keep Enabled</Text>
              </Pressable>
              <Pressable 
                onPress={handleLeaveHousehold} 
                style={[styles.modalDangerButton, isLeavingHousehold && styles.modalButtonDisabled]}
                disabled={isLeavingHousehold}
              >
                {isLeavingHousehold ? (
                  <ActivityIndicator size="small" color={COLORS.surface} />
                ) : (
                  <Text style={styles.modalDangerText}>Disable</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
