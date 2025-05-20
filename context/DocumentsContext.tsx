import React, { createContext, useContext, useState, ReactNode } from 'react';

export type DocumentCategory = 'DEED' | 'MAP' | 'CERTIFICATE' | 'RECEIPT' | 'OTHER';

export interface Document {
  id: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  uploader: {
    id: string;
    name: string;
  };
}

const mockDocuments: Document[] = [
  // Nenhum documento mockado
];

interface DocumentsContextProps {
  documents: Document[];
  addDocument: (doc: Document) => void;
  removeDocument: (id: string) => void;
}

const DocumentsContext = createContext<DocumentsContextProps | undefined>(undefined);

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);

  const addDocument = (doc: Document) => {
    setDocuments(prev => [doc, ...prev]);
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  return (
    <DocumentsContext.Provider value={{ documents, addDocument, removeDocument }}>
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentsContext);
  if (!context) throw new Error('useDocuments must be used within a DocumentsProvider');
  return context;
} 