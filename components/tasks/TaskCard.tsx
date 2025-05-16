import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { Clock, CircleCheck as CheckCircle2, Trash2, ArrowLeft, ArrowRight } from 'lucide-react-native';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  createdBy?: {
    id: string;
    name: string;
  };
}

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  onDelete?: (id: string) => void;
  onMoveLeft?: (id: string) => void;
  onMoveRight?: (id: string) => void;
}

export function TaskCard({ task, onPress, onDelete, onMoveLeft, onMoveRight }: TaskCardProps) {
  console.log('TaskCard:', task);

  const getPriorityBadgeVariant = () => {
    switch (task.priority) {
      case 'LOW':
        return 'success';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getPriorityLabel = () => {
    switch (task.priority) {
      case 'LOW':
        return 'Baixa';
      case 'MEDIUM':
        return 'Média';
      case 'HIGH':
        return 'Alta';
      default:
        return task.priority;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = () => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          {onMoveLeft && task.status !== 'TODO' ? (
            <TouchableOpacity
              onPress={e => { e.stopPropagation && e.stopPropagation(); onMoveLeft(task.id); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ padding: 4 }}
            >
              <ArrowLeft size={20} color="#2D6A4F" />
            </TouchableOpacity>
          ) : <View style={{ width: 28 }} />}

          {onMoveRight && task.status !== 'DONE' ? (
            <TouchableOpacity
              onPress={e => { e.stopPropagation && e.stopPropagation(); onMoveRight(task.id); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ padding: 4 }}
            >
              <ArrowRight size={20} color="#2D6A4F" />
            </TouchableOpacity>
          ) : <View style={{ width: 28 }} />}
        </View>
        <Text style={[styles.title, { marginBottom: 4 }]}>{task.title}</Text>
        {task.description && (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        )}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 8 }}>
          {onDelete && (
            <TouchableOpacity
              onPress={e => {
                e.stopPropagation && e.stopPropagation();
                onDelete(task.id);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2 size={20} color="#DC2626" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.footerColumn}>
          {task.createdBy && (
            <Text style={styles.userText}>{task.createdBy.name}</Text>
          )}
          {task.dueDate && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Clock size={14} color={isOverdue() ? '#DC2626' : '#666666'} />
              <Text style={[styles.dueDateText, isOverdue() && styles.overdue, { marginLeft: 4 }]}> 
                {formatDate(task.dueDate)}
              </Text>
            </View>
          )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 12,
    color: '#059669',
    marginLeft: 4,
    fontWeight: '500',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDateText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  overdue: {
    color: '#DC2626',
  },
  assignee: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  avatarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  assigneeName: {
    fontSize: 12,
    color: '#666666',
    maxWidth: 80,
  },
  userText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 8,
  },
  footerColumn: {
    marginTop: 8,
    alignItems: 'flex-start',
    paddingTop: 4,
  },
});