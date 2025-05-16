import { Tabs } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { Chrome as Home, CalendarClock, ClipboardList, FileText, MessageSquare } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#2D6A4F',
        tabBarInactiveTintColor: '#6C584C',
        tabBarStyle: [
          styles.tabBar,
          { paddingBottom: insets.bottom + 12, minHeight: 64 + insets.bottom },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'home':
              return <Home size={size} color={color} />;
            case 'activities':
              return <CalendarClock size={size} color={color} />;
            case 'tasks':
              return <ClipboardList size={size} color={color} />;
            case 'documents':
              return <FileText size={size} color={color} />;
            case 'comments':
              return <MessageSquare size={size} color={color} />;
            default:
              return null;
          }
        },
        tabBarLabel: (() => {
          switch (route.name) {
            case 'home':
              return 'Painel';
            case 'activities':
              return 'Atividades';
            case 'tasks':
              return 'Tarefas';
            case 'documents':
              return 'Documentos';
            case 'comments':
              return 'Comentários';
            default:
              return '';
          }
        })(),
      })}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Painel',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          tabBarLabel: 'Painel',
        }}
      />
      <Tabs.Screen
        name="activities/index"
        options={{
          title: 'Atividades',
          tabBarIcon: ({ color, size }) => <CalendarClock size={size} color={color} />,
          tabBarLabel: 'Atividades',
        }}
      />
      <Tabs.Screen
        name="tasks/index"
        options={{
          title: 'Tarefas',
          tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
          tabBarLabel: 'Tarefas',
        }}
      />
      <Tabs.Screen
        name="documents/index"
        options={{
          title: 'Documentos',
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
          tabBarLabel: 'Documentos',
        }}
      />
      <Tabs.Screen
        name="comments/index"
        options={{
          title: 'Comentários',
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
          tabBarLabel: 'Comentários',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E6E6E6',
    marginBottom: 0,
    paddingTop: 5,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});