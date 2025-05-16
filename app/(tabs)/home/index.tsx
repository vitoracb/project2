import React from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityCard, Activity } from '@/components/dashboard/ActivityCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  DollarSign, 
  TrendingUp, 
  ClipboardList,
  FileText,
  Calendar,
  Plus,
  ChevronRight
} from 'lucide-react-native';
import { AddExpenseModal } from '@/components/expenses/AddExpenseModal';
import { useFinance } from '../../context/FinanceContext';
import { useTasks, Task } from '../../context/TasksContext';
import { AddTaskModal } from '../../../components/tasks/AddTaskModal';
import { useRouter } from 'expo-router';
import { useEvents, Event as CalendarEvent } from '../../context/EventsContext';
import { addDays, isAfter, isSameDay } from 'date-fns';
import { Calendar as ReactNativeCalendar, LocaleConfig } from 'react-native-calendars';

export default function HomeScreen() {
  const [expenseModalVisible, setExpenseModalVisible] = React.useState(false);
  const { expenses, incomes, setExpenses } = useFinance();
  const { tasks, addTask, deleteTask } = useTasks();
  const { events, deleteEvent, addEvent } = useEvents();
  const router = useRouter();

  // Estados para o modal de tarefa
  const [addTaskModalVisible, setAddTaskModalVisible] = React.useState(false);
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [newTaskDescription, setNewTaskDescription] = React.useState('');
  const [newTaskDate, setNewTaskDate] = React.useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = React.useState(false);

  // Soma total de despesas e receitas
  const totalDespesas = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalReceitas = incomes.reduce((sum, inc) => sum + inc.amount, 0);

  const formatCurrency = (amount: number) =>
    amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleSaveExpense = (expense: any) => {
    setExpenses(prev => [{
      ...expense,
      id: Date.now().toString(),
      user: { id: '1', name: 'Usuário' },
    }, ...prev]);
    Alert.alert('Confirmação', 'Despesa adicionada com sucesso!');
  };

  const todoCount = tasks.filter((t: Task) => t.status === 'TODO').length;
  const inProgressCount = tasks.filter((t: Task) => t.status === 'IN_PROGRESS').length;
  const doneCount = tasks.filter((t: Task) => t.status === 'DONE').length;

  const handleSaveTask = () => {
    if (!newTaskTitle.trim() || !newTaskDate) return;
    addTask({
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDescription,
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: newTaskDate.toISOString(),
    });
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDate(null);
    setShowCalendar(false);
    setAddTaskModalVisible(false);
  };

  // Adaptador para o formato do ActivityCard
  function taskToActivity(task: Task) {
    return {
      id: task.id,
      action: 'Tarefa Criada',
      entityType: 'task',
      entityId: task.id,
      details: { title: task.title },
      createdAt: task.dueDate || new Date().toISOString(),
      user: { name: task.createdBy?.name || 'Usuário' }
    };
  }

  function eventToActivity(event: CalendarEvent) {
    return {
      id: event.id,
      action: 'Evento Agendado',
      entityType: 'event',
      entityId: event.id,
      details: { title: event.title },
      createdAt: event.date,
      user: { name: 'Calendário' }
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const validEvents = events; // Forçar exibição de todos os eventos para teste
  const eventActivities = validEvents.map(eventToActivity);
  const taskActivities = tasks
    .map(taskToActivity)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  let recentActivities;
  if (eventActivities.length > 0) {
    const neededTasks = 3 - eventActivities.length;
    recentActivities = [
      ...eventActivities,
      ...taskActivities.filter(t => !eventActivities.some(e => e.id === t.id)).slice(0, neededTasks)
    ];
  } else {
    recentActivities = taskActivities.slice(0, 3);
  }

  console.log('events:', events);
  console.log('validEvents:', validEvents);

  const [calendarModalVisible, setCalendarModalVisible] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [eventTitleInput, setEventTitleInput] = React.useState('');

  const markedDates = {
    ...events.reduce((acc: Record<string, any>, ev) => {
      acc[ev.date] = { selected: true, selectedColor: '#2D6A4F' };
      return acc;
    }, {}),
    ...(selectedDate && !events.some(ev => ev.date === selectedDate)
      ? { [selectedDate]: { selected: true, selectedColor: '#40916C' } }
      : {})
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Floresta Sagrada</Text>
          <Text style={styles.subtitle}>Fazenda Nossa Senhora Aparecida</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <StatCard
            title="Despesas Totais"
            value={formatCurrency(totalDespesas)}
            icon={<DollarSign size={16} color="#2D6A4F" />}
          />
          <StatCard
            title="Receita"
            value={formatCurrency(totalReceitas)}
            icon={<TrendingUp size={16} color="#40916C" />}
            color="#40916C"
          />
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tarefas</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push('/tasks')}>
              <Text style={styles.seeAllText}>Ver todas</Text>
              <ChevronRight size={16} color="#2D6A4F" />
            </TouchableOpacity>
          </View>
          
          <Card flat style={styles.taskSummary}>
            <View style={styles.taskStats}>
              <View style={styles.taskStat}>
                <View style={[styles.taskIndicator, styles.todoIndicator]} />
                <Text style={styles.taskCount}>{todoCount}</Text>
                <Text style={styles.taskLabel}>A fazer</Text>
              </View>
              <View style={styles.taskStat}>
                <View style={[styles.taskIndicator, styles.inProgressIndicator]} />
                <Text style={styles.taskCount}>{inProgressCount}</Text>
                <Text style={styles.taskLabel}>Em andamento</Text>
              </View>
              <View style={styles.taskStat}>
                <View style={[styles.taskIndicator, styles.doneIndicator]} />
                <Text style={styles.taskCount}>{doneCount}</Text>
                <Text style={styles.taskLabel}>Concluídas</Text>
              </View>
            </View>
          </Card>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Atividades recentes</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>Ver todas</Text>
              <ChevronRight size={16} color="#2D6A4F" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={recentActivities}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ActivityCard
                activity={item}
                onDelete={() => {
                  Alert.alert(
                    'Excluir',
                    item.entityType === 'event'
                      ? 'Tem certeza que deseja excluir este evento?'
                      : 'Tem certeza que deseja excluir esta tarefa?',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Excluir', style: 'destructive', onPress: () => {
                          console.log('Tentando deletar:', item.entityType, item.id);
                          if (item.entityType === 'event') {
                            deleteEvent(item.id);
                          } else {
                            deleteTask(item.id);
                          }
                        }
                      }
                    ]
                  );
                }}
              />
            )}
            scrollEnabled={false}
          />
        </View>
        
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Ações rápidas</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={() => setExpenseModalVisible(true)}>
              <View style={[styles.actionIcon, styles.expenseIcon]}>
                <DollarSign size={20} color="#2D6A4F" />
              </View>
              <Text style={styles.actionText}>Adicionar despesa</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, styles.documentIcon]}>
                <FileText size={20} color="#40916C" />
              </View>
              <Text style={styles.actionText}>Enviar documento</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={() => setAddTaskModalVisible(true)}>
              <View style={[styles.actionIcon, styles.taskIcon]}>
                <ClipboardList size={20} color="#52B788" />
              </View>
              <Text style={styles.actionText}>Criar tarefa</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={() => setCalendarModalVisible(true)}>
              <View style={[styles.actionIcon, styles.eventIcon]}>
                <Calendar size={20} color="#74C69D" />
              </View>
              <Text style={styles.actionText}>Agendar evento</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <AddExpenseModal
        visible={expenseModalVisible}
        onClose={() => setExpenseModalVisible(false)}
        onSave={handleSaveExpense}
      />
      <AddTaskModal
        visible={addTaskModalVisible}
        onClose={() => setAddTaskModalVisible(false)}
        onSave={handleSaveTask}
        title={newTaskTitle}
        setTitle={setNewTaskTitle}
        description={newTaskDescription}
        setDescription={setNewTaskDescription}
        date={newTaskDate}
        setDate={setNewTaskDate}
        showCalendar={showCalendar}
        setShowCalendar={setShowCalendar}
      />
      <Modal
        visible={calendarModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCalendarModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, width: '90%' }}>
            <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#2D6A4F', textAlign: 'center' }}>
              Adicionar Evento
            </Text>
            <ReactNativeCalendar
              onDayPress={day => {
                setSelectedDate(day.dateString);
              }}
              markedDates={markedDates}
              theme={{ selectedDayBackgroundColor: '#2D6A4F', todayTextColor: '#2D6A4F' }}
            />
            {selectedDate && (
              <View style={{ marginTop: 16 }}>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16, color: '#333' }}
                  placeholder="Título do evento"
                  value={eventTitleInput}
                  onChangeText={setEventTitleInput}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                  <TouchableOpacity onPress={() => { setSelectedDate(null); setEventTitleInput(''); }} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#E6E6E6' }}>
                    <Text style={{ color: '#333', fontWeight: '500' }}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {
                    if (
                      eventTitleInput.trim() &&
                      selectedDate &&
                      typeof selectedDate === 'string' &&
                      /^\d{4}-\d{2}-\d{2}$/.test(selectedDate)
                    ) {
                      const eventId = `${selectedDate}-${eventTitleInput}-${Date.now()}`;
                      addEvent({ date: selectedDate, title: eventTitleInput, id: eventId });
                      setCalendarModalVisible(false);
                      setSelectedDate(null);
                      setEventTitleInput('');
                    }
                  }} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#2D6A4F' }}>
                    <Text style={{ color: 'white', fontWeight: '700' }}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <TouchableOpacity onPress={() => { setCalendarModalVisible(false); setSelectedDate(null); setEventTitleInput(''); }} style={{ marginTop: 16, alignSelf: 'flex-end' }}>
              <Text style={{ color: '#2D6A4F', fontWeight: '500' }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F9',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D6A4F',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C584C',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2D6A4F',
    fontWeight: '500',
  },
  taskSummary: {
    padding: 16,
  },
  taskStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  taskStat: {
    alignItems: 'center',
    flex: 1,
  },
  taskIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  todoIndicator: {
    backgroundColor: '#F97316',
  },
  inProgressIndicator: {
    backgroundColor: '#3B82F6',
  },
  doneIndicator: {
    backgroundColor: '#10B981',
  },
  taskCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  taskLabel: {
    fontSize: 12,
    color: '#666666',
  },
  quickActions: {
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  expenseIcon: {
    backgroundColor: '#E8F4EA',
  },
  documentIcon: {
    backgroundColor: '#DAF2E4',
  },
  taskIcon: {
    backgroundColor: '#D1FAE5',
  },
  eventIcon: {
    backgroundColor: '#C7F9CC',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
});