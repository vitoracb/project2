import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  ScrollView,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommentCard, Comment } from '@/components/comments/CommentCard';
import { Paperclip, Send, FileText } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as WebBrowser from 'expo-web-browser';
import { ActionSheetIOS, Alert } from 'react-native';
import { useComments } from '../../../context/CommentsContext';

const USER_ID = '0'; // id do usuário logado

export default function CommentsScreen() {
  const { comments, addComment, removeComment } = useComments();
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [modalImageUri, setModalImageUri] = useState<string | null>(null);
  
  const renderComment = ({ item }: { item: Comment }) => {
    const handleReply = (parentId: string, content: string, attachments: string[] = []) => {
      const newReply: Comment = {
        id: Date.now().toString(),
        content,
        attachments,
        createdAt: new Date().toISOString(),
        user: { id: USER_ID, name: 'Você' },
        parentId,
      };
      addComment(newReply);
    };
    const replies = comments.filter(comment => comment.parentId === item.id);
    return (
      <View style={styles.commentThread}>
        <CommentCard comment={item} isReply={!!item.parentId} onReply={handleReply} onDelete={handleDeleteComment} userId={USER_ID} />
        {replies.map(reply => (
          <React.Fragment key={reply.id}>
            {renderComment({ item: reply })}
          </React.Fragment>
        ))}
      </View>
    );
  };
  
  // Filter out replies to show only parent comments in the main list
  const parentComments = comments.filter(comment => !comment.parentId);
  
  // Função para abrir preview ou arquivo
  const handleOpenAttachment = (uri: string) => {
    if (uri.match(/\.(jpg|jpeg|png|gif)$/i)) {
      setModalImageUri(uri);
      setImageModalVisible(true);
    } else {
      WebBrowser.openBrowserAsync(uri);
    }
  };

  // Função para adicionar anexo
  const handleAddAttachment = async () => {
    const handlePick = async (type: 'photo' | 'file') => {
      if (type === 'photo') {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
        if (!result.canceled && result.assets && result.assets[0]?.uri) {
          setAttachments(prev => [...prev, result.assets[0].uri]);
        }
      } else if (type === 'file') {
        const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: true });
        if (!result.canceled && result.assets && result.assets.length > 0) {
          setAttachments(prev => [
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

  // Função para remover anexo antes do envio
  const handleRemoveAttachment = (idx: number) => {
    Alert.alert(
      'Remover anexo',
      'Deseja remover este anexo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => {
            setAttachments(prev => prev.filter((_, i) => i !== idx));
          }
        }
      ]
    );
  };

  const sendMessage = () => {
    if (message.trim()) {
      const newComment: Comment = {
        id: Date.now().toString(),
        content: message,
        attachments,
        createdAt: new Date().toISOString(),
        user: { id: USER_ID, name: 'Você' },
      };
      addComment(newComment);
      setMessage('');
      setAttachments([]);
    }
  };
  
  // Função para deletar comentário e suas respostas
  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      'Excluir comentário',
      'Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => {
            removeComment(commentId);
          }
        }
      ]
    );
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
        extraData={comments}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TouchableOpacity style={styles.attachButton} onPress={handleAddAttachment}>
          <Paperclip size={20} color="#6C584C" />
        </TouchableOpacity>
        {attachments.map((uri, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => handleOpenAttachment(uri)}
            onLongPress={() => handleRemoveAttachment(idx)}
            delayLongPress={300}
            style={{ marginRight: 6 }}
          >
            <Image source={{ uri }} style={{ width: 36, height: 36, borderRadius: 8 }} />
          </TouchableOpacity>
        ))}
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
      {/* Modal de preview de imagem do anexo antes do envio */}
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
    flexWrap: 'nowrap',
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
    minWidth: 40,
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