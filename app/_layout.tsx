import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot } from 'expo-router';
import { TasksProvider } from './context/TasksContext';
import { FinanceProvider } from './context/FinanceContext';
import { EventsProvider } from './context/EventsContext';
import { DocumentsProvider } from './context/DocumentsContext';
import { CommentsProvider } from './context/CommentsContext';
import { MembersProvider } from './context/MembersContext';
import { CategoriesProvider } from './context/CategoriesContext';

export default function RootLayoutNav() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
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
    </ClerkProvider>
  );
}