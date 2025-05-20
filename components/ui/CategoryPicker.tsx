import React, { useState } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useCategories } from '../../context/CategoriesContext';
interface CategoryPickerProps {
  value: string;
  onChange: (v: string) => void;
  options?: string[];
}

export function CategoryPicker({ value, onChange, options }: CategoryPickerProps) {
  const { categories } = useCategories();
  const categoryList = options || categories.map(c => c.name);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <View style={{ position: 'relative' }}>
      <TouchableOpacity
        onPress={() => setShowDropdown(v => !v)}
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
      {showDropdown && (
        <View style={{
          backgroundColor: 'white',
          borderWidth: 1,
          borderColor: '#E6E6E6',
          borderRadius: 8,
          position: 'absolute',
          zIndex: 10,
          width: '100%',
        }}>
          {categoryList.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                backgroundColor: value === cat ? '#D7F9E9' : 'white',
              }}
              onPress={() => {
                onChange(cat);
                setShowDropdown(false);
              }}
            >
              <Text style={{ color: value === cat ? '#2D6A4F' : '#333' }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
} 