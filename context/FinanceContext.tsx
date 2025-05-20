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

export interface Payment {
  id: string;
  title: string;
  amount: number;
  date: string;
  description?: string;
  user: {
    id: string;
    name: string;
  };
}

interface FinanceContextProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  incomes: Income[];
  setIncomes: React.Dispatch<React.SetStateAction<Income[]>>;
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  addPayment: (payment: Payment) => void;
}

const FinanceContext = createContext<FinanceContextProps | undefined>(undefined);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const addPayment = (payment: Payment) => {
    setPayments(prev => [payment, ...prev]);
  };

  return (
    <FinanceContext.Provider value={{ expenses, setExpenses, incomes, setIncomes, payments, setPayments, addPayment }}>
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