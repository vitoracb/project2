import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Clock, CircleCheck as CheckCircle2 } from 'lucide-react-native';

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
}

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
}

export function TaskCard({ task, onPress }: TaskCardProps) {
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
        <View style={styles.header}>
          <Badge
            text={getPriorityLabel()}
            variant={getPriorityBadgeVariant()}
            style={styles.badge}
          />
          {task.status === 'DONE' && (
            <View style={styles.completedIndicator}>
              <CheckCircle2 size={16} color="#059669" />
              <Text style={styles.completedText}>Concluída</Text>
            </View>
          )}
        </View>
        <Text style={styles.title}>{task.title}</Text>
        {task.description && (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        )}
        <View style={styles.footer}>
          {task.dueDate && (
            <View style={styles.dueDate}>
              <Clock size={14} color={isOverdue() ? '#DC2626' : '#666666'} />
              <Text style={[
                styles.dueDateText, 
                isOverdue() && styles.overdue
              ]}>
                {formatDate(task.dueDate)}
              </Text>
            </View>
          )}
          {task.assignee && (
            <View style={styles.assignee}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {task.assignee.name.charAt(0)}
                </Text>
              </View>
              <Text style={styles.assigneeName} numberOfLines={1}>
                {task.assignee.name}
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
  badge: {
    marginRight: 8,
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
});