/**
 * Main bottom tab navigation.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeScreen } from '@/screens/home';
import { DiscoverScreen } from '@/screens/discover';
import { AccountsScreen } from '@/screens/accounts';
import { AssistantScreen } from '@/screens/assistant';
import { ProfileScreen } from '@/screens/profile';
import { Icon } from '@/components/Icon';
import { COLORS } from '@/theme/colors';
import { RADIUS } from '@/theme/layout';
import { FEATURE_FLAGS } from '@/lib/constants';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<string, string> = {
  Home: 'home',
  Discover: 'search',
  Accounts: 'wallet',
  ...(FEATURE_FLAGS.assistant ? { Assistant: 'messageCircle' } : {}),
  Profile: 'grid',
};

interface TabIconProps {
  name: string;
  focused: boolean;
}

function TabIcon({ name, focused }: TabIconProps) {
  const iconName = ICONS[name] ?? 'circle';
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Icon name={iconName} size={20} color={focused ? COLORS.surface : COLORS.ink} strokeWidth={2.25} />
    </View>
  );
}

export function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [styles.tabBar, { paddingBottom: 8 + insets.bottom, height: 70 + insets.bottom }],
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Accounts" component={AccountsScreen} />
      {FEATURE_FLAGS.assistant ? <Tab.Screen name="Assistant" component={AssistantScreen} /> : null}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    paddingBottom: 8,
    height: 70,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: COLORS.ink,
  },
});
