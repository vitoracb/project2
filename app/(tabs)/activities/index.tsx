import React, { useState, useEffect, type FC, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, TextInput, Platform, Pressable, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabView } from 'react-native-tab-view';
import { ExpenseCard, Expense } from '@/components/expenses/ExpenseCard';
import { Button } from '@/components/ui/Button';
import { Plus, Filter as FilterIcon, DollarSign, Trash2, Calendar } from 'lucide-react-native';
import { Calendar as ReactNativeCalendar, LocaleConfig } from 'react-native-calendars';
import { AntDesign } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useFinance } from '../../context/FinanceContext';
import { ScrollView as RNScrollView } from 'react-native';

// Mock data for expenses
const initialExpenses: Expense[] = [
  {
    id: '1',
    title: 'Tractor Maintenance',
    description: 'Annual service and oil change for the John Deere',
    amount: 450.75,
    date: '2025-05-10T10:30:00Z',
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
    category: 'Utilities',
    isPaid: true,
    paymentMethod: 'Bank Transfer',
    user: { id: '3', name: 'Robert Davis' }
  }
];

const EXPENSE_CATEGORIES = [
  'Funcionário',
  'Insumos',
  'Infraestrutura',
  'Maquinário',
  'Mão de Obra',
  'E-Social',
  'Outros',
];

const INCOME_CATEGORIES = [
  'Mensalidade',
  'Taxa extra',
  'E-Social',
  'Outros',
];

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Mock dos membros do grupo
const GROUP_MEMBERS = [
  'Vitor e Bárbara',
  'Sílvia',
  'Lucas e Maeve',
  'Dery',
  'Kim',
  'Ana e Luke',
  'Rodrigo',
];

// Scroll position state for FlowTab
const flowScrollYRef = { current: 0 };

