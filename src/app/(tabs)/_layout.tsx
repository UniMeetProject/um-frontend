import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { Icon, accent, line, muted } from '@/components/campus';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: accent,
      tabBarInactiveTintColor: muted,
      tabBarLabelPosition: 'below-icon',
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: line, ...(Platform.OS === 'web' && { height: 60, paddingBottom: 6 }) },
      tabBarItemStyle: { borderRadius: 15, marginHorizontal: 4 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Gruppen', tabBarIcon: ({ focused }) => <Icon name="groups" color={focused ? accent : muted} /> }} />
      <Tabs.Screen name="kalender" options={{ title: 'Kalender', tabBarIcon: ({ focused }) => <Icon name="calendar" color={focused ? accent : muted} /> }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil', tabBarIcon: ({ focused }) => <Icon name="profile" color={focused ? accent : muted} /> }} />
    </Tabs>
  );
}
