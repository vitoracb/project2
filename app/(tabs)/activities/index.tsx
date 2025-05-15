import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView, SceneMap } from 'react-native-tab-view';
import { ExpenseCard, Expense, ExpenseType } from '@/components/expenses/ExpenseCard';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react-native';

// Mock data for expenses
const mockExpenses: Expense[] = [
  {
    id: '1',
    title: 'Tractor Maintenance',
    description: 'Annual service and oil change for the John Deere',
    amount: 450.75,
    date: '2025-05-10T10:30:00Z',
    type: 'GENERAL',
    category: 'Equipment',
    isPaid: true,
    paymentMethod: 'Credit Card',
    user: { id: '1', name: 'John Smith' }
  },
  {
    id: '2',
    title: 'Seed Purchase',
    description: 'Winter wheat seeds for north field',
    amount: 1250.00,
    date: '2025-05-08T14:15:00Z',
    type: 'GENERAL',
    category: 'Crops',
    isPaid: true,
    paymentMethod: 'Bank Transfer',
    user: { id: '2', name: 'Anna Johnson' }
  },
  {
    id: '3',
    title: 'Property Tax',
    description: 'Quarterly property tax payment',
    amount: 2800.50,
    date: '2025-05-05T09:00:00Z',
    type: 'MONTHLY',
    category: 'Taxes',
    isPaid: false,
    user: { id: '1', name: 'John Smith' }
  },
  {
    id: '4',
    title: 'Utility Bill',
    description: 'Electricity and water services',
    amount: 345.20,
    date: '2025-05-01T16:30:00Z',
    type: 'MONTHLY',
    category: 'Utilities',
    isPaid: true,
    paymentMethod: 'Bank Transfer',
    user: { id: '3', name: 'Robert Davis' }
  }
];

// Tab scenes
const ExpensesTab = () => {
  const [selectedType, setSelectedType] = useState<ExpenseType | 'ALL'>('ALL');
  
  const filteredExpenses = selectedType === 'ALL' 
    ? mockExpenses 
    : mockExpenses.filter(expense => expense.type === selectedType);
  
  return (
    <View style={styles.tabContainer}>
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, selectedType === 'ALL' && styles.activeFilterButton]} 
          onPress={() => setSelectedType('ALL')}
        >
          <Text style={[styles.filterText, selectedType === 'ALL' && styles.activeFilterText]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, selectedType === 'GENERAL' && styles.activeFilterButton]} 
          onPress={() => setSelectedType('GENERAL')}
        >
          <Text style={[styles.filterText, selectedType === 'GENERAL' && styles.activeFilterText]}>Geral</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, selectedType === 'MONTHLY' && styles.activeFilterButton]} 
          onPress={() => setSelectedType('MONTHLY')}
        >
          <Text style={[styles.filterText, selectedType === 'MONTHLY' && styles.activeFilterText]}>Mensal</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.headerContainer}>
        <Text style={styles.listTitle}>
          {selectedType === 'ALL' ? 'Todas as despesas' : 
           selectedType === 'GENERAL' ? 'Despesas gerais' : 'Despesas mensais'}
        </Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color="#2D6A4F" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExpenseCard expense={item} />}
        contentContainerStyle={styles.expensesList}
      />
    </View>
  );
};

const ClosingTab = () => (
  <View style={styles.tabContainer}>
    <Text style={styles.tabTitle}>Fechamento Anual</Text>
    <Text>Conteúdo da aba Fechamento Anual</Text>
  </View>
);

const FlowTab = () => (
  <View style={styles.tabContainer}>
    <Text style={styles.tabTitle}>Fluxo de Caixa</Text>
    <Text>Conteúdo da aba Fluxo de Caixa</Text>
  </View>
);

const ScheduleTab = () => (
  <View style={styles.tabContainer}>
    <Text style={styles.tabTitle}>Agenda</Text>
    <Text>Conteúdo da aba Agenda</Text>
  </View>
);

// Scene map for tab view
const renderScene = SceneMap({
  expenses: ExpensesTab,
  closing: ClosingTab,
  flow: FlowTab,
  schedule: ScheduleTab,
});

export default function ActivitiesScreen() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'expenses', title: 'Despesas' },
    { key: 'closing', title: 'Fechamento' },
    { key: 'flow', title: 'Fluxo' },
    { key: 'schedule', title: 'Agenda' },
  ]);

  // Custom tab bar
  const renderTabBar = (props: any) => {
    return (
      <View style={styles.tabBar}>
        {props.navigationState.routes.map((route: any, i: number) => {
          const isActive = index === i;
          return (
            <TouchableOpacity
              key={route.key}
              style={[styles.tabItem, isActive && styles.activeTabItem]}
              onPress={() => setIndex(i)}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {route.title}
              </Text>
              {isActive && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Atividades</Text>
      </View>
      
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={renderTabBar}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F9',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D6A4F',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    position: 'relative',
  },
  activeTabItem: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 14,
    color: '#6C584C',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2D6A4F',
    fontWeight: '600',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 3,
    backgroundColor: '#2D6A4F',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tabContainer: {
    flex: 1,
    backgroundColor: '#F5F7F9',
    padding: 16,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333333',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  activeFilterButton: {
    backgroundColor: '#E8F4EA',
    borderColor: '#2D6A4F',
  },
  filterText: {
    fontSize: 12,
    color: '#6C584C',
  },
  activeFilterText: {
    color: '#2D6A4F',
    fontWeight: '500',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F4EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expensesList: {
    paddingBottom: 20,
  },
});