const ExpensesTab: FC<{ expenses: Expense[]; setExpenses: React.Dispatch<React.SetStateAction<Expense[]>> }> = ({ expenses, setExpenses }) => {
  const [selectedType, setSelectedType] = useState<'GERAL' | 'MENSAL'>('GERAL');
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: EXPENSE_CATEGORIES[0],
    date: new Date(),
    showCategoryDropdown: false,
    description: '',
    paymentMethod: 'Dinheiro',
    installments: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [monthModal, setMonthModal] = useState<{month: number, year: number} | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    category: '',
    member: '',
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showCategoryDropdownFilter, setShowCategoryDropdownFilter] = useState(false);
  const [showMemberDropdownFilter, setShowMemberDropdownFilter] = useState(false);

  // Seletor de ano para filtro mensal
  const availableYears = Array.from(
    new Set(expenses.map(exp => new Date(exp.date).getFullYear()))
  ).sort((a, b) => b - a);
  const initialYear = availableYears.length > 0 ? availableYears[0] : 2025;
  const [selectedYear, setSelectedYear] = useState(initialYear);

  // Atualizar selectedYear quando availableYears mudar
  useEffect(() => {
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0] || 2025);
    }
  }, [availableYears]);

  // Para o filtro 'Mensal', agrupar despesas por mês do ano selecionado
  const monthlySums = (() => {
    if (selectedType !== 'MENSAL') return [];
    const map = new Map();
    expenses.forEach(exp => {
      // Se for parcelada
      if (exp.paymentMethod === 'Cartão de Crédito' && exp.installments && parseInt(exp.installments) > 1) {
        const total = parseInt(exp.installments);
        const baseDate = new Date(exp.date);
        for (let i = 0; i < total; i++) {
          // Calcular mês e ano da parcela corretamente
          const year = baseDate.getFullYear() + Math.floor((baseDate.getMonth() + i) / 12);
          const month = (baseDate.getMonth() + i) % 12;
          const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
          const day = Math.min(baseDate.getDate(), lastDayOfMonth);
          const d = new Date(year, month, day);
          if (d.getFullYear() === selectedYear) {
            const key = d.getMonth();
            if (!map.has(key)) {
              map.set(key, {
                year: selectedYear,
                month: key,
                total: 0,
              });
            }
            map.get(key).total += parseFloat((exp.amount / total).toFixed(2));
          }
        }
      } else {
        // Normal
        const d = new Date(exp.date);
        if (d.getFullYear() === selectedYear) {
          const key = d.getMonth();
          if (!map.has(key)) {
            map.set(key, {
              year: selectedYear,
              month: key,
              total: 0,
            });
          }
          map.get(key).total += exp.amount;
        }
      }
    });
    // Ordenar por mês decrescente
    return Array.from(map.values()).sort((a, b) => b.month - a.month);
  })();

  // Despesas do mês selecionado no modal
  const expensesOfMonth = monthModal
    ? expenses.flatMap(exp => {
        if (exp.paymentMethod === 'Cartão de Crédito' && exp.installments && parseInt(exp.installments) > 1) {
          const total = parseInt(exp.installments);
          const baseDate = new Date(exp.date);
          const originalDay = baseDate.getDate();
          const monthsDiff = (monthModal.year - baseDate.getFullYear()) * 12 + (monthModal.month - baseDate.getMonth());
          if (Number.isInteger(monthsDiff) && monthsDiff >= 0 && monthsDiff < total) {
            const year = baseDate.getFullYear() + Math.floor((baseDate.getMonth() + monthsDiff) / 12);
            const month = (baseDate.getMonth() + monthsDiff) % 12;
            const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
            const day = Math.min(originalDay, lastDayOfMonth);
            const d = new Date(year, month, day);
            if (d.getFullYear() === monthModal.year && d.getMonth() === monthModal.month) {
              return [{
                ...exp,
                amount: parseFloat((exp.amount / total).toFixed(2)),
                installmentIndex: monthsDiff + 1,
                installmentTotal: total,
                date: d.toISOString(),
              }];
            }
          }
          return [];
        } else {
          const d = new Date(exp.date);
          if (d.getFullYear() === monthModal.year && d.getMonth() === monthModal.month) {
            const { installmentIndex, installmentTotal, ...rest } = exp;
            return [{ ...rest }];
          }
          return [];
        }
      })
    : [];

  const handleDelete = (id: string) => {
    Alert.alert(
      'Excluir despesa',
      'Tem certeza que deseja excluir esta despesa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => {
            setExpenses(prev => prev.filter(exp => exp.id !== id));
          }
        },
      ]
    );
  };

  const handleSaveExpense = () => {
    if (!form.title.trim() || !form.amount.trim()) {
      Alert.alert('Preencha todos os campos obrigatórios!');
      return;
    }
    if (editingId) {
      setExpenses(prev => prev.map(exp =>
        exp.id === editingId
          ? { ...exp, title: form.title, amount: parseFloat(form.amount), category: form.category, date: form.date.toISOString(), description: form.description, paymentMethod: form.paymentMethod, installments: form.paymentMethod === 'Cartão de Crédito' ? form.installments : undefined }
          : exp
      ));
    } else {
      setExpenses(prev => [
        {
          id: Date.now().toString(),
          title: form.title,
          amount: parseFloat(form.amount),
          date: form.date.toISOString(),
          category: form.category,
          isPaid: false,
          user: { id: '1', name: 'Usuário' },
          description: form.description,
          paymentMethod: form.paymentMethod,
          installments: form.paymentMethod === 'Cartão de Crédito' ? form.installments : undefined,
        },
        ...prev,
      ]);
    }
    setModalVisible(false);
    setForm({ title: '', amount: '', category: EXPENSE_CATEGORIES[0], date: new Date(), showCategoryDropdown: false, description: '', paymentMethod: 'Dinheiro', installments: '' });
    setEditingId(null);
  };

  const handleEditExpense = (expense: Expense) => {
    setForm({
      title: expense.title,
      amount: String(expense.amount),
      category: expense.category || EXPENSE_CATEGORIES[0],
      date: new Date(expense.date),
      showCategoryDropdown: false,
      description: expense.description || '',
      paymentMethod: expense.paymentMethod || 'Dinheiro',
      installments: expense.installments ? String(expense.installments) : '',
    });
    setEditingId(expense.id);
    setModalVisible(true);
  };

  // Filtro de despesas
  const filteredExpenses = expenses.filter(exp => {
    const matchesName = !filters.name || exp.title.toLowerCase().includes(filters.name.toLowerCase());
    const matchesCategory = !filters.category || exp.category === filters.category;
    const matchesMember = !filters.member || (exp.user && exp.user.name === filters.member);
    const expDate = new Date(exp.date);
    const matchesStart = !filters.startDate || expDate >= filters.startDate;
    const matchesEnd = !filters.endDate || expDate <= filters.endDate;
    return matchesName && matchesCategory && matchesMember && matchesStart && matchesEnd;
  });
  
  // Verifica se algum filtro está ativo (para o botão de filtro)
  const isAnyFilterActive = !!(filters.name || filters.category || filters.member || filters.startDate || filters.endDate);

  // ExpensesTab: definir cor do botão e do ícone de filtro
  const filterButtonBg = isAnyFilterActive ? '#2D6A4F' : '#E8F4EA';
  const filterIconColor = isAnyFilterActive ? '#fff' : '#2D6A4F';

  return (
    <View style={styles.tabContainer}>
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, selectedType === 'GERAL' && styles.activeFilterButton]}
          onPress={() => setSelectedType('GERAL')}
        >
          <Text style={[styles.filterText, selectedType === 'GERAL' && styles.activeFilterText]}>Geral</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, selectedType === 'MENSAL' && styles.activeFilterButton]}
          onPress={() => setSelectedType('MENSAL')}
        >
          <Text style={[styles.filterText, selectedType === 'MENSAL' && styles.activeFilterText]}>Mensal</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.headerContainer}>
        <Text style={styles.listTitle}>
          {selectedType === 'GERAL' ? 'Despesas' : 'Despesas por mês'}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: filterButtonBg }]}
            onPress={() => setFilterModalVisible(true)}
          >
            <FilterIcon size={20} color={filterIconColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Plus size={20} color="#2D6A4F" />
          </TouchableOpacity>
        </View>
      </View>
      
      {selectedType === 'GERAL' && (
      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExpenseCard
              expense={item}
              onDelete={handleDelete}
              onPress={() => handleEditExpense(item)}
            />
          )}
        contentContainerStyle={styles.expensesList}
      />
      )}
      {selectedType === 'MENSAL' && (
        <View style={styles.monthlyList}>
          <View style={styles.yearSelector}>
            <TouchableOpacity
              onPress={() => {
                const idx = availableYears.indexOf(selectedYear);
                if (idx < availableYears.length - 1) setSelectedYear(availableYears[idx + 1]);
              }}
              disabled={availableYears.indexOf(selectedYear) === availableYears.length - 1}
              style={styles.yearButton}
            >
              <AntDesign name="left" size={20} color={availableYears.indexOf(selectedYear) === availableYears.length - 1 ? '#ccc' : '#2D6A4F'} />
            </TouchableOpacity>
            <Text style={styles.yearLabel}>{selectedYear}</Text>
            <TouchableOpacity
              onPress={() => {
                const idx = availableYears.indexOf(selectedYear);
                if (idx > 0) setSelectedYear(availableYears[idx - 1]);
              }}
              disabled={availableYears.indexOf(selectedYear) === 0}
              style={styles.yearButton}
            >
              <AntDesign name="right" size={20} color={availableYears.indexOf(selectedYear) === 0 ? '#ccc' : '#2D6A4F'} />
            </TouchableOpacity>
    </View>
          {monthlySums.length === 0 && (
            <Text style={{ textAlign: 'center', color: '#666', marginTop: 24 }}>Nenhuma despesa mensal encontrada.</Text>
          )}
          {monthlySums.map(({ year, month, total }) => (
            <TouchableOpacity
              key={`${year}-${month}`}
              style={styles.monthItem}
              onPress={() => setMonthModal({ month, year })}
            >
              <Text style={styles.monthLabel}>{MONTHS_PT[month]} {year}</Text>
              <Text style={styles.monthTotal}>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Adicionar Despesa</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome da despesa"
                value={form.title}
                onChangeText={text => setForm({ ...form, title: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Valor (ex: 100.00)"
                keyboardType="numeric"
                value={form.amount}
                onChangeText={text => setForm({ ...form, amount: text })}
              />
              <View style={styles.inputRow}>
                <Text style={styles.label}>Categoria:</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setForm({ ...form, showCategoryDropdown: !form.showCategoryDropdown })}
                >
                  <Text style={styles.dropdownButtonText}>{form.category}</Text>
                </TouchableOpacity>
  </View>
              {form.showCategoryDropdown && (
                <View style={styles.dropdownList}>
                  {EXPENSE_CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.dropdownItem,
                        form.category === cat && styles.dropdownItemSelected,
                      ]}
                      onPress={() => setForm({ ...form, category: cat, showCategoryDropdown: false })}
                    >
                      <Text style={{ color: form.category === cat ? '#2D6A4F' : '#333' }}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={styles.inputRow}>
                <Text style={styles.label}>Data:</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                  <Text style={styles.dateText}>{form.date.toLocaleDateString('pt-BR')}</Text>
                </TouchableOpacity>
              </View>
              {showDatePicker && (
                <View style={styles.calendarModal}>
                  <ReactNativeCalendar
                    onDayPress={day => {
                      const [year, month, dayNum] = day.dateString.split('-').map(Number);
                      setForm({ ...form, date: new Date(year, month - 1, dayNum) });
                      setShowDatePicker(false);
                    }}
                    markedDates={{
                      [form.date.toISOString().split('T')[0]]: {selected: true, selectedColor: '#2D6A4F'}
                    }}
                    theme={{
                      selectedDayBackgroundColor: '#2D6A4F',
                      todayTextColor: '#2D6A4F',
                    }}
                  />
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TextInput
                style={styles.input}
                placeholder="Observação (opcional)"
                value={form.description}
                onChangeText={text => setForm({ ...form, description: text })}
                multiline
              />
              <View style={styles.inputRow}>
                <Text style={styles.label}>Forma de pagamento:</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { minWidth: 120 }]}
                  onPress={() => setForm(f => ({ ...f, paymentMethod: f.paymentMethod === 'Dinheiro' ? 'Cartão de Crédito' : 'Dinheiro' }))}
                >
                  <Text style={styles.dropdownButtonText}>{form.paymentMethod}</Text>
                </TouchableOpacity>
              </View>
              {form.paymentMethod === 'Cartão de Crédito' && (
                <View style={styles.inputRow}>
                  <Text style={styles.label}>Parcelas:</Text>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="Quantidade de parcelas"
                    keyboardType="numeric"
                    value={form.installments}
                    onChangeText={text => setForm({ ...form, installments: text.replace(/[^0-9]/g, '') })}
                  />
                </View>
              )}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveExpense}>
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal de despesas do mês */}
      <Modal
        visible={!!monthModal}
        animationType="slide"
        transparent
        onRequestClose={() => setMonthModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}> 
            <Text style={styles.modalTitle}>
              Despesas de {monthModal ? `${MONTHS_PT[monthModal.month]} de ${monthModal.year}` : ''}
            </Text>
            {expensesOfMonth.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#666', marginTop: 24 }}>Nenhuma despesa encontrada.</Text>
            ) : (
              <FlatList
                data={expensesOfMonth}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <ExpenseCard
                    expense={item}
                    onDelete={handleDelete}
                    onPress={() => handleEditExpense(item)}
                  />
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}
            <TouchableOpacity style={styles.cancelButton} onPress={() => setMonthModal(null)}>
              <Text style={styles.cancelButtonText}>Fechar</Text>
            </TouchableOpacity>
  </View>
        </View>
      </Modal>

      {/* Modal de filtro */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrar Despesas</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da despesa"
              value={filters.name}
              onChangeText={text => setFilters(f => ({ ...f, name: text }))}
            />
            <View style={styles.inputRow}>
              <Text style={styles.label}>Categoria:</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowCategoryDropdownFilter(v => !v)}
              >
                <Text style={styles.dropdownButtonText}>{filters.category || 'Todas'}</Text>
              </TouchableOpacity>
            </View>
            {showCategoryDropdownFilter && (
              <View style={styles.dropdownList}>
                {EXPENSE_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.dropdownItem,
                      filters.category === cat && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setFilters(f => ({ ...f, category: cat }));
                      setShowCategoryDropdownFilter(false);
                    }}
                  >
                    <Text style={{ color: filters.category === cat ? '#2D6A4F' : '#333' }}>{cat}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFilters(f => ({ ...f, category: '' }));
                    setShowCategoryDropdownFilter(false);
                  }}
                >
                  <Text style={{ color: '#333' }}>Todas</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
              <Text style={styles.label}>Membro:</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowMemberDropdownFilter(v => !v)}
              >
                <Text style={styles.dropdownButtonText}>{filters.member || 'Selecionar membro'}</Text>
              </TouchableOpacity>
            </View>
            {showMemberDropdownFilter && (
              <View style={styles.dropdownList}>
                {GROUP_MEMBERS.map(member => (
                  <TouchableOpacity
                    key={member}
                    style={[
                      styles.dropdownItem,
                      filters.member === member && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setFilters(f => ({ ...f, member }));
                      setShowMemberDropdownFilter(false);
                    }}
                  >
                    <Text style={{ color: filters.member === member ? '#2D6A4F' : '#333' }}>{member}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFilters(f => ({ ...f, member: '' }));
                    setShowMemberDropdownFilter(false);
                  }}
                >
                  <Text style={{ color: '#333' }}>Todos</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
              <Text style={styles.label}>Data início:</Text>
              <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateButton}>
                <Text style={styles.dateText}>{filters.startDate ? filters.startDate.toLocaleDateString('pt-BR') : 'Qualquer'}</Text>
              </TouchableOpacity>
            </View>
            {showStartDatePicker && (
              <View style={styles.calendarModal}>
                <ReactNativeCalendar
                  onDayPress={day => {
                    const [year, month, dayNum] = day.dateString.split('-').map(Number);
                    setFilters(f => ({ ...f, startDate: new Date(year, month - 1, dayNum) }));
                    setShowStartDatePicker(false);
                  }}
                  markedDates={filters.startDate ? { [filters.startDate.toISOString().split('T')[0]]: {selected: true, selectedColor: '#2D6A4F'} } : {}}
                  theme={{ selectedDayBackgroundColor: '#2D6A4F', todayTextColor: '#2D6A4F' }}
                />
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowStartDatePicker(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
              <Text style={styles.label}>Data final:</Text>
              <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dateButton}>
                <Text style={styles.dateText}>{filters.endDate ? filters.endDate.toLocaleDateString('pt-BR') : 'Qualquer'}</Text>
              </TouchableOpacity>
            </View>
            {showEndDatePicker && (
              <View style={styles.calendarModal}>
                <ReactNativeCalendar
                  onDayPress={day => {
                    const [year, month, dayNum] = day.dateString.split('-').map(Number);
                    setFilters(f => ({ ...f, endDate: new Date(year, month - 1, dayNum) }));
                    setShowEndDatePicker(false);
                  }}
                  markedDates={filters.endDate ? { [filters.endDate.toISOString().split('T')[0]]: {selected: true, selectedColor: '#2D6A4F'} } : {}}
                  theme={{ selectedDayBackgroundColor: '#2D6A4F', todayTextColor: '#2D6A4F' }}
                />
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEndDatePicker(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => {
                setFilters({ name: '', startDate: null, endDate: null, category: '', member: '' });
                setFilterModalVisible(false);
              }}>
                <Text style={styles.cancelButtonText}>Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.saveButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
  </View>
);
};

const IncomesTab: FC<{ incomes: any[]; setIncomes: React.Dispatch<React.SetStateAction<any[]>> }> = ({ incomes, setIncomes }) => {
  const [selectedType, setSelectedType] = useState<'GERAL' | 'MENSAL'>('GERAL');
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: INCOME_CATEGORIES[0],
    date: new Date(),
    description: '',
    paidMembers: [] as string[],
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMembersDropdown, setShowMembersDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [monthModal, setMonthModal] = useState<{month: number, year: number} | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    category: '',
    member: '',
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showCategoryDropdownFilter, setShowCategoryDropdownFilter] = useState(false);
  const [showMemberDropdownFilter, setShowMemberDropdownFilter] = useState(false);

  const isAnyFilterActive = !!(filters.name || filters.category || filters.member || filters.startDate || filters.endDate);
  const filterButtonBgIncomes = isAnyFilterActive ? '#2D6A4F' : '#E8F4EA';
  const filterIconColorIncomes = isAnyFilterActive ? '#fff' : '#2D6A4F';

  // Agrupamento mensal igual ao de despesas
  const availableYears = Array.from(
    new Set(incomes.map(inc => new Date(inc.date).getFullYear()))
  ).sort((a, b) => b - a);
  const initialYear = availableYears.length > 0 ? availableYears[0] : new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(initialYear);
  useEffect(() => {
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0] || new Date().getFullYear());
    }
  }, [availableYears]);

  const monthlySums = (() => {
    if (selectedType !== 'MENSAL') return [];
    const map = new Map();
    incomes.forEach(inc => {
      const d = new Date(inc.date);
      if (d.getFullYear() === selectedYear) {
        const key = d.getMonth();
        if (!map.has(key)) {
          map.set(key, {
            year: selectedYear,
            month: key,
            total: 0,
          });
        }
        map.get(key).total += inc.amount;
      }
    });
    return Array.from(map.values()).sort((a, b) => b.month - a.month);
  })();

  const incomesOfMonth = monthModal
    ? incomes.filter(inc => {
        const d = new Date(inc.date);
        return d.getFullYear() === monthModal.year && d.getMonth() === monthModal.month;
      })
    : [];

  // Filtro de receitas (pode ser expandido depois)
  const filteredIncomes = incomes.filter(inc => {
    const matchesName = !filters.name || (inc.title && inc.title.toLowerCase().includes(filters.name.toLowerCase()));
    const matchesCategory = !filters.category || inc.category === filters.category;
    const matchesMember = !filters.member || (inc.paidMembers && inc.paidMembers[0] === filters.member);
    const incDate = new Date(inc.date);
    const matchesStart = !filters.startDate || incDate >= filters.startDate;
    const matchesEnd = !filters.endDate || incDate <= filters.endDate;
    return matchesName && matchesCategory && matchesMember && matchesStart && matchesEnd;
  });

  const { addPayment } = useFinance();

  const handleSaveIncome = () => {
    if (!form.paidMembers[0] || !form.amount.trim()) {
      Alert.alert('Preencha todos os campos obrigatórios!');
      return;
    }
    setIncomes(prev => [
      {
        id: Date.now().toString(),
        title: form.title,
        amount: parseFloat(form.amount),
        category: form.category,
        date: form.date.toISOString(),
        description: form.description,
        paidMembers: form.paidMembers,
      },
      ...prev,
    ]);
    addPayment({
      id: Date.now().toString(),
      title: form.category,
      amount: parseFloat(form.amount),
      date: form.date.toISOString(),
      description: form.description,
      user: { id: '1', name: form.paidMembers[0] },
    });
    setModalVisible(false);
    setForm({ title: '', amount: '', category: INCOME_CATEGORIES[0], date: new Date(), description: '', paidMembers: [] });
  };

  const toggleMemberPaid = (incomeId: string, member: string) => {
    setIncomes(prev => prev.map(inc =>
      inc.id === incomeId
        ? {
            ...inc,
            paidMembers: inc.paidMembers.includes(member)
              ? inc.paidMembers.filter((m: string) => m !== member)
              : [...inc.paidMembers, member],
          }
        : inc
    ));
  };

  const handleDeleteIncome = (id: string) => {
    Alert.alert(
      'Excluir receita',
      'Tem certeza que deseja excluir esta receita?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => {
            setIncomes(prev => prev.filter(inc => inc.id !== id));
          }
        },
      ]
    );
  };

  // IncomeCard padronizado igual ao ExpenseCard
  interface IncomeCardProps {
    income: any;
    onDelete?: (id: string) => void;
    onPress?: () => void;
  }
  const IncomeCard = ({ income, onDelete, onPress }: IncomeCardProps) => {
    const formatCurrency = (amount: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric' });
    };
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Card style={styles.incomeCard}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <DollarSign size={20} color="#2D6A4F" />
              </View>
            </View>
            <Text style={styles.categoryTop}>{income.category}</Text>
            {onDelete && (
              <TouchableOpacity
                style={styles.trashButton}
                onPress={() => onDelete(income.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Trash2 size={20} color="#DC2626" />
              </TouchableOpacity>
            )}
          </View>
          {income.title && (
            <Text style={styles.title}>{income.title}</Text>
          )}
          {income.description && (
            <Text style={styles.description} numberOfLines={2}>{income.description}</Text>
          )}
          <View style={styles.footer}>
            <View style={styles.amountContainer}>
              <Text style={styles.amount}>{formatCurrency(income.amount)}</Text>
              <View style={styles.dateContainer}>
                <Calendar size={12} color="#6C584C" />
                <Text style={styles.date}>{formatDate(income.date)}</Text>
              </View>
            </View>
            <Text style={styles.userText}>por {income.paidMembers[0]}</Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

          return (
    <View style={styles.tabContainer}>
      {/* Submenu Geral/Mensal */}
      <View style={styles.filterContainer}>
            <TouchableOpacity
          style={[styles.filterButton, selectedType === 'GERAL' && styles.activeFilterButton]}
          onPress={() => setSelectedType('GERAL')}
        >
          <Text style={[styles.filterText, selectedType === 'GERAL' && styles.activeFilterText]}>Geral</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedType === 'MENSAL' && styles.activeFilterButton]}
          onPress={() => setSelectedType('MENSAL')}
        >
          <Text style={[styles.filterText, selectedType === 'MENSAL' && styles.activeFilterText]}>Mensal</Text>
        </TouchableOpacity>
      </View>
      {/* Header e botão adicionar */}
      <View style={styles.headerContainer}>
        <Text style={styles.listTitle}>
          {selectedType === 'GERAL' ? 'Pagamentos' : 'Pagamentos por mês'}
              </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: filterButtonBgIncomes }]}
            onPress={() => setFilterModalVisible(true)}
          >
            <FilterIcon size={20} color={filterIconColorIncomes} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Plus size={20} color="#2D6A4F" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Lista Geral */}
      {selectedType === 'GERAL' && (
        <FlatList
          data={filteredIncomes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <IncomeCard income={item} onDelete={handleDeleteIncome} onPress={() => {}} />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
      {/* Lista Mensal */}
      {selectedType === 'MENSAL' && (
        <View style={styles.monthlyList}>
          <View style={styles.yearSelector}>
            <TouchableOpacity
              onPress={() => {
                const idx = availableYears.indexOf(selectedYear);
                if (idx < availableYears.length - 1) setSelectedYear(availableYears[idx + 1]);
              }}
              disabled={availableYears.indexOf(selectedYear) === availableYears.length - 1}
              style={styles.yearButton}
            >
              <AntDesign name="left" size={20} color={availableYears.indexOf(selectedYear) === availableYears.length - 1 ? '#ccc' : '#2D6A4F'} />
            </TouchableOpacity>
            <Text style={styles.yearLabel}>{selectedYear}</Text>
            <TouchableOpacity
              onPress={() => {
                const idx = availableYears.indexOf(selectedYear);
                if (idx > 0) setSelectedYear(availableYears[idx - 1]);
              }}
              disabled={availableYears.indexOf(selectedYear) === 0}
              style={styles.yearButton}
            >
              <AntDesign name="right" size={20} color={availableYears.indexOf(selectedYear) === 0 ? '#ccc' : '#2D6A4F'} />
            </TouchableOpacity>
          </View>
          {monthlySums.length === 0 && (
            <Text style={{ textAlign: 'center', color: '#666', marginTop: 24 }}>Nenhuma receita mensal encontrada.</Text>
          )}
          {monthlySums.map(({ year, month, total }) => (
            <TouchableOpacity
              key={`${year}-${month}`}
              style={styles.monthItem}
              onPress={() => setMonthModal({ month, year })}
            >
              <Text style={styles.monthLabel}>{MONTHS_PT[month]} {year}</Text>
              <Text style={styles.monthTotal}>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {/* Modal de receitas do mês */}
      <Modal
        visible={!!monthModal}
        animationType="slide"
        transparent
        onRequestClose={() => setMonthModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}> 
            <Text style={styles.modalTitle}>
              Receitas de {monthModal ? `${MONTHS_PT[monthModal.month]} de ${monthModal.year}` : ''}
            </Text>
            {incomesOfMonth.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#666', marginTop: 24 }}>Nenhuma receita encontrada.</Text>
            ) : (
              <FlatList
                data={incomesOfMonth}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <IncomeCard income={item} onDelete={handleDeleteIncome} onPress={() => {}} />
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}
            <TouchableOpacity style={styles.cancelButton} onPress={() => setMonthModal(null)}>
              <Text style={styles.cancelButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Adicionar Pagamento</Text>
              {/* Seleção de membros */}
              <View style={styles.inputRow}>
                <Text style={styles.label}>Membro:</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowMembersDropdown(v => !v)}
                >
                  <Text style={styles.dropdownButtonText}>
                    {form.paidMembers.length === 0 ? 'Selecione' : form.paidMembers[0]}
                  </Text>
                </TouchableOpacity>
              </View>
              {showMembersDropdown && (
                <View style={styles.dropdownList}>
                  {GROUP_MEMBERS.map(member => (
                    <TouchableOpacity
                      key={member}
                      style={[
                        styles.dropdownItem,
                        form.paidMembers[0] === member && styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        setForm(f => ({
                          ...f,
                          paidMembers: [member],
                        }));
                        setShowMembersDropdown(false);
                      }}
                    >
                      <Text style={{ color: form.paidMembers[0] === member ? '#2D6A4F' : '#333' }}>{member}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {/* Valor */}
              <TextInput
                style={styles.input}
                placeholder="Valor (ex: 100.00)"
                keyboardType="numeric"
                value={form.amount}
                onChangeText={text => setForm({ ...form, amount: text.replace(/[^0-9]/g, '') })}
              />
              {/* Data */}
              <View style={styles.inputRow}>
                <Text style={styles.label}>Data:</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                  <Text style={styles.dateText}>{form.date.toLocaleDateString('pt-BR')}</Text>
                </TouchableOpacity>
              </View>
              {showDatePicker && (
                <View style={styles.calendarModal}>
                  <ReactNativeCalendar
                    onDayPress={day => {
                      const [year, month, dayNum] = day.dateString.split('-').map(Number);
                      setForm({ ...form, date: new Date(year, month - 1, dayNum) });
                      setShowDatePicker(false);
                    }}
                    markedDates={{
                      [form.date.toISOString().split('T')[0]]: {selected: true, selectedColor: '#2D6A4F'}
                    }}
                    theme={{
                      selectedDayBackgroundColor: '#2D6A4F',
                      todayTextColor: '#2D6A4F',
                    }}
                  />
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              )}
              {/* Categoria */}
              <View style={styles.inputRow}>
                <Text style={styles.label}>Categoria:</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowCategoryDropdown(v => !v)}
                >
                  <Text style={styles.dropdownButtonText}>{form.category}</Text>
                </TouchableOpacity>
              </View>
              {showCategoryDropdown && (
                <View style={styles.dropdownList}>
                  {INCOME_CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.dropdownItem,
                        form.category === cat && styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        setForm({ ...form, category: cat });
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text style={{ color: form.category === cat ? '#2D6A4F' : '#333' }}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {/* Observação */}
              <TextInput
                style={styles.input}
                placeholder="Observação (opcional)"
                value={form.description}
                onChangeText={text => setForm({ ...form, description: text })}
                multiline
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveIncome}>
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Modal de filtro de pagamentos */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrar Pagamentos</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do pagamento"
              value={filters.name}
              onChangeText={text => setFilters(f => ({ ...f, name: text }))}
            />
            <View style={styles.inputRow}>
              <Text style={styles.label}>Categoria:</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowCategoryDropdownFilter(v => !v)}
              >
                <Text style={styles.dropdownButtonText}>{filters.category || 'Todas'}</Text>
              </TouchableOpacity>
            </View>
            {showCategoryDropdownFilter && (
              <View style={styles.dropdownList}>
                {INCOME_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.dropdownItem,
                      filters.category === cat && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setFilters(f => ({ ...f, category: cat }));
                      setShowCategoryDropdownFilter(false);
                    }}
                  >
                    <Text style={{ color: filters.category === cat ? '#2D6A4F' : '#333' }}>{cat}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFilters(f => ({ ...f, category: '' }));
                    setShowCategoryDropdownFilter(false);
                  }}
                >
                  <Text style={{ color: '#333' }}>Todas</Text>
                </TouchableOpacity>
              </View>
            )}
            {/* Filtro por membro */}
            <View style={styles.inputRow}>
              <Text style={styles.label}>Membro:</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowMemberDropdownFilter(v => !v)}
              >
                <Text style={styles.dropdownButtonText}>{filters.member || 'Selecionar membro'}</Text>
              </TouchableOpacity>
            </View>
            {showMemberDropdownFilter && (
              <View style={styles.dropdownList}>
                {GROUP_MEMBERS.map(member => (
                  <TouchableOpacity
                    key={member}
                    style={[
                      styles.dropdownItem,
                      filters.member === member && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      setFilters(f => ({ ...f, member }));
                      setShowMemberDropdownFilter(false);
                    }}
                  >
                    <Text style={{ color: filters.member === member ? '#2D6A4F' : '#333' }}>{member}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFilters(f => ({ ...f, member: '' }));
                    setShowMemberDropdownFilter(false);
                  }}
                >
                  <Text style={{ color: '#333' }}>Todos</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
              <Text style={styles.label}>Data início:</Text>
              <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateButton}>
                <Text style={styles.dateText}>{filters.startDate ? filters.startDate.toLocaleDateString('pt-BR') : 'Qualquer'}</Text>
              </TouchableOpacity>
            </View>
            {showStartDatePicker && (
              <View style={styles.calendarModal}>
                <ReactNativeCalendar
                  onDayPress={day => {
                    const [year, month, dayNum] = day.dateString.split('-').map(Number);
                    setFilters(f => ({ ...f, startDate: new Date(year, month - 1, dayNum) }));
                    setShowStartDatePicker(false);
                  }}
                  markedDates={filters.startDate ? { [filters.startDate.toISOString().split('T')[0]]: {selected: true, selectedColor: '#2D6A4F'} } : {}}
                  theme={{ selectedDayBackgroundColor: '#2D6A4F', todayTextColor: '#2D6A4F' }}
                />
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowStartDatePicker(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
              <Text style={styles.label}>Data final:</Text>
              <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dateButton}>
                <Text style={styles.dateText}>{filters.endDate ? filters.endDate.toLocaleDateString('pt-BR') : 'Qualquer'}</Text>
              </TouchableOpacity>
            </View>
            {showEndDatePicker && (
              <View style={styles.calendarModal}>
                <ReactNativeCalendar
                  onDayPress={day => {
                    const [year, month, dayNum] = day.dateString.split('-').map(Number);
                    setFilters(f => ({ ...f, endDate: new Date(year, month - 1, dayNum) }));
                    setShowEndDatePicker(false);
                  }}
                  markedDates={filters.endDate ? { [filters.endDate.toISOString().split('T')[0]]: {selected: true, selectedColor: '#2D6A4F'} } : {}}
                  theme={{ selectedDayBackgroundColor: '#2D6A4F', todayTextColor: '#2D6A4F' }}
                />
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEndDatePicker(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => {
                setFilters({ name: '', startDate: null, endDate: null, category: '', member: '' });
                setFilterModalVisible(false);
              }}>
                <Text style={styles.cancelButtonText}>Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.saveButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

interface FlowTabContentProps {
  mode: 'MENSAL' | 'ANUAL';
  setMode: React.Dispatch<React.SetStateAction<'MENSAL' | 'ANUAL'>>;
  selectedMonth: number;
  setSelectedMonth: React.Dispatch<React.SetStateAction<number>>;
  selectedYear: number;
  setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
  totalDespesas: number;
  totalReceitas: number;
  saldo: number;
  pieData: any[];
  barData: any;
  MONTHS_PT: string[];
  styles: any;
}

const FlowTabContent = React.memo(({
  mode,
  setMode,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  totalDespesas,
  totalReceitas,
  saldo,
  pieData,
  barData,
  MONTHS_PT,
  styles
}: FlowTabContentProps) => {
  const chartWidth = Dimensions.get('window').width - 32;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      {/* Alternância mensal/anual */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, mode === 'MENSAL' && styles.activeFilterButton]}
          onPress={() => setMode('MENSAL')}
        >
          <Text style={[styles.filterText, mode === 'MENSAL' && styles.activeFilterText]}>Mensal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, mode === 'ANUAL' && styles.activeFilterButton]}
          onPress={() => setMode('ANUAL')}
        >
          <Text style={[styles.filterText, mode === 'ANUAL' && styles.activeFilterText]}>Anual</Text>
        </TouchableOpacity>
      </View>
      {/* Título Fluxo de Caixa */}
      <Text style={{ fontSize: 22, fontWeight: '700', color: '#000', textAlign: 'left', alignSelf: 'flex-start', marginTop: 24, marginBottom: 24 }}>
        Fluxo de Caixa
      </Text>
      {/* Seleção de mês/ano ou só ano */}
      <View style={styles.yearSelector}>
        {mode === 'MENSAL' && (
          <>
            <TouchableOpacity onPress={() => setSelectedMonth(m => (m > 0 ? m - 1 : 11))} style={styles.yearButton}>
              <AntDesign name="left" size={20} color={selectedMonth === 0 ? '#ccc' : '#2D6A4F'} />
            </TouchableOpacity>
            <Text style={styles.yearLabel}>{MONTHS_PT[selectedMonth]}</Text>
            <TouchableOpacity onPress={() => setSelectedMonth(m => (m < 11 ? m + 1 : 0))} style={styles.yearButton}>
              <AntDesign name="right" size={20} color={selectedMonth === 11 ? '#ccc' : '#2D6A4F'} />
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity onPress={() => setSelectedYear(y => y - 1)} style={styles.yearButton}>
          <AntDesign name="left" size={20} color="#2D6A4F" />
        </TouchableOpacity>
        <Text style={styles.yearLabel}>{selectedYear}</Text>
        <TouchableOpacity onPress={() => setSelectedYear(y => y + 1)} style={styles.yearButton}>
          <AntDesign name="right" size={20} color="#2D6A4F" />
        </TouchableOpacity>
      </View>
      {/* Cards de somatório */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0, backgroundColor: '#F8D7DA', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#B02A37', fontWeight: '700', fontSize: 16 }}>Despesas</Text>
          <Text style={{ color: '#B02A37', fontWeight: '700', fontSize: 22, marginTop: 8 }} numberOfLines={1} ellipsizeMode="tail">{totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0, backgroundColor: '#D1E7DD', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#146C43', fontWeight: '700', fontSize: 16 }}>Receitas</Text>
          <Text style={{ color: '#146C43', fontWeight: '700', fontSize: 22, marginTop: 8 }} numberOfLines={1} ellipsizeMode="tail">{totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
        </View>
      </View>
      <View style={{ marginTop: 12 }}>
        <View style={{ backgroundColor: saldo >= 0 ? '#D1E7FF' : '#FFF9DB', borderRadius: 12, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: saldo >= 0 ? '#0D47A1' : '#7C4700', fontWeight: '700', fontSize: 15 }}>Saldo</Text>
          <Text style={{ color: saldo >= 0 ? '#0D47A1' : '#7C4700', fontWeight: '700', fontSize: 20, marginTop: 8 }} numberOfLines={1} ellipsizeMode="tail">{saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
        </View>
      </View>
      {/* Gráfico de pizza das despesas por categoria */}
      <View style={{ alignItems: 'center', marginTop: 18, marginBottom: 8 }}>
        <PieChart
          data={pieData.length > 0 ? pieData : [
            { name: 'Sem dados', population: 1, color: '#ccc', legendFontColor: '#333', legendFontSize: 13 }
          ]}
          width={chartWidth}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(44, 106, 79, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(44, 106, 79, ${opacity})`,
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 2,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
        <Text style={{ marginTop: 8, color: '#333', fontWeight: '500' }}>
          Despesas por categoria ({mode === 'MENSAL' ? 'mensal' : 'anual'})
        </Text>
      </View>
      {/* Gráfico de barras das despesas mensais */}
      <View style={{ width: '100%', alignItems: 'center' }}>
        <BarChart
          data={barData}
          width={chartWidth}
          height={220}
          yAxisLabel="R$ "
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(176, 42, 55, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(44, 106, 79, ${opacity})`,
            style: { borderRadius: 16 },
            propsForBackgroundLines: { stroke: '#eee' },
          }}
          style={{ borderRadius: 12 }}
        />
        <Text style={{ marginTop: 8, color: '#333', fontWeight: '500' }}>
          Despesas mensais ({selectedYear})
        </Text>
      </View>
    </ScrollView>
  );
});

// Função FlowTab para ser usada no FlowTabScrollWrapper
function FlowTab(props: any) {
  // Filtros
  const expensesFiltered = props.expenses.filter((exp: any) => {
    const d = new Date(exp.date);
    if (props.mode === 'MENSAL') {
      return d.getFullYear() === props.selectedYear && d.getMonth() === props.selectedMonth;
    } else {
      return d.getFullYear() === props.selectedYear;
    }
  });
  const incomesFiltered = props.incomes.filter((inc: any) => {
    const d = new Date(inc.date);
    if (props.mode === 'MENSAL') {
      return d.getFullYear() === props.selectedYear && d.getMonth() === props.selectedMonth;
    } else {
      return d.getFullYear() === props.selectedYear;
    }
  });

  // Somatórios
  const totalDespesas = expensesFiltered.reduce((sum: number, exp: any) => sum + exp.amount, 0);
  const totalReceitas = incomesFiltered.reduce((sum: number, inc: any) => sum + inc.amount, 0);
  const saldo = totalReceitas - totalDespesas;

  // Gráfico de pizza das despesas por categoria
  const despesasPorCategoria = expensesFiltered.reduce((acc: any, exp: any) => {
    if (exp.category && typeof exp.category === 'string') {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    }
    return acc;
  }, {});

  const totalPie = Object.values(despesasPorCategoria).reduce((sum: number, v) => sum + (v as number), 0);
  const pieData = Object.entries(despesasPorCategoria)
    .filter(([_, value]) => (value as number) > 0)
    .map(([category, value], i) => {
      // const percent = totalPie > 0 ? Math.round(((value as number) / totalPie) * 100) : 0;
      return {
        name: category, // Removido o percentual da legenda
        population: value as number,
        color: [
          '#B02A37', // vermelho
          '#146C43', // verde
          '#B68900', // amarelo
          '#0D47A1', // azul escuro
          '#6C584C', // marrom
          '#A3A847', // verde claro
          '#7C4700', // marrom escuro
        ][i % 7],
        legendFontColor: '#333',
        legendFontSize: 13,
      };
    });

  // Gráfico de barras das despesas mensais do ano selecionado
  const despesasPorMes = Array(12).fill(0);
  props.expenses
    .filter((exp: any) => {
      const d = new Date(exp.date);
      return d.getFullYear() === props.selectedYear;
    })
    .forEach((exp: any) => {
      const d = new Date(exp.date);
      despesasPorMes[d.getMonth()] += exp.amount;
    });

  const barData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', ''],
    datasets: [
      { data: [...despesasPorMes, 0] },
    ],
  };

  return (
    <FlowTabContent
      mode={props.mode}
      setMode={props.setMode}
      selectedMonth={props.selectedMonth}
      setSelectedMonth={props.setSelectedMonth}
      selectedYear={props.selectedYear}
      setSelectedYear={props.setSelectedYear}
      totalDespesas={totalDespesas}
      totalReceitas={totalReceitas}
      saldo={saldo}
      pieData={pieData}
      barData={barData}
      MONTHS_PT={MONTHS_PT}
      styles={styles}
    />
  );
}

const MONTHS_SHORT_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const ScheduleTab = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  // Estado: { [ano]: { [membro]: { [mes]: boolean } } }
  const [payments, setPayments] = useState<{ [year: number]: { [member: string]: { [month: number]: boolean } } }>({});

  // Inicializa membros para o ano se não existir
  useEffect(() => {
    setPayments(prev => {
      if (!prev[selectedYear]) {
        const yearData: { [member: string]: { [month: number]: boolean } } = {};
        GROUP_MEMBERS.forEach(member => {
          yearData[member] = {};
        });
        return { ...prev, [selectedYear]: yearData };
      }
      return prev;
    });
  }, [selectedYear]);

  const togglePayment = (member: string, month: number) => {
    setPayments(prev => ({
      ...prev,
      [selectedYear]: {
        ...prev[selectedYear],
        [member]: {
          ...prev[selectedYear][member],
          [month]: !prev[selectedYear][member]?.[month],
        },
      },
    }));
  };

  return (
    <View style={styles.tabContainer}>
      <Text style={styles.tabTitle}>Controle de Mensalidades</Text>
      {/* Navegação de ano */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <TouchableOpacity onPress={() => setSelectedYear(y => y - 1)} style={styles.yearButton}>
          <AntDesign name="left" size={20} color="#2D6A4F" />
        </TouchableOpacity>
        <Text style={styles.yearLabel}>{selectedYear}</Text>
        <TouchableOpacity onPress={() => setSelectedYear(y => y + 1)} style={styles.yearButton}>
          <AntDesign name="right" size={20} color="#2D6A4F" />
        </TouchableOpacity>
      </View>
      {/* Tabela */}
      <ScrollView horizontal style={{ marginBottom: 16 }}>
        <View>
          {/* Cabeçalho */}
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F0', borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
            <View style={{ width: 120, padding: 8 }}>
              <Text style={{ fontWeight: '700', color: '#333' }}>Membro</Text>
            </View>
            {MONTHS_SHORT_PT.map((m, i) => (
              <View key={m} style={{ width: 48, padding: 8, alignItems: 'center' }}>
                <Text style={{ fontWeight: '700', color: '#333' }}>{m}</Text>
              </View>
            ))}
          </View>
          {/* Linhas dos membros */}
          {GROUP_MEMBERS.map(member => (
            <View key={member} style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff' }}>
              <View style={{ width: 120, padding: 8 }}>
                <Text style={{ color: '#333' }}>{member}</Text>
              </View>
              {MONTHS_SHORT_PT.map((_, monthIdx) => (
                <TouchableOpacity
                  key={monthIdx}
                  style={{ width: 48, height: 40, alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => togglePayment(member, monthIdx)}
                >
                  <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: payments[selectedYear]?.[member]?.[monthIdx] ? '#2D6A4F' : '#ccc', backgroundColor: payments[selectedYear]?.[member]?.[monthIdx] ? '#2D6A4F' : '#fff', alignItems: 'center', justifyContent: 'center' }}>
                    {payments[selectedYear]?.[member]?.[monthIdx] && (
                      <AntDesign name="check" size={16} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default function ActivitiesScreen() {
  const [activeTab, setActiveTab] = useState<'expenses' | 'incomes' | 'flow' | 'schedule'>('expenses');

  const { expenses, setExpenses, incomes, setIncomes } = useFinance();

  // Estados globais para a aba Fluxo
  const [mode, setMode] = useState<'MENSAL' | 'ANUAL'>('MENSAL');
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerMain}>
        <Text style={styles.titleMain}>Financeiro</Text>
      </View>
      <View style={styles.tabBar}>
        {[
          { key: 'expenses', title: 'Despesas' },
          { key: 'incomes', title: 'Receitas' },
          { key: 'flow', title: 'Fluxo' },
          { key: 'schedule', title: 'Resumo' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.activeTabItem]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.title}
            </Text>
            {activeTab === tab.key && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
      <View style={[styles.tabContainer, { minHeight: '100%', flexGrow: 1 }]}
        // Removido ScrollView para evitar VirtualizedList aninhada
      >
        {activeTab === 'expenses' && <ExpensesTab expenses={expenses} setExpenses={setExpenses} />}
        {activeTab === 'incomes' && <IncomesTab incomes={incomes} setIncomes={setIncomes} />}
        {activeTab === 'flow' && (
          <View>
            <FlowTab
              expenses={expenses}
              incomes={incomes}
              mode={mode}
              setMode={setMode}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
            />
          </View>
        )}
        {activeTab === 'schedule' && <ScheduleTab />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F9',
  },
  headerMain: {
    padding: 16,
    paddingBottom: 8,
    alignItems: 'flex-start',
  },
  titleMain: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D6A4F',
    textAlign: 'left',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#2D6A4F',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
    minWidth: 80,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    marginBottom: 4,
  },
  pickerItemSelected: {
    backgroundColor: '#D7F9E9',
  },
  dateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  dateText: {
    fontSize: 16,
    color: '#2D6A4F',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E6E6E6',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2D6A4F',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F0F0F0',
    minWidth: 180,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownList: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    marginBottom: 12,
    marginLeft: 88,
    minWidth: 180,
    position: 'absolute',
    zIndex: 10,
    top: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownItemSelected: {
    backgroundColor: '#D7F9E9',
  },
  calendarModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignSelf: 'center',
    elevation: 4,
    zIndex: 20,
  },
  monthlyList: {
    marginTop: 16,
  },
  monthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    marginBottom: 10,
  },
  monthLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  monthTotal: {
    fontSize: 16,
    color: '#2D6A4F',
    fontWeight: '700',
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  yearButton: {
    padding: 8,
  },
  yearLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D6A4F',
    marginHorizontal: 8,
  },
  incomeCard: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 10,
  },
  category: {
    fontSize: 16,
    color: '#6C584C',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6C584C',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D6A4F',
  },
  date: {
    fontSize: 14,
    color: '#6C584C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBackground: {
    width: 40,
    height: 40,
    backgroundColor: '#E8F4EA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTop: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6C584C',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333',
    marginBottom: 4,
    marginLeft: 52,
  },
  trashButton: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 0,
    marginTop: 2,
  },
  userText: {
    fontSize: 14,
    color: '#6C584C',
  },
});