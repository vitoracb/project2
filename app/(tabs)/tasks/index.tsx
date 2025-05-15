import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TaskCard, Task } from '@/components/tasks/TaskCard';
import { Button } from '@/components/ui/Button';
import { Plus, Filter } from 'lucide-react-native';

// Mock data for tasks
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Repair fence in north pasture',
    description: 'Several posts need replacement after the storm',
    status: 'TODO',
    priority: 'HIGH',
    dueDate: '2025-05-20T00:00:00Z',
    assignee: {
      id: '1',
      name: 'John Smith',
    },
  },
  {
    id: '2',
    title: 'Order new irrigation supplies',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '2025-05-25T00:00:00Z',
  },
  {
    id: '3',
    title: 'Schedule vet visit for cattle',
    description: 'Annual checkups and vaccinations',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    assignee: {
      id: '2',
      name: 'Anna Johnson',
    },
  },
  {
    id: '4',
    title: 'Submit quarterly tax documents',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2025-05-15T00:00:00Z',
    assignee: {
      id: '3',
      name: 'Robert Davis',
    },
  },
  {
    id: '5',
    title: 'Fix tractor hydraulic system',
    status: 'DONE',
    priority: 'HIGH',
    assignee: {
      id: '1',
      name: 'John Smith',
    },
  },
  {
    id: '6',
    title: 'Clean equipment shed',
    status: 'DONE',
    priority: 'LOW',
    assignee: {
      id: '2',
      name: 'Anna Johnson',
    },
  },
];

export default function TasksScreen() {
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Filter tasks by status
  const todoTasks = mockTasks.filter(task => task.status === 'TODO');
  const inProgressTasks = mockTasks.filter(task => task.status === 'IN_PROGRESS');
  const doneTasks = mockTasks.filter(task => task.status === 'DONE');
  
  const filteredTasks = activeFilter === 'all' ? mockTasks : 
    activeFilter === 'todo' ? todoTasks :
    activeFilter === 'progress' ? inProgressTasks : doneTasks;
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tarefas</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#333333" />
          </TouchableOpacity>
          <Button
            title="Nova Tarefa"
            size="small"
            icon={<Plus size={16} color="white" />}
            style={styles.newTaskButton}
          />
        </View>
      </View>
      
      <View style={styles.filterTab}>
        <TouchableOpacity 
          style={[styles.filterItem, activeFilter === 'all' && styles.activeFilterItem]} 
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
            Todas ({mockTasks.length})
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
          <View style={styles.column}>
            <View style={styles.columnHeader}>
              <Text style={styles.columnTitle}>A fazer</Text>
              <Text style={styles.count}>{todoTasks.length}</Text>
            </View>
            <FlatList
              data={todoTasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <TaskCard task={item} />}
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
              renderItem={({ item }) => <TaskCard task={item} />}
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
              renderItem={({ item }) => <TaskCard task={item} />}
              scrollEnabled={false}
            />
          </View>
        </View>
      </ScrollView>
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
    borderRadius: 8,
    padding: 8,
    maxWidth: 280,
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