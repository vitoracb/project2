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
  TextInput,
  Platform,
  ActionSheetIOS,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView
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
import { useFinance, Payment } from '../../context/FinanceContext';
import { useTasks, Task } from '../../context/TasksContext';
import { AddTaskModal } from '../../../components/tasks/AddTaskModal';
import { useRouter } from 'expo-router';
import { useEvents, Event as CalendarEvent } from '../../context/EventsContext';
import { addDays, isAfter, isSameDay } from 'date-fns';
import { Calendar as ReactNativeCalendar, LocaleConfig } from 'react-native-calendars';
import { useDocuments, DocumentCategory } from '../../context/DocumentsContext';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useComments } from '../../context/CommentsContext';
import { MemberPicker } from '@/components/ui/MemberPicker';
import { AddPaymentModal } from '@/components/ui/AddPaymentModal';

export default function HomeScreen() {
  const [expenseModalVisible, setExpenseModalVisible] = React.useState(false);
  const { expenses, incomes, setExpenses, payments, addPayment, setIncomes, payments: paymentsList, setPayments } = useFinance();
  const { tasks, addTask, deleteTask } = useTasks();
  const { events, deleteEvent, addEvent } = useEvents();
  const router = useRouter();
  const { addDocument, documents, removeDocument } = useDocuments();
  const { comments, removeComment } = useComments();
  const [uploadModalVisible, setUploadModalVisible] = React.useState(false);
  const [uploadForm, setUploadForm] = React.useState({
    title: '',
    category: '' as '' | DocumentCategory,
    file: null as null | { uri: string; name: string; type: string },
    description: '',
  });

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
      date: new Date().toISOString(),
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
      dueDate: new Date().toISOString(),
    });
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDate(null);
    setShowCalendar(false);
    setAddTaskModalVisible(false);
  };

  // Adaptadores para o formato do ActivityCard
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
      user: { name: 'Evento' }
    };
  }

  function expenseToActivity(expense: import('../../context/FinanceContext').Expense) {
    return {
      id: expense.id,
      action: 'Despesa Adicionada',
      entityType: 'expense',
      entityId: expense.id,
      details: { title: expense.title, amount: expense.amount },
      createdAt: expense.date,
      user: { name: expense.user?.name || 'Usuário' }
    };
  }

  function paymentToActivity(payment: Payment) {
    return {
      id: payment.id,
      action: 'Pagamento Adicionado',
      entityType: 'payment',
      entityId: payment.id,
      details: { title: payment.title, amount: payment.amount },
      createdAt: payment.date,
      user: { name: payment.user?.name || 'Usuário' }
    };
  }

  function documentToActivity(doc: import('../../context/DocumentsContext').Document) {
    return {
      id: doc.id,
      action: 'Documento Enviado',
      entityType: 'document',
      entityId: doc.id,
      details: { title: doc.title },
      createdAt: doc.createdAt,
      user: { name: doc.uploader?.name || 'Usuário' }
    };
  }

  function commentToActivity(comment: import('../../context/CommentsContext').Comment) {
    return {
      id: comment.id,
      action: 'Comentário Adicionado',
      entityType: 'comment',
      entityId: comment.id,
      details: { content: comment.content },
      createdAt: comment.createdAt,
      user: { name: comment.user?.name || 'Usuário' }
    };
  }

  // Unificar todas as atividades
  const now = new Date();
  // Eventos: só mostrar se a data do evento for até 1 dia após a data atual
  const validEvents = events
    .map(eventToActivity)
    .filter(ev => {
      const eventDate = new Date(ev.createdAt);
      return eventDate.getTime() + 24 * 60 * 60 * 1000 > now.getTime();
    });
  // Outras atividades
  const otherActivities = [
    ...tasks.map(taskToActivity),
    ...expenses.map(expenseToActivity),
    ...payments.map(paymentToActivity),
    ...documents.map(documentToActivity),
    ...comments.map(commentToActivity),
  ];
  // Filtrar nulls antes de ordenar
  const filteredOther = otherActivities.filter(Boolean);
  filteredOther.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  // Eventos sempre no topo, ordenados por data
  validEvents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  // Pegar os 6 mais recentes, priorizando eventos
  const recentActivities = [...validEvents, ...filteredOther].slice(0, 6);

  console.log('events:', events);
  console.log('validEvents:', recentActivities);

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

  const handlePickFile = async () => {
    Alert.alert(
      'Selecionar',
      'Escolha o tipo de documento',
      [
        { text: 'Documento', onPress: async () => {
            const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
            if (!result.canceled && result.assets && result.assets[0]) {
              setUploadForm(f => ({ ...f, file: { uri: result.assets[0].uri, name: result.assets[0].name, type: result.assets[0].mimeType || 'application/octet-stream' } }));
            }
          }
        },
        { text: 'Foto', onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
            if (!result.canceled && result.assets && result.assets[0]) {
              setUploadForm(f => ({ ...f, file: { uri: result.assets[0].uri, name: result.assets[0].fileName || 'imagem.jpg', type: result.assets[0].type || 'image/jpeg' } }));
            }
          }
        },
        { text: 'Câmera', onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
            if (!result.canceled && result.assets && result.assets[0]) {
              setUploadForm(f => ({ ...f, file: { uri: result.assets[0].uri, name: result.assets[0].fileName || 'foto.jpg', type: result.assets[0].type || 'image/jpeg' } }));
            }
          }
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleSaveDocument = () => {
    if (!uploadForm.category) {
      Alert.alert('Selecione a categoria!');
      return;
    }
    if (!uploadForm.file) {
      Alert.alert('Selecione um arquivo ou foto!');
      return;
    }
    const newDoc = {
      id: Date.now().toString(),
      title: uploadForm.title || (uploadForm.file && uploadForm.file.name) || '',
      category: uploadForm.category as DocumentCategory,
      fileUrl: uploadForm.file.uri,
      fileType: uploadForm.file.type.split('/').pop() || 'file',
      fileSize: 0,
      createdAt: new Date().toISOString(),
      uploader: { id: '0', name: 'Você' },
      description: uploadForm.description,
    };
    addDocument(newDoc);
    setUploadModalVisible(false);
    setUploadForm({ title: '', category: '', file: null, description: '' });
  };

  const handleAddEvent = (event: CalendarEvent) => {
    addEvent({
      ...event,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    });
  };

  const [paymentModalVisible, setPaymentModalVisible] = React.useState(false);
  const [paymentForm, setPaymentForm] = React.useState({
    title: '',
    amount: '',
    description: '',
    member: '',
  });

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
          </View>
          
          <FlatList
            data={recentActivities}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => item ? (
              <ActivityCard
                activity={item}
                onDelete={() => {
                  Alert.alert(
                    'Excluir',
                    (() => {
                      switch (item.entityType) {
                        case 'event': return 'Tem certeza que deseja excluir este evento?';
                        case 'task': return 'Tem certeza que deseja excluir esta tarefa?';
                        case 'expense': return 'Tem certeza que deseja excluir esta despesa?';
                        case 'payment': return 'Tem certeza que deseja excluir este pagamento?';
                        case 'document': return 'Tem certeza que deseja excluir este documento?';
                        case 'comment': return 'Tem certeza que deseja excluir este comentário?';
                        default: return 'Tem certeza que deseja excluir este item?';
                      }
                    })(),
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Excluir', style: 'destructive', onPress: () => {
                        switch (item.entityType) {
                          case 'event':
                            deleteEvent(item.entityId);
                            break;
                          case 'task':
                            deleteTask(item.entityId);
                            break;
                          case 'expense':
                            setExpenses((prev: any[]) => prev.filter(exp => exp.id !== item.entityId));
                            break;
                          case 'payment':
                            setPayments((prev: any[]) => prev.filter((pay: any) => pay.id !== item.entityId));
                            setIncomes((prev: any[]) => prev.filter((inc: any) => inc.id !== item.entityId));
                            break;
                          case 'document':
                            removeDocument(item.entityId);
                            break;
                          case 'comment':
                            removeComment(item.entityId);
                            break;
                        }
                      } },
                    ]
                  );
                }}
              />
            ) : null}
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
            
            <TouchableOpacity style={styles.actionButton} onPress={() => setUploadModalVisible(true)}>
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
            
            <TouchableOpacity style={styles.actionButton} onPress={() => setPaymentModalVisible(true)}>
              <View style={[styles.actionIcon, styles.expenseIcon]}>
                <DollarSign size={20} color="#2D6A4F" />
              </View>
              <Text style={styles.actionText}>Adicionar pagamento</Text>
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
              hideArrows={false}
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
                      handleAddEvent({ date: selectedDate, title: eventTitleInput, id: eventId });
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
      <Modal
        visible={uploadModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, width: '90%' }}>
              <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#2D6A4F', textAlign: 'center' }}>
                Enviar Documento
              </Text>
              <Text style={{ fontWeight: '600', marginBottom: 8 }}>Categoria</Text>
              <TouchableOpacity
                style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#F0F0F0' }}
                onPress={() => {
                  const categorias: DocumentCategory[] = ['DEED', 'MAP', 'CERTIFICATE', 'RECEIPT', 'OTHER'];
                  const labels = categorias.map(cat => {
                    switch (cat) {
                      case 'DEED': return 'Escritura';
                      case 'MAP': return 'Mapas';
                      case 'CERTIFICATE': return 'Certificados';
                      case 'RECEIPT': return 'Recibos';
                      case 'OTHER': return 'Outros';
                    }
                  });
                  if (Platform.OS === 'ios') {
                    ActionSheetIOS.showActionSheetWithOptions(
                      {
                        options: [...labels, 'Cancelar'],
                        cancelButtonIndex: labels.length,
                      },
                      (buttonIndex) => {
                        if (buttonIndex < labels.length) {
                          setUploadForm(f => ({ ...f, category: categorias[buttonIndex] }));
                        }
                      }
                    );
                  } else {
                    const buttons: any[] = labels.map((label, idx) => ({
                      text: label,
                      onPress: () => setUploadForm(f => ({ ...f, category: categorias[idx] })),
                    }));
                    buttons.push({ text: 'Cancelar', style: 'cancel' });
                    Alert.alert(
                      'Selecione a categoria',
                      undefined,
                      buttons
                    );
                  }
                }}
              >
                <Text style={{ color: uploadForm.category ? '#333' : '#888', fontWeight: '500' }}>
                  {uploadForm.category ?
                    (uploadForm.category === 'DEED' ? 'Escritura' :
                      uploadForm.category === 'MAP' ? 'Mapas' :
                      uploadForm.category === 'CERTIFICATE' ? 'Certificados' :
                      uploadForm.category === 'RECEIPT' ? 'Recibos' :
                      'Outros')
                    : 'Selecione a categoria'}
                </Text>
              </TouchableOpacity>
              <Text style={{ fontWeight: '600', marginBottom: 8 }}>Nome do documento</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16, color: '#333' }}
                placeholder="Nome do documento"
                value={uploadForm.title}
                onChangeText={t => setUploadForm(f => ({ ...f, title: t }))}
              />
              <TextInput
                style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16, color: '#333', minHeight: 40 }}
                placeholder="Observações (opcional)"
                value={uploadForm.description}
                onChangeText={t => setUploadForm(f => ({ ...f, description: t }))}
                multiline
              />
              <TouchableOpacity
                style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#F0F0F0', alignItems: 'center' }}
                onPress={handlePickFile}
              >
                <Text style={{ color: '#2D6A4F', fontWeight: '600' }}>Selecionar Documento</Text>
              </TouchableOpacity>
              {uploadForm.file && (
                <TouchableOpacity
                  onLongPress={() => {
                    Alert.alert(
                      'Remover arquivo',
                      'Deseja remover o arquivo selecionado?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Remover', style: 'destructive', onPress: () => setUploadForm(f => ({ ...f, file: null })) },
                      ]
                    );
                  }}
                  activeOpacity={0.8}
                  style={{ alignItems: 'center', marginBottom: 12 }}
                >
                  {uploadForm.file.type.startsWith('image') ? (
                    <Image source={{ uri: uploadForm.file.uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                  ) : (
                    <Text style={{ color: '#333' }}>{uploadForm.file.name}</Text>
                  )}
                  <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>(Segure para remover)</Text>
                </TouchableOpacity>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                <TouchableOpacity onPress={() => setUploadModalVisible(false)} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#E6E6E6' }}>
                  <Text style={{ color: '#333', fontWeight: '500' }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveDocument} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#2D6A4F' }}>
                  <Text style={{ color: 'white', fontWeight: '700' }}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
      <AddPaymentModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        onSave={({ member, amount, date, category, description }) => {
          addPayment({
            id: Date.now().toString(),
            title: category,
            amount: parseFloat(amount.replace(',', '.')),
            date: date.toISOString(),
            description,
            user: { id: '1', name: member },
          });
          setIncomes(prev => [
            {
              id: Date.now().toString(),
              title: category,
              amount: parseFloat(amount.replace(',', '.')),
              category,
              date: date.toISOString(),
              description,
              paidMembers: [member],
            },
            ...prev,
          ]);
        }}
      />
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