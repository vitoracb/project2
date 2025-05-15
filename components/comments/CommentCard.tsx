import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Card } from '../ui/Card';
import { Paperclip } from 'lucide-react-native';

export interface Comment {
  id: string;
  content: string;
  attachments: string[];
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  parentId?: string;
}

interface CommentCardProps {
  comment: Comment;
  isReply?: boolean;
}

export function CommentCard({ comment, isReply = false }: CommentCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card 
      style={[
        styles.card, 
        isReply && styles.replyCard
      ]} 
      flat
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {comment.user.name.charAt(0)}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{comment.user.name}</Text>
          <Text style={styles.timestamp}>{formatDate(comment.createdAt)}</Text>
        </View>
      </View>
      <Text style={styles.content}>{comment.content}</Text>
      {comment.attachments.length > 0 && (
        <View style={styles.attachments}>
          <View style={styles.attachmentHeader}>
            <Paperclip size={14} color="#6C584C" />
            <Text style={styles.attachmentTitle}>
              {comment.attachments.length} Attachment{comment.attachments.length > 1 ? 's' : ''}
            </Text>
          </View>
          {comment.attachments.map((attachment, index) => (
            <View key={index} style={styles.attachmentItem}>
              <FileText size={14} color="#2D6A4F" />
              <Text style={styles.attachmentName} numberOfLines={1}>
                {attachment.split('/').pop()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

// Import FileText for the attachment icon
import { FileText } from 'lucide-react-native';

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
  },
  replyCard: {
    marginLeft: 24,
    borderLeftWidth: 2,
    borderLeftColor: '#E8F4EA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333333',
  },
  timestamp: {
    fontSize: 12,
    color: '#6C584C',
    opacity: 0.7,
  },
  content: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 12,
  },
  attachments: {
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    padding: 12,
  },
  attachmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6C584C',
    marginLeft: 6,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 8,
    marginTop: 4,
  },
  attachmentName: {
    fontSize: 12,
    color: '#333333',
    marginLeft: 6,
    flex: 1,
  },
});