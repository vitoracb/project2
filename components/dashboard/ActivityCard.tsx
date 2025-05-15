import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { Clock } from 'lucide-react-native';

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
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = () => {
    // Could expand this to show different icons based on activity type
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
          {activity.action} a {formatEntityType(activity.entityType)}
        </Text>
        <Text style={styles.details}>
          {activity.details?.title || activity.details?.name || ''}
        </Text>
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
});