import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, Modal, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { MemberPicker } from './MemberPicker';
import { CategoryPicker } from './CategoryPicker';

const PAYMENT_CATEGORIES = [
  'Mensalidade',
  'Taxa Extra',
  'E-Social',
  'Outros',
];

export interface AddPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    member: string;
    amount: string;
    date: Date;
    category: string;
    description: string;
  }) => void;
}

export function AddPaymentModal({ visible, onClose, onSave }: AddPaymentModalProps) {
  const [form, setForm] = useState({
    member: '',
    amount: '',
    date: new Date(),
    category: '',
    description: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = () => {
    if (!form.member || !form.amount || !form.category) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }
    onSave(form);
    setForm({ member: '', amount: '', date: new Date(), category: '', description: '' });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, width: '90%' }}>
            <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#2D6A4F', textAlign: 'center' }}>
              Adicionar Pagamento
            </Text>
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>Membro:</Text>
            <MemberPicker value={form.member} onChange={member => setForm(f => ({ ...f, member }))} />
            <TextInput
              style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16, color: '#333' }}
              placeholder="Valor (ex: 100.00)"
              keyboardType="numeric"
              value={form.amount}
              onChangeText={t => setForm(f => ({ ...f, amount: t.replace(/[^0-9.,]/g, '') }))}
            />
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>Data:</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{ borderWidth: 0, borderRadius: 8, padding: 10, marginBottom: 12, backgroundColor: '#F0F0F0', alignItems: 'flex-start' }}
            >
              <Text style={{ color: '#2D6A4F', fontWeight: '600', fontSize: 16 }}>{form.date.toLocaleDateString('pt-BR')}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 16 }}>
                <Calendar
                  onDayPress={day => {
                    const [year, month, dayNum] = day.dateString.split('-').map(Number);
                    setForm(f => ({ ...f, date: new Date(year, month - 1, dayNum) }));
                    setShowDatePicker(false);
                  }}
                  markedDates={{
                    [form.date.toISOString().split('T')[0]]: { selected: true, selectedColor: '#2D6A4F' }
                  }}
                  theme={{
                    selectedDayBackgroundColor: '#2D6A4F',
                    todayTextColor: '#2D6A4F',
                  }}
                  hideArrows={false}
                />
                <TouchableOpacity style={{ marginTop: 8, alignSelf: 'stretch', backgroundColor: '#E6E6E6', borderRadius: 8, padding: 12, alignItems: 'center' }} onPress={() => setShowDatePicker(false)}>
                  <Text style={{ color: '#333', fontWeight: '500' }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>Categoria:</Text>
            <CategoryPicker value={form.category} onChange={category => setForm(f => ({ ...f, category }))} options={PAYMENT_CATEGORIES} />
            <TextInput
              style={{ borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 8, padding: 10, marginBottom: 16, fontSize: 16, color: '#333' }}
              placeholder="Observação (opcional)"
              value={form.description}
              onChangeText={t => setForm(f => ({ ...f, description: t }))}
              multiline
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#E6E6E6' }}>
                <Text style={{ color: '#333', fontWeight: '500' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#2D6A4F' }}>
                <Text style={{ color: 'white', fontWeight: '700' }}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
} 