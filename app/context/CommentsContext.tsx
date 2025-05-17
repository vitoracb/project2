import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Comment {
  id: string;
  content: string;
  attachments: string[];
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  parentId?: string;
}

interface CommentsContextProps {
  comments: Comment[];
  addComment: (comment: Comment) => void;
  removeComment: (id: string) => void;
}

const CommentsContext = createContext<CommentsContextProps | undefined>(undefined);

export function CommentsProvider({ children }: { children: ReactNode }) {
  const [comments, setComments] = useState<Comment[]>([]);

  const addComment = (comment: Comment) => {
    setComments(prev => [comment, ...prev]);
  };

  const removeComment = (id: string) => {
    setComments(prev => prev.filter(c => c.id !== id && c.parentId !== id));
  };

  return (
    <CommentsContext.Provider value={{ comments, addComment, removeComment }}>
      {children}
    </CommentsContext.Provider>
  );
}

export function useComments() {
  const context = useContext(CommentsContext);
  if (!context) throw new Error('useComments must be used within a CommentsProvider');
  return context;
} 