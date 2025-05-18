import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Image, Platform, ActionSheetIOS, Linking, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DocumentCard, Document, DocumentCategory } from '@/components/documents/DocumentCard';
import { Button } from '@/components/ui/Button';
import { Upload, FileText, MapPin, FileCheck, Receipt, FileQuestion } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useDocuments } from '../../context/DocumentsContext';

export default function DocumentsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'ALL'>('ALL');
  const { documents, addDocument, removeDocument } = useDocuments();
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: '' as '' | DocumentCategory,
    file: null as null | { uri: string; name: string; type: string },
    description: '',
  });
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  const filteredDocuments = selectedCategory === 'ALL' 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory);
  
  const getCategoryIcon = (category: DocumentCategory) => {
    switch (category) {
      case 'DEED':
        return <FileText size={24} color="#FFFFFF" />;
      case 'MAP':
        return <MapPin size={24} color="#FFFFFF" />;
      case 'CERTIFICATE':
        return <FileCheck size={24} color="#FFFFFF" />;
      case 'RECEIPT':
        return <Receipt size={24} color="#FFFFFF" />;
      case 'OTHER':
        return <FileQuestion size={24} color="#FFFFFF" />;
    }
  };
  
  const getCategoryColor = (category: DocumentCategory) => {
    switch (category) {
      case 'DEED':
        return '#2D6A4F';
      case 'MAP':
        return '#40916C';
      case 'CERTIFICATE':
        return '#52B788';
      case 'RECEIPT':
        return '#74C69D';
      case 'OTHER':
        return '#95D5B2';
    }
  };
  
  const getCategoryLabel = (category: DocumentCategory) => {
    const labels = {
      DEED: 'Escritura',
      MAP: 'Mapas',
      CERTIFICATE: 'Certificados',
      RECEIPT: 'Recibos',
      OTHER: 'Outros'
    };
    return labels[category];
  };
  
  const handlePickFile = async () => {
    Alert.alert(
      'Selecionar',
      'Escolha o tipo de arquivo',
      [
        { text: 'Foto', onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
            if (!result.canceled && result.assets && result.assets[0]) {
              setUploadForm(f => ({ ...f, file: { uri: result.assets[0].uri, name: result.assets[0].fileName || 'imagem.jpg', type: result.assets[0].type || 'image/jpeg' } }));
            }
          }
        },
        { text: 'Arquivo', onPress: async () => {
            const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
            if (!result.canceled && result.assets && result.assets[0]) {
              setUploadForm(f => ({ ...f, file: { uri: result.assets[0].uri, name: result.assets[0].name, type: result.assets[0].mimeType || 'application/octet-stream' } }));
            }
          }
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleSaveDocument = () => {
    if (!uploadForm.category) {
      Alert.alert('Selecione a categoria!');
      return;
    }
    if (!uploadForm.file) {
      Alert.alert('Selecione um arquivo ou foto!');
      return;
    }
    const newDoc: Document = {
      id: Date.now().toString(),
      title: uploadForm.title || (uploadForm.file && uploadForm.file.name) || '',
      category: uploadForm.category as DocumentCategory,
      fileUrl: uploadForm.file.uri,
      fileType: uploadForm.file.type.split('/').pop() || 'file',
      fileSize: 0,
      createdAt: new Date().toISOString(),
      uploader: { id: '0', name: 'Você' },
      description: uploadForm.description,
    };
    addDocument(newDoc);
    setUploadModalVisible(false);
    setUploadForm({ title: '', category: '', file: null, description: '' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Documentos</Text>
        <Button
          title="Enviar"
          size="small"
          icon={<Upload size={16} color="white" />}
          style={styles.uploadButton}
          onPress={() => setUploadModalVisible(true)}
        />
      </View>
      
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === 'ALL' && styles.selectedCategoryButton]}
            onPress={() => setSelectedCategory('ALL')}
          >
            <Text style={[styles.categoryText, selectedCategory === 'ALL' && styles.selectedCategoryText]}>
              Todos
            </Text>
          </TouchableOpacity>
          
          {(['DEED', 'MAP', 'CERTIFICATE', 'RECEIPT', 'OTHER'] as DocumentCategory[]).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton, 
                selectedCategory === category && styles.selectedCategoryButton,
                selectedCategory === category && { backgroundColor: `${getCategoryColor(category)}20` }
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(category) }]}>
                {getCategoryIcon(category)}
              </View>
              <Text 
                style={[
                  styles.categoryText, 
                  selectedCategory === category && styles.selectedCategoryText,
                  selectedCategory === category && { color: getCategoryColor(category) }
                ]}
              >
                {getCategoryLabel(category)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <FlatList
        data={filteredDocuments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DocumentCard 
            document={item} 
            onPress={() => {
              setPreviewDoc(item);
              setPreviewVisible(true);
            }}
            onDownload={() => console.log('Download document', item.id)}
            onDelete={() => {
              Alert.alert(
                'Excluir documento',
                'Tem certeza que deseja excluir este documento?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Excluir', style: 'destructive', onPress: () => removeDocument(item.id) },
                ]
              );
            }}
          />
        )}
        contentContainerStyle={styles.documentsList}
      />
      <Modal
        visible={uploadModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, width: '90%' }}>
              <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#2D6A4F', textAlign: 'center' }}>
                Enviar Documento
              </Text>
              <Text style={{ fontWeight: '600', marginBottom: 8 }}>Categoria</Text>
              <TouchableOpacity
                style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#F0F0F0' }}
                onPress={() => setShowCategoryDropdown(v => !v)}
              >
                <Text style={{ color: uploadForm.category ? '#333' : '#888', fontWeight: '500' }}>
                  {uploadForm.category ? getCategoryLabel(uploadForm.category as DocumentCategory) : 'Selecione a categoria'}
                </Text>
              </TouchableOpacity>
              {showCategoryDropdown && (
                <View style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, marginBottom: 12, backgroundColor: '#fff' }}>
                  {(['DEED', 'MAP', 'CERTIFICATE', 'RECEIPT', 'OTHER'] as DocumentCategory[]).map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}
                      onPress={() => {
                        setUploadForm(f => ({ ...f, category: cat }));
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text style={{ color: '#333', fontWeight: '500' }}>{getCategoryLabel(cat)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <Text style={{ fontWeight: '600', marginBottom: 8 }}>Nome do documento</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16, color: '#333' }}
                placeholder="Nome do documento"
                value={uploadForm.title}
                onChangeText={t => setUploadForm(f => ({ ...f, title: t }))}
              />
              <TextInput
                style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16, color: '#333', minHeight: 40 }}
                placeholder="Observações (opcional)"
                value={uploadForm.description}
                onChangeText={t => setUploadForm(f => ({ ...f, description: t }))}
                multiline
              />
              <TouchableOpacity
                style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#F0F0F0', alignItems: 'center' }}
                onPress={handlePickFile}
              >
                <Text style={{ color: '#2D6A4F', fontWeight: '600' }}>{uploadForm.file ? 'Alterar Documento' : 'Selecionar Documento'}</Text>
              </TouchableOpacity>
              {uploadForm.file && (
                <TouchableOpacity
                  onLongPress={() => {
                    Alert.alert(
                      'Remover arquivo',
                      'Deseja remover o arquivo selecionado?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Remover', style: 'destructive', onPress: () => setUploadForm(f => ({ ...f, file: null })) },
                      ]
                    );
                  }}
                  activeOpacity={0.8}
                  style={{ alignItems: 'center', marginBottom: 12 }}
                >
                  {uploadForm.file.type.startsWith('image') ? (
                    <Image source={{ uri: uploadForm.file.uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                  ) : (
                    <Text style={{ color: '#333' }}>{uploadForm.file.name}</Text>
                  )}
                  <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>(Segure para remover)</Text>
                </TouchableOpacity>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                <TouchableOpacity onPress={() => setUploadModalVisible(false)} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#E6E6E6' }}>
                  <Text style={{ color: '#333', fontWeight: '500' }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveDocument} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#2D6A4F' }}>
                  <Text style={{ color: 'white', fontWeight: '700' }}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Modal de preview */}
      <Modal
        visible={previewVisible && !!previewDoc}
        animationType="fade"
        transparent
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, width: '90%', alignItems: 'center' }}>
            {previewDoc && previewDoc.fileType.match(/jpg|jpeg|png|gif/i) ? (
              <Image source={{ uri: previewDoc.fileUrl }} style={{ width: 300, height: 400, resizeMode: 'contain', borderRadius: 12, marginBottom: 16 }} />
            ) : previewDoc ? (
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Visualização não suportada</Text>
                <Text style={{ color: '#666', marginBottom: 16 }}>Apenas imagens podem ser visualizadas aqui.</Text>
                <TouchableOpacity onPress={() => Linking.openURL(previewDoc.fileUrl)} style={{ backgroundColor: '#2D6A4F', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}>
                  <Text style={{ color: 'white', fontWeight: '600' }}>Abrir documento</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            <TouchableOpacity onPress={() => setPreviewVisible(false)} style={{ marginTop: 8, padding: 12 }}>
              <Text style={{ color: '#2D6A4F', fontSize: 16 }}>Fechar</Text>
            </TouchableOpacity>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D6A4F',
  },
  uploadButton: {
    borderRadius: 20,
  },
  categoriesContainer: {
    padding: 8,
  },
  categoriesScroll: {
    paddingHorizontal: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedCategoryButton: {
    backgroundColor: '#E8F4EA',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C584C',
  },
  selectedCategoryText: {
    color: '#2D6A4F',
    fontWeight: '600',
  },
  documentsList: {
    padding: 16,
    paddingTop: 8,
  },
});