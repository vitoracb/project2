import { TasksProvider } from './context/TasksContext';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { FinanceProvider } from './context/FinanceContext';
import { EventsProvider } from './context/EventsContext';
import { DocumentsProvider } from './context/DocumentsContext';
import { Tabs } from 'expo-router';
import { CommentsProvider } from './context/CommentsContext';
import { MembersProvider } from './context/MembersContext';
import { CategoriesProvider } from './context/CategoriesContext';


export default function RootLayout() {
  useFrameworkReady();

  return (
    <MembersProvider>
      <CategoriesProvider>
        <CommentsProvider>
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
        </CommentsProvider>
      </CategoriesProvider>
    </MembersProvider>
  );
}