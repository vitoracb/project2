import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DocumentCard, Document, DocumentCategory } from '@/components/documents/DocumentCard';
import { Button } from '@/components/ui/Button';
import { Upload, FileText, MapPin, FileCheck, Receipt, FileQuestion } from 'lucide-react-native';

// Mock data for documents
const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Property Deed',
    description: 'Original deed for the 200-acre property',
    category: 'DEED',
    fileUrl: 'https://example.com/deed.pdf',
    fileType: 'pdf',
    fileSize: 2500000,
    createdAt: '2023-01-15T10:30:00Z',
    uploader: {
      id: '1',
      name: 'John Smith',
    },
  },
  {
    id: '2',
    title: 'North Field Survey Map',
    category: 'MAP',
    fileUrl: 'https://example.com/map.pdf',
    fileType: 'pdf',
    fileSize: 5200000,
    createdAt: '2024-03-22T14:15:00Z',
    uploader: {
      id: '2',
      name: 'Anna Johnson',
    },
  },
  {
    id: '3',
    title: 'Water Rights Certificate',
    description: 'Legal certificate for water usage rights',
    category: 'CERTIFICATE',
    fileUrl: 'https://example.com/certificate.pdf',
    fileType: 'pdf',
    fileSize: 1800000,
    createdAt: '2024-05-10T09:45:00Z',
    uploader: {
      id: '3',
      name: 'Robert Davis',
    },
  },
  {
    id: '4',
    title: 'Equipment Purchase Receipt',
    category: 'RECEIPT',
    fileUrl: 'https://example.com/receipt.jpg',
    fileType: 'jpg',
    fileSize: 850000,
    createdAt: '2025-04-05T16:30:00Z',
    uploader: {
      id: '1',
      name: 'John Smith',
    },
  },
  {
    id: '5',
    title: 'Insurance Policy',
    description: 'Annual farm insurance policy documentation',
    category: 'OTHER',
    fileUrl: 'https://example.com/insurance.pdf',
    fileType: 'pdf',
    fileSize: 3200000,
    createdAt: '2025-01-30T11:20:00Z',
    uploader: {
      id: '2',
      name: 'Anna Johnson',
    },
  },
];

export default function DocumentsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'ALL'>('ALL');
  
  const filteredDocuments = selectedCategory === 'ALL' 
    ? mockDocuments 
    : mockDocuments.filter(doc => doc.category === selectedCategory);
  
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
      MAP: 'Mapa',
      CERTIFICATE: 'Certificado',
      RECEIPT: 'Recibo',
      OTHER: 'Outro'
    };
    return labels[category];
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
            onPress={() => console.log('View document', item.id)}
            onDownload={() => console.log('Download document', item.id)}
          />
        )}
        contentContainerStyle={styles.documentsList}
      />
    </SafeAreaView>
  );
}

// Import ScrollView for the horizontal categories
import { ScrollView } from 'react-native';

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