import React from 'react';
import { ActionSheetIOS, Platform, Alert, TouchableOpacity, Text } from 'react-native';
import { useCategories } from '../../app/context/CategoriesContext';

interface CategoryPickerProps {
  value: string;
  onChange: (v: string) => void;
  options?: string[];
}

export function CategoryPicker({ value, onChange, options }: CategoryPickerProps) {
  const { categories } = useCategories();
  const categoryList = options || categories.map(c => c.name);
  return (
    <TouchableOpacity
      onPress={() => {
        if (Platform.OS === 'ios') {
          ActionSheetIOS.showActionSheetWithOptions(
            {
              options: [...categoryList, 'Cancelar'],
              cancelButtonIndex: categoryList.length,
            },
            (buttonIndex) => {
              if (buttonIndex < categoryList.length) {
                onChange(categoryList[buttonIndex]);
              }
            }
          );
        } else {
          Alert.alert(
            'Selecione a categoria',
            undefined,
            [
              ...categoryList.map((name) => ({
                text: name,
                onPress: () => onChange(name),
              })),
              { text: 'Cancelar', style: 'cancel' },
            ]
          );
        }
      }}
      style={{
        borderWidth: 1,
        borderColor: '#E6E6E6',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: '#F0F0F0',
      }}
    >
      <Text style={{ color: value ? '#333' : '#888', fontWeight: '500' }}>
        {value || 'Selecione'}
      </Text>
    </TouchableOpacity>
  );
} 