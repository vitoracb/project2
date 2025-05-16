import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Event {
  id: string;
  date: string; // formato YYYY-MM-DD
  title: string;
}

interface EventsContextProps {
  events: Event[];
  addEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
}

const EventsContext = createContext<EventsContextProps | undefined>(undefined);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);

  const addEvent = (event: Event) => {
    console.log('addEvent chamado:', event);
    setEvents(prev => [event, ...prev]);
  };

  const deleteEvent = (id: string) => {
    console.log('deleteEvent chamado:', id);
    setEvents(prev => prev.filter(ev => ev.id !== id));
  };

  return (
    <EventsContext.Provider value={{ events, addEvent, deleteEvent }}>
      {children}
    </EventsContext.Provider>
  );
};

export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) throw new Error('useEvents must be used within an EventsProvider');
  return context;
} 