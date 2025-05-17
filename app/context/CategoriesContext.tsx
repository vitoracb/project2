import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Category {
  id: string;
  name: string;
}

interface CategoriesContextProps {
  categories: Category[];
  addCategory: (category: Category) => void;
  removeCategory: (id: string) => void;
}

const CategoriesContext = createContext<CategoriesContextProps | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Funcionário' },
    { id: '2', name: 'Insumos' },
    { id: '3', name: 'Infraestrutura' },
    { id: '4', name: 'Maquinário' },
    { id: '5', name: 'Mão de Obra' },
    { id: '6', name: 'E-Social' },
    { id: '7', name: 'Outros' },
  ]);

  const addCategory = (category: Category) => {
    setCategories(prev => [category, ...prev]);
  };

  const removeCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <CategoriesContext.Provider value={{ categories, addCategory, removeCategory }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) throw new Error('useCategories must be used within a CategoriesProvider');
  return context;
} 