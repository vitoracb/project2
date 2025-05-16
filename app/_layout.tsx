import { TasksProvider } from './context/TasksContext';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { FinanceProvider } from './context/FinanceContext';
import { EventsProvider } from './context/EventsContext';
import { DocumentsProvider } from './context/DocumentsContext';
import { Tabs } from 'expo-router';


export default function RootLayout() {
  useFrameworkReady();

  return (
    <DocumentsProvider>
      <EventsProvider>
        <TasksProvider>
          <FinanceProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </FinanceProvider>
        </TasksProvider>
      </EventsProvider>
    </DocumentsProvider>
  );
}