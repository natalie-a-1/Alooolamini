/**
 * Header for the Home screen showing the title and notifications button.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { styles } from '../HomeScreen.styles';

type HomeHeaderProps = {
  unreadCount: number;
  onPressNotifications: () => void;
};

export function HomeHeader({ unreadCount, onPressNotifications }: HomeHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Invest</Text>
      <Pressable style={styles.iconButton} onPress={onPressNotifications}>
        <Icon name="bell" size={18} color={COLORS.ink} />
        {unreadCount > 0 ? (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
