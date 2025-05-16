import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { FinanceProvider } from './context/FinanceContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <FinanceProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </FinanceProvider>
  );
}
