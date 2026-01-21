/**
 * Notifications modal component with Accept/Decline actions for household invites.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Icon } from './Icon';
import { COLORS } from '@/theme/colors';
import { RADIUS, SPACING } from '@/theme/layout';
import { ApiClientError } from '@/services/api';
import {
  acceptHouseholdInvite,
  declineHouseholdInvite,
  getNotifications,
  markNotificationAsRead,
  type Notification,
} from '@/services/notifications';
import { useHousehold } from '@/hooks/useHousehold';
import { formatTime } from '@/lib/format';

type NotificationsModalProps = {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onNotificationsChange?: () => void;
};

export function NotificationsModal({ visible, onClose, onNotificationsChange }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { refetch: refetchHousehold } = useHousehold();

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible, loadNotifications]);

  const handleAccept = async (notification: Notification) => {
    const inviteToken = notification.data?.inviteToken;
    if (!inviteToken) {
      Alert.alert('Error', 'Invalid invite');
      return;
    }

    setProcessingIds((prev) => new Set(prev).add(notification.id));
    try {
      await acceptHouseholdInvite(inviteToken);
      await markNotificationAsRead(notification.id);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, readAt: new Date().toISOString() } : n))
      );

      // Refetch household to update the household context
      await refetchHousehold();

      Alert.alert('Success', `You have joined "${notification.data?.householdName || 'the household'}"!`);
      onNotificationsChange?.();
    } catch (error) {
      if (error instanceof ApiClientError) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to accept invite. Please try again.');
      }
      console.error('Accept invite error:', error);
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(notification.id);
        return next;
      });
    }
  };

  const handleDecline = async (notification: Notification) => {
    const inviteToken = notification.data?.inviteToken;
    if (!inviteToken) {
      Alert.alert('Error', 'Invalid invite');
      return;
    }

    Alert.alert(
      'Decline Invite',
      `Are you sure you want to decline the invite to "${notification.data?.householdName || 'this household'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setProcessingIds((prev) => new Set(prev).add(notification.id));
            try {
              await declineHouseholdInvite(inviteToken);
              await markNotificationAsRead(notification.id);

              // Update local state
              setNotifications((prev) =>
                prev.map((n) => (n.id === notification.id ? { ...n, readAt: new Date().toISOString() } : n))
              );

              onNotificationsChange?.();
            } catch (error) {
              if (error instanceof ApiClientError) {
                Alert.alert('Error', error.message);
              } else {
                Alert.alert('Error', 'Failed to decline invite. Please try again.');
              }
              console.error('Decline invite error:', error);
            } finally {
              setProcessingIds((prev) => {
                const next = new Set(prev);
                next.delete(notification.id);
                return next;
              });
            }
          },
        },
      ]
    );
  };

  const renderNotification = (notification: Notification) => {
    const isHouseholdInvite = notification.type === 'household_invite';
    const isRead = !!notification.readAt;
    const isProcessing = processingIds.has(notification.id);

    return (
      <View
        key={notification.id}
        style={[styles.notificationItem, !isRead && styles.notificationItemUnread]}
      >
        <View style={styles.notificationIcon}>
          <Icon
            name={isHouseholdInvite ? 'users' : 'bell'}
            size={18}
            color={isHouseholdInvite ? COLORS.accentPurple : COLORS.subtleInk}
          />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <Text style={styles.notificationTime}>{formatTime(notification.createdAt)}</Text>
          </View>
          <Text style={styles.notificationBody}>{notification.body}</Text>

          {isHouseholdInvite && !isRead && (
            <View style={styles.notificationActions}>
              <Pressable
                style={[styles.actionButton, styles.declineButton]}
                onPress={() => handleDecline(notification)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color={COLORS.danger} />
                ) : (
                  <Text style={styles.declineButtonText}>Decline</Text>
                )}
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAccept(notification)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color={COLORS.surface} />
                ) : (
                  <Text style={styles.acceptButtonText}>Accept</Text>
                )}
              </Pressable>
            </View>
          )}

          {isHouseholdInvite && isRead && (
            <View style={styles.statusBadge}>
              <Icon name="check" size={12} color={COLORS.success} />
              <Text style={styles.statusText}>Responded</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const unreadNotifications = notifications.filter((n) => !n.readAt);
  const readNotifications = notifications.filter((n) => n.readAt);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Icon name="x" size={20} color={COLORS.mutedInk} />
            </Pressable>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.ink} />
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="bell" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {unreadNotifications.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>New</Text>
                  {unreadNotifications.map(renderNotification)}
                </>
              )}

              {readNotifications.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Earlier</Text>
                  {readNotifications.map(renderNotification)}
                </>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    maxHeight: '85%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.ink,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.subtleInk,
  },
  list: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.subtleInk,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  notificationItemUnread: {
    backgroundColor: '#f0f9ff',
    marginHorizontal: -SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    borderBottomWidth: 0,
    marginBottom: SPACING.sm,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.ink,
  },
  notificationTime: {
    fontSize: 11,
    color: COLORS.subtleInk,
  },
  notificationBody: {
    fontSize: 13,
    color: COLORS.mutedInk,
    lineHeight: 18,
  },
  notificationActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  acceptButton: {
    backgroundColor: COLORS.ink,
  },
  acceptButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.surface,
  },
  declineButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  declineButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  statusText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '500',
  },
});
