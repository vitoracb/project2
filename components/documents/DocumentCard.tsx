import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { FileText, Download, Trash2 } from 'lucide-react-native';

export type DocumentCategory = 'DEED' | 'MAP' | 'CERTIFICATE' | 'RECEIPT' | 'OTHER';

export interface Document {
  id: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  uploader: {
    id: string;
    name: string;
  };
}

interface DocumentCardProps {
  document: Document;
  onPress?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
}

export function DocumentCard({ document, onPress, onDownload, onDelete }: DocumentCardProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  const getFileIcon = () => {
    // Could expand this to show different icons based on file type
    return (
      <View style={[styles.fileIconContainer, getFileTypeColor()]}>
        <FileText size={24} color="white" />
      </View>
    );
  };
  
  const getFileTypeColor = () => {
    const colors = {
      DEED: { backgroundColor: '#2D6A4F' },
      MAP: { backgroundColor: '#40916C' },
      CERTIFICATE: { backgroundColor: '#52B788' },
      RECEIPT: { backgroundColor: '#74C69D' },
      OTHER: { backgroundColor: '#95D5B2' }
    };
    return colors[document.category];
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.container}>
          {getFileIcon()}
          <View style={styles.contentContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {document.title}
            </Text>
            {document.description ? (
              <Text style={styles.description} numberOfLines={2}>{document.description}</Text>
            ) : null}
            <Text style={styles.category}>
              {getCategoryLabel(document.category)}
            </Text>
            <View style={styles.infoContainer}>
              <Text style={styles.fileInfo}>
                {document.fileType.toUpperCase()} • {formatBytes(document.fileSize)}
              </Text>
              <Text style={styles.date}>{formatDate(document.createdAt)}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.downloadButton} 
            onPress={onDownload || onPress}
            activeOpacity={0.7}
          >
            <Download size={20} color="#2D6A4F" />
          </TouchableOpacity>
          {onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={onDelete}
              activeOpacity={0.7}
            >
              <Trash2 size={20} color="#DC2626" />
            </TouchableOpacity>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#2D6A4F',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fileInfo: {
    fontSize: 12,
    color: '#666666',
  },
  date: {
    fontSize: 12,
    color: '#666666',
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDEAEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  description: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
});