import { Tabs } from 'expo-router';
import React from 'react';
import { LayoutDashboard, HandCoins, TrendingUp, User } from 'lucide-react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const activeColor = theme === 'light' ? '#000000' : '#FFFFFF';
  const inactiveColor = theme === 'light' ? '#888888' : '#777777';
  const backgroundColor = theme === 'light' ? '#FFFFFF' : '#000000';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: true,
        headerStyle: {
          backgroundColor: backgroundColor,
        },
        headerTitleStyle: {
          fontFamily: 'Bentham_400Regular',
          color: activeColor,
        },
        tabBarStyle: {
          backgroundColor: backgroundColor,
          borderTopColor: theme === 'light' ? '#EEEEEE' : '#222222',
        },
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontFamily: 'Bentham_400Regular',
          fontSize: 12,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="loans"
        options={{
          title: 'Loans',
          tabBarIcon: ({ color, size }) => <HandCoins size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="invest"
        options={{
          title: 'Invest',
          tabBarIcon: ({ color, size }) => <TrendingUp size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
