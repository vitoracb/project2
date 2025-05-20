import React from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { TasksProvider } from '../context/TasksContext';
import { FinanceProvider } from '../context/FinanceContext';
import { EventsProvider } from '../context/EventsContext';
import { DocumentsProvider } from '../context/DocumentsContext';
import { CommentsProvider } from '../context/CommentsContext';
import { MembersProvider } from '../context/MembersContext';
import { CategoriesProvider } from '../context/CategoriesContext';

// Componente para gerenciar a autenticação
function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || typeof isSignedIn !== 'boolean') return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isSignedIn && !inAuthGroup) {
      router.replace('/login');
    } else if (isSignedIn && inAuthGroup) {
      router.replace('/home');
    }
  }, [isLoaded, isSignedIn, segments]);

  return <>{children}</>;
}

export default function RootLayoutNav() {
  return (
    <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <AuthProvider>
        <MembersProvider>
          <CategoriesProvider>
            <CommentsProvider>
              <DocumentsProvider>
                <EventsProvider>
                  <TasksProvider>
                    <FinanceProvider>
                      <Slot />
                    </FinanceProvider>
                  </TasksProvider>
                </EventsProvider>
              </DocumentsProvider>
            </CommentsProvider>
          </CategoriesProvider>
        </MembersProvider>
      </AuthProvider>
    </ClerkProvider>
  );
}