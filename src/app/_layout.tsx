import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { DemoDataProvider } from '@/lib/demo-state';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <DemoDataProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="group/create"
            options={{ presentation: 'modal', headerShown: true, title: 'Gruppe erstellen' }}
          />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </DemoDataProvider>
  );
}
