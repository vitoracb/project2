import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { DollarSign, Calendar, CircleCheck as CheckCircle2, Circle as XCircle, Trash2 } from 'lucide-react-native';

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

interface ExpenseCardProps {
  expense: Expense;
  onPress?: () => void;
  onDelete?: (id: string) => void;
}

export function ExpenseCard({ expense, onPress, onDelete }: ExpenseCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Detecta se é uma "parcela virtual" (menu mensal)
  const isInstallment = typeof expense.installmentIndex === 'number' && typeof expense.installmentTotal === 'number';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <DollarSign size={20} color="#2D6A4F" />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {expense.title}
              {isInstallment ? `  ${expense.installmentIndex}/${expense.installmentTotal}` : ''}
            </Text>
            {expense.category && (
              <Text style={styles.category}>{expense.category}</Text>
            )}
          </View>
          <View style={styles.actionsRight}>
            {onDelete && (
              <TouchableOpacity
                style={styles.trashButton}
                onPress={() => onDelete(expense.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Trash2 size={20} color="#DC2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {expense.description && (
          <Text style={styles.description} numberOfLines={2}>
            {expense.description}
          </Text>
        )}
        {/* Forma de pagamento */}
        {expense.paymentMethod && (
          <Text style={styles.description} numberOfLines={2}>
            Forma de pagamento: {expense.paymentMethod}
            {expense.paymentMethod === 'Cartão de Crédito' && expense.installments && !isInstallment ? ` (${expense.installments}x)` : ''}
          </Text>
        )}
        <View style={styles.footer}>
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>{formatCurrency(isInstallment ? expense.amount : expense.amount)}</Text>
            <View style={styles.dateContainer}>
              <Calendar size={12} color="#6C584C" />
              <Text style={styles.date}>{formatDate(expense.date)}</Text>
            </View>
          </View>
          <Text style={styles.userText}>por {expense.user.name}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#E8F4EA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  category: {
    fontSize: 12,
    color: '#6C584C',
  },
  badge: {
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  amountContainer: {
    flex: 1,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D6A4F',
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#6C584C',
    marginLeft: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  paidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paidText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    marginLeft: 4,
  },
  unpaidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  unpaidText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
    marginLeft: 4,
  },
  userText: {
    fontSize: 12,
    color: '#6C584C',
  },
  trashButton: {
    marginLeft: 12,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
});