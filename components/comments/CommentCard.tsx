import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ActionSheetIOS, Alert, Platform, Modal } from 'react-native';
import { Card } from '../ui/Card';
import { Paperclip, FileText, ThumbsUp, MessageCircle, Send, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as WebBrowser from 'expo-web-browser';

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
  onReply?: (parentId: string, content: string, attachments: string[]) => void;
  onDelete?: (commentId: string) => void;
  userId?: string;
}

export function CommentCard({ comment, isReply = false, onReply, onDelete, userId }: CommentCardProps) {
  const [likes, setLikes] = useState(0);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<string[]>([]);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [modalImageUri, setModalImageUri] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLike = () => setLikes(l => l + 1);
  const handleReply = () => setShowReplyInput(v => !v);
  const handleSendReply = () => {
    if (replyText.trim() && onReply) {
      onReply(comment.id, replyText, replyAttachments);
      setReplyText('');
      setReplyAttachments([]);
      setShowReplyInput(false);
    }
  };

  const handleAddReplyAttachment = async () => {
    const handlePick = async (type: 'photo' | 'file') => {
      if (type === 'photo') {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
        if (!result.canceled && result.assets && result.assets[0]?.uri) {
          setReplyAttachments(prev => [...prev, result.assets[0].uri]);
        }
      } else if (type === 'file') {
        const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: true });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          setReplyAttachments(prev => [
            ...prev,
            ...result.assets.map(asset => asset.uri)
          ]);
        }
      }
    };
    if (Platform.OS === 'ios') {
      const options = ['Foto', 'Arquivo', 'Cancelar'];
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 2,
        },
        async (buttonIndex) => {
          if (buttonIndex === 0) await handlePick('photo');
          else if (buttonIndex === 1) await handlePick('file');
        }
      );
    } else {
      Alert.alert(
        'Adicionar anexo',
        'Escolha o tipo de anexo',
        [
          { text: 'Foto', onPress: () => handlePick('photo') },
          { text: 'Arquivo', onPress: () => handlePick('file') },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    }
  };

  const handleOpenAttachment = (uri: string) => {
    if (uri.match(/\.(jpg|jpeg|png|gif)$/i)) {
      setModalImageUri(uri);
      setImageModalVisible(true);
    } else {
      WebBrowser.openBrowserAsync(uri);
    }
  };

  const handleRemoveReplyAttachment = (idx: number) => {
    Alert.alert(
      'Remover anexo',
      'Deseja remover este anexo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => {
            setReplyAttachments(prev => prev.filter((_, i) => i !== idx));
          }
        }
      ]
    );
  };

  return (
    <Card 
      style={isReply ? [styles.card, styles.replyCard] : [styles.card] as any}
      flat
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {comment.user?.name?.charAt(0) || '?'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{comment.user?.name || 'Usuário'}</Text>
          <Text style={styles.timestamp}>{formatDate(comment.createdAt)}</Text>
        </View>
        {/* Lixeira só aparece se for o autor */}
        {userId === comment.user.id && onDelete && (
          <TouchableOpacity style={styles.trashButton} onPress={() => onDelete(comment.id)}>
            <Trash2 size={20} color="#DC2626" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={isReply ? styles.replyCardContent : styles.content}>{comment.content || ''}</Text>
      {comment.attachments && comment.attachments.length > 0 && (
        <View style={styles.attachments}>
          <View style={styles.attachmentHeader}>
            <Paperclip size={14} color="#6C584C" />
            <Text style={styles.attachmentTitle}>
              {comment.attachments.length} Anexo{comment.attachments.length > 1 ? 's' : ''}
            </Text>
          </View>
          {comment.attachments.map((attachment, index) => (
            <TouchableOpacity key={index} style={styles.attachmentItem} onPress={() => handleOpenAttachment(attachment)}>
              <FileText size={14} color="#2D6A4F" />
              <Text style={styles.attachmentName} numberOfLines={1}>
                {typeof attachment === 'string' ? attachment.split('/').pop() : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {/* Botões de ação */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <ThumbsUp size={16} color={likes > 0 ? '#2D6A4F' : '#6C584C'} />
          <Text style={styles.actionText}>{likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleReply}>
          <MessageCircle size={16} color="#6C584C" />
          <Text style={styles.actionText}>Responder</Text>
        </TouchableOpacity>
      </View>
      {/* Campo de resposta */}
      {showReplyInput && (
        <View style={styles.replyInputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={handleAddReplyAttachment}>
            <Paperclip size={18} color="#6C584C" />
          </TouchableOpacity>
          <TextInput
            style={styles.replyInput}
            placeholder="Digite sua resposta..."
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <TouchableOpacity style={styles.replySendButton} onPress={handleSendReply}>
            <Send size={22} color="white" />
          </TouchableOpacity>
        </View>
      )}
      {/* Preview dos anexos da resposta antes de enviar */}
      {showReplyInput && replyAttachments.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
          {replyAttachments.map((uri, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleOpenAttachment(uri)}
              onLongPress={() => handleRemoveReplyAttachment(idx)}
              delayLongPress={300}
              style={{ marginRight: 8, marginBottom: 8 }}
            >
              {uri.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <Image source={{ uri }} style={{ width: 36, height: 36, borderRadius: 8 }} />
              ) : (
                <View style={{ backgroundColor: '#E8F4EA', borderRadius: 8, padding: 6, flexDirection: 'row', alignItems: 'center' }}>
                  <FileText size={14} color="#2D6A4F" />
                  <Text style={{ marginLeft: 4, maxWidth: 60 }} numberOfLines={1}>{uri.split('/').pop()}</Text>
            </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
      {/* Modal de preview de imagem */}
      <Modal visible={imageModalVisible} transparent animationType="fade" onRequestClose={() => setImageModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' }}>
          {modalImageUri && (
            <Image source={{ uri: modalImageUri }} style={{ width: '90%', height: '70%', resizeMode: 'contain', borderRadius: 16 }} />
          )}
          <TouchableOpacity onPress={() => setImageModalVisible(false)} style={{ marginTop: 24, padding: 16 }}>
            <Text style={{ color: 'white', fontSize: 18 }}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
  },
  replyCard: {
    marginLeft: 24,
    borderLeftWidth: 2,
    borderLeftColor: '#E8F4EA',
    padding: 10,
    backgroundColor: '#F7F7F7',
    marginBottom: 8,
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
  replyCardContent: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
    marginBottom: 8,
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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: '#F7F7F7',
    marginRight: 8,
  },
  actionText: {
    fontSize: 13,
    color: '#6C584C',
    marginLeft: 4,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 8,
  },
  replyInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    marginRight: 8,
    minHeight: 36,
    maxHeight: 80,
  },
  replySendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  trashButton: {
    marginLeft: 8,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});