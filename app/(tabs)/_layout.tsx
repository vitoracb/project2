import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, Platform } from 'react-native';
import { House, CalendarClock, ClipboardList, FileText, MessageSquare, DollarSign, Hammer } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#2D6A4F',
        tabBarInactiveTintColor: '#6C584C',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E6E6E6',
          paddingTop: 5,
          paddingBottom: Platform.OS === 'android' ? 20 : insets.bottom || 10,
          height: Platform.OS === 'android' ? 68 : 56 + (insets.bottom || 0),
        },
        tabBarLabel: (() => {
          switch (route.name) {
            case 'home':
              return 'Início';
            case 'activities':
              return 'Financeiro';
            case 'tasks':
              return 'Atividades';
            case 'documents':
              return 'Documentos';
            case 'comments':
              return 'Comentários';
            default:
              return '';
          }
        })(),
        tabBarItemStyle: { flex: 1 },
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'home':
              return <House size={size} color={color} />;
            case 'activities':
              return <DollarSign size={size} color={color} />;
            case 'tasks':
              return <Hammer size={size} color={color} />;
            case 'documents':
              return <FileText size={size} color={color} />;
            case 'comments':
              return <MessageSquare size={size} color={color} />;
            default:
              return null;
          }
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 4,
          flexWrap: 'nowrap',
          textAlign: 'center',
          includeFontPadding: false,
        },
      })}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Início',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <House size={size} color={color} />,
          tabBarLabel: 'Início',
        }}
      />
      <Tabs.Screen
        name="activities/index"
        options={{
          title: 'Financeiro',
          tabBarIcon: ({ color, size }) => <DollarSign size={size} color={color} />,
          tabBarLabel: 'Financeiro',
        }}
      />
      <Tabs.Screen
        name="tasks/index"
        options={{
          title: 'Atividades',
          tabBarIcon: ({ color, size }) => <Hammer size={size} color={color} />,
          tabBarLabel: 'Atividades',
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