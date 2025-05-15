import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Plus } from 'lucide-react-native';

const CATEGORIES = [
  'Mensalidade',
  'Taxa Extra',
  'Funcionário',
  'Insumos',
  'Infraestrutura',
  'Maquinário',
  'Mão de Obra',
  'Outros',
];

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (expense: any) => void;
}

export function AddExpenseModal({ visible, onClose, onSave }: AddExpenseModalProps) {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: CATEGORIES[0],
    date: new Date(),
    showCategoryDropdown: false,
    description: '',
    paymentMethod: 'Dinheiro',
    installments: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (!visible) {
      setForm({
        title: '',
        amount: '',
        category: CATEGORIES[0],
        date: new Date(),
        showCategoryDropdown: false,
        description: '',
        paymentMethod: 'Dinheiro',
        installments: '',
      });
      setShowDatePicker(false);
    }
  }, [visible]);

  const handleSave = () => {
    if (!form.title.trim() || !form.amount.trim()) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }
    onSave({
      ...form,
      amount: parseFloat(form.amount),
      date: form.date,
    });
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Despesa</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da despesa"
              value={form.title}
              onChangeText={text => setForm({ ...form, title: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Valor (ex: 100.00)"
              keyboardType="numeric"
              value={form.amount}
              onChangeText={text => setForm({ ...form, amount: text })}
            />
            <View style={styles.inputRow}>
              <Text style={styles.label}>Categoria:</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setForm({ ...form, showCategoryDropdown: !form.showCategoryDropdown })}
              >
                <Text style={styles.dropdownButtonText}>{form.category}</Text>
              </TouchableOpacity>
            </View>
            {form.showCategoryDropdown && (
              <View style={styles.dropdownList}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.dropdownItem,
                      form.category === cat && styles.dropdownItemSelected,
                    ]}
                    onPress={() => setForm({ ...form, category: cat, showCategoryDropdown: false })}
                  >
                    <Text style={{ color: form.category === cat ? '#2D6A4F' : '#333' }}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={styles.inputRow}>
              <Text style={styles.label}>Data:</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                <Text style={styles.dateText}>{form.date.toLocaleDateString('pt-BR')}</Text>
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <View style={styles.calendarModal}>
                <Calendar
                  onDayPress={day => {
                    const [year, month, dayNum] = day.dateString.split('-').map(Number);
                    setForm({ ...form, date: new Date(year, month - 1, dayNum) });
                    setShowDatePicker(false);
                  }}
                  markedDates={{
                    [form.date.toISOString().split('T')[0]]: {selected: true, selectedColor: '#2D6A4F'}
                  }}
                  theme={{
                    selectedDayBackgroundColor: '#2D6A4F',
                    todayTextColor: '#2D6A4F',
                  }}
                />
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
            <TextInput
              style={styles.input}
              placeholder="Observação (opcional)"
              value={form.description}
              onChangeText={text => setForm({ ...form, description: text })}
              multiline
            />
            <View style={styles.inputRow}>
              <Text style={styles.label}>Forma de pagamento:</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, { minWidth: 120 }]}
                onPress={() => setForm(f => ({ ...f, paymentMethod: f.paymentMethod === 'Dinheiro' ? 'Cartão de Crédito' : 'Dinheiro' }))}
              >
                <Text style={styles.dropdownButtonText}>{form.paymentMethod}</Text>
              </TouchableOpacity>
            </View>
            {form.paymentMethod === 'Cartão de Crédito' && (
              <View style={styles.inputRow}>
                <Text style={styles.label}>Parcelas:</Text>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Quantidade de parcelas"
                  keyboardType="numeric"
                  value={form.installments}
                  onChangeText={text => setForm({ ...form, installments: text.replace(/[^0-9]/g, '') })}
                />
              </View>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#2D6A4F',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
    minWidth: 80,
  },
  dateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  dateText: {
    fontSize: 16,
    color: '#2D6A4F',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E6E6E6',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2D6A4F',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F0F0F0',
    minWidth: 180,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownList: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    marginBottom: 12,
    marginLeft: 88,
    minWidth: 180,
    position: 'absolute',
    zIndex: 10,
    top: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownItemSelected: {
    backgroundColor: '#D7F9E9',
  },
  calendarModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignSelf: 'center',
    elevation: 4,
    zIndex: 20,
  },
}); 