import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { Calendar as ReactNativeCalendar } from 'react-native-calendars';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  date: Date | null;
  setDate: (d: Date | null) => void;
  showCalendar: boolean;
  setShowCalendar: (v: boolean) => void;
  isEditing?: boolean;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  visible,
  onClose,
  onSave,
  title,
  setTitle,
  description,
  setDescription,
  date,
  setDate,
  showCalendar,
  setShowCalendar,
  isEditing = false,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        </TouchableWithoutFeedback>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, width: '90%' }}>
            <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#2D6A4F', textAlign: 'center' }}>
              {isEditing ? 'Edição de Atividade' : 'Nova Atividade'}
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16, color: '#333' }}
              placeholder="Título da atividade"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16, color: '#333', minHeight: 60 }}
              placeholder="Observações (opcional)"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                setTimeout(() => setShowCalendar(true), 300);
              }}
              style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 10, marginBottom: 12, backgroundColor: '#F0F0F0' }}
            >
              <Text style={{ fontSize: 16, color: '#333' }}>{date ? date.toLocaleDateString('pt-BR') : 'Selecionar data'}</Text>
            </TouchableOpacity>
            {showCalendar && (
              <View style={{ marginBottom: 12 }}>
                <ReactNativeCalendar
                  onDayPress={day => {
                    const [year, month, dayNum] = day.dateString.split('-').map(Number);
                    setDate(new Date(year, month - 1, dayNum));
                    setShowCalendar(false);
                  }}
                  markedDates={date ? { [date.toISOString().split('T')[0]]: {selected: true, selectedColor: '#2D6A4F'} } : {}}
                  theme={{ selectedDayBackgroundColor: '#2D6A4F', todayTextColor: '#2D6A4F' }}
                  hideArrows={false}
                />
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#E6E6E6' }}>
                <Text style={{ color: '#333', fontWeight: '500' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onSave} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#2D6A4F' }}>
                <Text style={{ color: 'white', fontWeight: '700' }}>{isEditing ? 'Salvar edição' : 'Salvar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}; 