import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { paper } from '@/components/campus';
import { DemoDataProvider } from '@/lib/demo-state';

export default function RootLayout() {
  return (
    <DemoDataProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: paper } }} />
      <StatusBar style="dark" />
    </DemoDataProvider>
  );
}
