import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { Clock, Trash2, DollarSign, FileText, ClipboardList, Calendar, MessageCircle } from 'lucide-react-native';

export interface Activity {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: any;
  createdAt: string;
  user: {
    name: string;
  };
}

interface ActivityCardProps {
  activity: Activity;
  onDelete?: (id: string) => void;
}

export function ActivityCard({ activity, onDelete }: ActivityCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getActivityIcon = () => {
    if (activity.entityType === 'expense' || activity.entityType === 'payment') {
      return <DollarSign size={18} color="#2D6A4F" />;
    }
    if (activity.entityType === 'document') {
      return <FileText size={18} color="#2D6A4F" />;
    }
    if (activity.entityType === 'task') {
      return <ClipboardList size={18} color="#2D6A4F" />;
    }
    if (activity.entityType === 'event') {
      return <Calendar size={18} color="#2D6A4F" />;
    }
    if (activity.entityType === 'comment') {
      return <MessageCircle size={18} color="#6C584C" />;
    }
    return <Clock size={18} color="#40916C" />;
  };

  const formatEntityType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Card flat style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {getActivityIcon()}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{activity.user.name}</Text>
          <Text style={styles.timestamp}>{formatDate(activity.createdAt)}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.action}>
          {getActivityIcon()} <Text style={{fontWeight: 'bold', color: '#2D6A4F'}}>{activity.details?.title || activity.details?.name || activity.details?.content || ''}</Text>
          {((activity.entityType === 'task' && activity.details?.dueDate) || (activity.entityType === 'event' && activity.details?.date)) && (
            <Text style={{ color: '#666' }}>  {formatDate(activity.entityType === 'task' ? activity.details.dueDate : activity.details.date)}</Text>
          )}
        </Text>
        <Text style={styles.details}>
          {activity.details?.title || activity.details?.name || activity.details?.content || ''}
        </Text>
        {onDelete && (
          <TouchableOpacity
            style={styles.trashButton}
            onPress={() => {
              console.log('Deletar:', activity.id);
              onDelete(activity.id);
            }}
          >
            <Trash2 size={18} color="#DC2626" />
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#2D6A4F',
  },
  timestamp: {
    fontSize: 12,
    color: '#6C584C',
    opacity: 0.7,
  },
  content: {
    paddingLeft: 48,
  },
  action: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: '#666666',
  },
  trashButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    padding: 4,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
  },
});