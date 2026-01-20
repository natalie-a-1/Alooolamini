/**
 * Main bottom tab navigation.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home } from '../components/Home';
import { Discover } from '../components/Discover';
import { Available } from '../components/Available';
import { Spending } from '../components/Spending';
import { Profile } from '../components/Profile';
import { Icon } from '../components/Icon';
import { COLORS } from '../theme/colors';
import { RADIUS } from '../theme/layout';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<string, string> = {
  Home: 'home',
  Discover: 'search',
  Available: 'wallet',
  Spending: 'creditCard',
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
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Discover" component={Discover} />
      <Tab.Screen name="Available" component={Available} />
      <Tab.Screen name="Spending" component={Spending} />
      <Tab.Screen name="Profile" component={Profile} />
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
