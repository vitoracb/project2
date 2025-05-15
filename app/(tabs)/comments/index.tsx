import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommentCard, Comment } from '@/components/comments/CommentCard';
import { Paperclip, Send } from 'lucide-react-native';

// Mock data for comments
const mockComments: Comment[] = [
  {
    id: '1',
    content: 'I noticed the irrigation system in the east field needs maintenance. There seems to be a leak in one of the main pipes.',
    attachments: [],
    createdAt: '2025-05-12T10:30:00Z',
    user: {
      id: '1',
      name: 'John Smith',
    },
  },
  {
    id: '2',
    content: 'The new tractor parts arrived yesterday. I\'ve stored them in the equipment shed.',
    attachments: ['https://example.com/receipt123.pdf'],
    createdAt: '2025-05-11T14:15:00Z',
    user: {
      id: '2',
      name: 'Anna Johnson',
    },
  },
  {
    id: '3',
    content: 'I\'ll check the irrigation system tomorrow morning.',
    attachments: [],
    createdAt: '2025-05-12T15:45:00Z',
    user: {
      id: '3',
      name: 'Robert Davis',
    },
    parentId: '1',
  },
  {
    id: '4',
    content: 'We need to schedule the annual soil testing soon. The best time would be before the next planting season.',
    attachments: ['https://example.com/soil-testing-guide.pdf', 'https://example.com/last-year-results.xlsx'],
    createdAt: '2025-05-10T09:20:00Z',
    user: {
      id: '2',
      name: 'Anna Johnson',
    },
  },
];

export default function CommentsScreen() {
  const [message, setMessage] = useState('');
  
  const renderComment = ({ item }: { item: Comment }) => {
    if (item.parentId) {
      return <CommentCard comment={item} isReply />;
    }
    
    // Find replies to this comment
    const replies = mockComments.filter(comment => comment.parentId === item.id);
    
    return (
      <View style={styles.commentThread}>
        <CommentCard comment={item} />
        {replies.map(reply => (
          <CommentCard key={reply.id} comment={reply} isReply />
        ))}
      </View>
    );
  };
  
  // Filter out replies to show only parent comments in the main list
  const parentComments = mockComments.filter(comment => !comment.parentId);
  
  const sendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Comentários</Text>
      </View>
      
      <FlatList
        data={parentComments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        contentContainerStyle={styles.commentsList}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TouchableOpacity style={styles.attachButton}>
          <Paperclip size={20} color="#6C584C" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Digite uma mensagem..."
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !message.trim() && styles.disabledSendButton]} 
          onPress={sendMessage}
          disabled={!message.trim()}
        >
          <Send size={20} color={message.trim() ? "#FFFFFF" : "#A0A0A0"} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F9',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D6A4F',
  },
  commentsList: {
    padding: 16,
    paddingBottom: 80,
  },
  commentThread: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSendButton: {
    backgroundColor: '#E6E6E6',
  },
});