import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Member {
  id: string;
  name: string;
}

interface MembersContextProps {
  members: Member[];
  addMember: (member: Member) => void;
  removeMember: (id: string) => void;
}

const MembersContext = createContext<MembersContextProps | undefined>(undefined);

export function MembersProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([
    { id: '1', name: 'Vitor e Bárbara' },
    { id: '2', name: 'Sílvia' },
    { id: '3', name: 'Lucas e Maeve' },
    { id: '4', name: 'Dery' },
    { id: '5', name: 'Kim' },
    { id: '6', name: 'Ana e Luke' },
    { id: '7', name: 'Rodrigo' },
  ]);

  const addMember = (member: Member) => {
    setMembers(prev => [member, ...prev]);
  };

  const removeMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  return (
    <MembersContext.Provider value={{ members, addMember, removeMember }}>
      {children}
    </MembersContext.Provider>
  );
}

export function useMembers() {
  const context = useContext(MembersContext);
  if (!context) throw new Error('useMembers must be used within a MembersProvider');
  return context;
} 