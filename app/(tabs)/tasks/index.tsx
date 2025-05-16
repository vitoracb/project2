import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Modal, TextInput, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Button } from '@/components/ui/Button';
import { Plus, Filter, Calendar as CalendarIcon } from 'lucide-react-native';
import { Calendar as ReactNativeCalendar, LocaleConfig } from 'react-native-calendars';
import { useTasks, Task } from '../../context/TasksContext';
import { useEvents } from '../../context/EventsContext';

LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ],
  dayNames: [
    'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
  ],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

export default function TasksScreen() {
  const [activeFilter, setActiveFilter] = useState('all');
  const { tasks, addTask, editTask, deleteTask, moveTaskLeft, moveTaskRight } = useTasks();
  const [modalVisible, setModalVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDate, setNewTaskDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  // Filtro
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [events, setEvents] = useState<{ date: string; title: string }[]>([]);
  const [newEventDate, setNewEventDate] = useState<Date | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [showEventCalendar, setShowEventCalendar] = useState(false);
  const { addEvent } = useEvents();
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [eventTitleInput, setEventTitleInput] = useState('');
  
  // Lógica de filtragem
  let filteredTasks = tasks;
  if (filterName.trim()) {
    filteredTasks = filteredTasks.filter((task: Task) => task.title.toLowerCase().includes(filterName.trim().toLowerCase()));
  }
  if (filterStartDate) {
    filteredTasks = filteredTasks.filter((task: Task) => task.dueDate && new Date(task.dueDate) >= filterStartDate);
  }
  if (filterEndDate) {
    filteredTasks = filteredTasks.filter((task: Task) => task.dueDate && new Date(task.dueDate) <= filterEndDate);
  }

  const todoTasks = filteredTasks.filter((task: Task) => task.status === 'TODO');
  const inProgressTasks = filteredTasks.filter((task: Task) => task.status === 'IN_PROGRESS');
  const doneTasks = filteredTasks.filter((task: Task) => task.status === 'DONE');
  
  const handleSaveTask = () => {
    if (!newTaskTitle.trim() || !newTaskDate) return;
    if (editingTaskId) {
      editTask({
        id: editingTaskId,
        title: newTaskTitle,
        description: newTaskDescription,
        dueDate: newTaskDate.toISOString(),
        status: tasks.find((t: Task) => t.id === editingTaskId)?.status || 'TODO',
        priority: tasks.find((t: Task) => t.id === editingTaskId)?.priority || 'MEDIUM',
        assignee: tasks.find((t: Task) => t.id === editingTaskId)?.assignee,
        createdBy: tasks.find((t: Task) => t.id === editingTaskId)?.createdBy,
      });
    } else {
      addTask({
        id: Date.now().toString(),
        title: newTaskTitle,
        description: newTaskDescription,
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: newTaskDate.toISOString(),
      });
    }
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDate(null);
    setEditingTaskId(null);
    setModalVisible(false);
  };

  const handleEditTask = (task: Task) => {
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description || '');
    setNewTaskDate(task.dueDate ? new Date(task.dueDate) : null);
    setEditingTaskId(task.id);
    setModalVisible(true);
  };

  const handleDeleteTask = (id: string) => {
    Alert.alert(
      'Excluir atividade',
      'Tem certeza que deseja excluir esta atividade?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => deleteTask(id) },
      ]
    );
  };

  useEffect(() => {
    if (selectedDate && events.some(ev => ev.date === selectedDate)) {
      setSelectedDate(null);
      setEventTitleInput('');
    }
  }, [events]);

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
      <View style={styles.header}>
        <Text style={styles.title}>Atividades</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
            <Filter size={20} color="#333333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={() => setCalendarModalVisible(true)}>
            <CalendarIcon size={20} color="#333333" />
          </TouchableOpacity>
          <Button
            title="Nova Tarefa"
            size="small"
            icon={<Plus size={16} color="white" />}
            style={styles.newTaskButton}
            onPress={() => {
              setNewTaskTitle('');
              setNewTaskDescription('');
              setNewTaskDate(null);
              setEditingTaskId(null);
              setModalVisible(true);
            }}
          />
        </View>
      </View>
      
      <View style={styles.filterTab}>
        <TouchableOpacity 
          style={[styles.filterItem, activeFilter === 'all' && styles.activeFilterItem]} 
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
            Todas ({tasks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterItem, activeFilter === 'todo' && styles.activeFilterItem]} 
          onPress={() => setActiveFilter('todo')}
        >
          <Text style={[styles.filterText, activeFilter === 'todo' && styles.activeFilterText]}>
            A fazer ({todoTasks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterItem, activeFilter === 'progress' && styles.activeFilterItem]} 
          onPress={() => setActiveFilter('progress')}
        >
          <Text style={[styles.filterText, activeFilter === 'progress' && styles.activeFilterText]}>
            Em andamento ({inProgressTasks.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterItem, activeFilter === 'done' && styles.activeFilterItem]} 
          onPress={() => setActiveFilter('done')}
        >
          <Text style={[styles.filterText, activeFilter === 'done' && styles.activeFilterText]}>
            Concluídas ({doneTasks.length})
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView>
        <View style={styles.kanbanView}>
          {activeFilter === 'all' && (
            <>
              <View style={styles.column}>
                <View style={styles.columnHeader}>
                  <Text style={styles.columnTitle}>A fazer</Text>
                  <Text style={styles.count}>{todoTasks.length}</Text>
                </View>
                <FlatList
                  data={todoTasks}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TaskCard
                      task={item}
                      onDelete={handleDeleteTask}
                      onPress={() => handleEditTask(item)}
                      onMoveLeft={moveTaskLeft}
                      onMoveRight={moveTaskRight}
                    />
                  )}
                  scrollEnabled={false}
                />
              </View>
              <View style={styles.column}>
                <View style={styles.columnHeader}>
                  <Text style={styles.columnTitle}>Em andamento</Text>
                  <Text style={styles.count}>{inProgressTasks.length}</Text>
                </View>
                <FlatList
                  data={inProgressTasks}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TaskCard
                      task={item}
                      onDelete={handleDeleteTask}
                      onPress={() => handleEditTask(item)}
                      onMoveLeft={moveTaskLeft}
                      onMoveRight={moveTaskRight}
                    />
                  )}
                  scrollEnabled={false}
                />
              </View>
              <View style={styles.column}>
                <View style={styles.columnHeader}>
                  <Text style={styles.columnTitle}>Concluídas</Text>
                  <Text style={styles.count}>{doneTasks.length}</Text>
                </View>
                <FlatList
                  data={doneTasks}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TaskCard
                      task={item}
                      onDelete={handleDeleteTask}
                      onPress={() => handleEditTask(item)}
                      onMoveLeft={moveTaskLeft}
                      onMoveRight={moveTaskRight}
                    />
                  )}
                  scrollEnabled={false}
                />
              </View>
            </>
          )}
          {activeFilter === 'todo' && (
            <View style={[styles.column, styles.singleColumn]}>
              <View style={styles.columnHeader}>
                <Text style={styles.columnTitle}>A fazer</Text>
                <Text style={styles.count}>{todoTasks.length}</Text>
              </View>
              <FlatList
                data={todoTasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TaskCard
                    task={item}
                    onDelete={handleDeleteTask}
                    onPress={() => handleEditTask(item)}
                    onMoveLeft={moveTaskLeft}
                    onMoveRight={moveTaskRight}
                  />
                )}
                scrollEnabled={false}
              />
            </View>
          )}
          {activeFilter === 'progress' && (
            <View style={[styles.column, styles.singleColumn]}>
              <View style={styles.columnHeader}>
                <Text style={styles.columnTitle}>Em andamento</Text>
                <Text style={styles.count}>{inProgressTasks.length}</Text>
              </View>
              <FlatList
                data={inProgressTasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TaskCard
                    task={item}
                    onDelete={handleDeleteTask}
                    onPress={() => handleEditTask(item)}
                    onMoveLeft={moveTaskLeft}
                    onMoveRight={moveTaskRight}
                  />
                )}
                scrollEnabled={false}
              />
            </View>
          )}
          {activeFilter === 'done' && (
            <View style={[styles.column, styles.singleColumn]}>
              <View style={styles.columnHeader}>
                <Text style={styles.columnTitle}>Concluídas</Text>
                <Text style={styles.count}>{doneTasks.length}</Text>
              </View>
              <FlatList
                data={doneTasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TaskCard
                    task={item}
                    onDelete={handleDeleteTask}
                    onPress={() => handleEditTask(item)}
                    onMoveLeft={moveTaskLeft}
                    onMoveRight={moveTaskRight}
                  />
                )}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      </ScrollView>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, width: '90%' }}>
            <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#2D6A4F', textAlign: 'center' }}>
              {editingTaskId ? 'Edição de Atividade' : 'Nova Atividade'}
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16, color: '#333' }}
              placeholder="Título da atividade"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
            />
            <TextInput
              style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16, color: '#333', minHeight: 60 }}
              placeholder="Observações (opcional)"
              value={newTaskDescription}
              onChangeText={setNewTaskDescription}
              multiline
            />
            <TouchableOpacity onPress={() => setShowCalendar(true)} style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 10, marginBottom: 12, backgroundColor: '#F0F0F0' }}>
              <Text style={{ fontSize: 16, color: '#333' }}>{newTaskDate ? newTaskDate.toLocaleDateString('pt-BR') : 'Selecionar data'}</Text>
            </TouchableOpacity>
            {showCalendar && (
              <View style={{ marginBottom: 12 }}>
                <ReactNativeCalendar
                  onDayPress={day => {
                    const [year, month, dayNum] = day.dateString.split('-').map(Number);
                    setNewTaskDate(new Date(year, month - 1, dayNum));
                    setShowCalendar(false);
                  }}
                  markedDates={newTaskDate ? { [newTaskDate.toISOString().split('T')[0]]: {selected: true, selectedColor: '#2D6A4F'} } : {}}
                  theme={{ selectedDayBackgroundColor: '#2D6A4F', todayTextColor: '#2D6A4F' }}
                />
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#E6E6E6' }}>
                <Text style={{ color: '#333', fontWeight: '500' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveTask} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#2D6A4F' }}>
                <Text style={{ color: 'white', fontWeight: '700' }}>{editingTaskId ? 'Salvar edição' : 'Salvar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, width: '90%' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 16, color: '#2D6A4F', textAlign: 'center' }}>Filtrar Atividades</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16, color: '#333' }}
              placeholder="Buscar por nome"
              value={filterName}
              onChangeText={setFilterName}
            />
            <TouchableOpacity onPress={() => setShowStartCalendar(true)} style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 10, marginBottom: 12, backgroundColor: '#F0F0F0' }}>
              <Text style={{ fontSize: 16, color: '#333' }}>{filterStartDate ? `De: ${filterStartDate.toLocaleDateString('pt-BR')}` : 'Selecionar data inicial'}</Text>
            </TouchableOpacity>
            {showStartCalendar && (
              <View style={{ marginBottom: 12 }}>
                <ReactNativeCalendar
                  onDayPress={day => {
                    const [year, month, dayNum] = day.dateString.split('-').map(Number);
                    setFilterStartDate(new Date(year, month - 1, dayNum));
                    setShowStartCalendar(false);
                  }}
                  markedDates={filterStartDate ? { [filterStartDate.toISOString().split('T')[0]]: {selected: true, selectedColor: '#2D6A4F'} } : {}}
                  theme={{ selectedDayBackgroundColor: '#2D6A4F', todayTextColor: '#2D6A4F' }}
                />
              </View>
            )}
            <TouchableOpacity onPress={() => setShowEndCalendar(true)} style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 10, marginBottom: 12, backgroundColor: '#F0F0F0' }}>
              <Text style={{ fontSize: 16, color: '#333' }}>{filterEndDate ? `Até: ${filterEndDate.toLocaleDateString('pt-BR')}` : 'Selecionar data final'}</Text>
            </TouchableOpacity>
            {showEndCalendar && (
              <View style={{ marginBottom: 12 }}>
                <ReactNativeCalendar
                  onDayPress={day => {
                    const [year, month, dayNum] = day.dateString.split('-').map(Number);
                    setFilterEndDate(new Date(year, month - 1, dayNum));
                    setShowEndCalendar(false);
                  }}
                  markedDates={filterEndDate ? { [filterEndDate.toISOString().split('T')[0]]: {selected: true, selectedColor: '#2D6A4F'} } : {}}
                  theme={{ selectedDayBackgroundColor: '#2D6A4F', todayTextColor: '#2D6A4F' }}
                />
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setFilterName('');
                  setFilterStartDate(null);
                  setFilterEndDate(null);
                }}
                style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F0F0F0' }}
              >
                <Text style={{ color: '#333', fontWeight: '500' }}>Limpar Filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#E6E6E6' }}>
                <Text style={{ color: '#333', fontWeight: '500' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#2D6A4F' }}>
                <Text style={{ color: 'white', fontWeight: '700' }}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={eventModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEventModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, width: '90%' }}>
            <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#2D6A4F', textAlign: 'center' }}>
              Novo Evento
            </Text>
            <TouchableOpacity onPress={() => setShowEventCalendar(true)} style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 10, marginBottom: 12, backgroundColor: '#F0F0F0' }}>
              <Text style={{ fontSize: 16, color: '#333' }}>{newEventDate ? newEventDate.toLocaleDateString('pt-BR') : 'Selecionar data'}</Text>
            </TouchableOpacity>
            {showEventCalendar && (
              <View style={{ marginBottom: 12 }}>
                <ReactNativeCalendar
                  onDayPress={day => {
                    const [year, month, dayNum] = day.dateString.split('-').map(Number);
                    setNewEventDate(new Date(year, month - 1, dayNum));
                    setShowEventCalendar(false);
                  }}
                  markedDates={events.reduce((acc, ev) => {
                    acc[ev.date] = { selected: true, selectedColor: '#2D6A4F' };
                    return acc;
                  }, newEventDate ? { [newEventDate.toISOString().split('T')[0]]: {selected: true, selectedColor: '#2D6A4F'} } : {})}
                  theme={{ selectedDayBackgroundColor: '#2D6A4F', todayTextColor: '#2D6A4F' }}
                />
              </View>
            )}
            <TextInput
              style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16, color: '#333' }}
              placeholder="Título do evento"
              value={newEventTitle}
              onChangeText={setNewEventTitle}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity onPress={() => setEventModalVisible(false)} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#E6E6E6' }}>
                <Text style={{ color: '#333', fontWeight: '500' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                if (newEventDate && newEventTitle.trim()) {
                  setEvents(prev => [
                    { date: newEventDate.toISOString().split('T')[0], title: newEventTitle },
                    ...prev
                  ]);
                  setNewEventDate(null);
                  setNewEventTitle('');
                  setEventModalVisible(false);
                  setShowEventCalendar(false);
                }
              }} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#2D6A4F' }}>
                <Text style={{ color: 'white', fontWeight: '700' }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
                  <TouchableOpacity
                    onPress={() => {
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
                    }}
                    style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#2D6A4F' }}
                  >
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D6A4F',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  newTaskButton: {
    borderRadius: 20,
  },
  filterTab: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'white',
  },
  filterItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeFilterItem: {
    backgroundColor: '#E8F4EA',
  },
  filterText: {
    fontSize: 12,
    color: '#6C584C',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#2D6A4F',
    fontWeight: '600',
  },
  kanbanView: {
    flexDirection: 'row',
    padding: 8,
  },
  column: {
    flex: 1,
    margin: 4,
    backgroundColor: '#F0F0F0',
  },
  singleColumn: {
    flex: 1,
    margin: 4,
    backgroundColor: '#F0F0F0',
    maxWidth: 400,
    alignSelf: 'center',
    minWidth: 0,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    marginBottom: 8,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  count: {
    fontSize: 12,
    color: '#666666',
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
});