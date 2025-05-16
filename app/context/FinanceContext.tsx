import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  date: string;
  category?: string;
  isPaid: boolean;
  paymentMethod?: string;
  installments?: string;
  receipt?: string;
  user: {
    id: string;
    name: string;
  };
  installmentIndex?: number;
  installmentTotal?: number;
}

export interface Income {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  paidMembers?: string[];
  // outros campos se necessário
}

interface FinanceContextProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  incomes: Income[];
  setIncomes: React.Dispatch<React.SetStateAction<Income[]>>;
}

const FinanceContext = createContext<FinanceContextProps | undefined>(undefined);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);

  return (
    <FinanceContext.Provider value={{ expenses, setExpenses, incomes, setIncomes }}>
      {children}
    </FinanceContext.Provider>
  );
};

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de um FinanceProvider');
  }
  return context;
} 