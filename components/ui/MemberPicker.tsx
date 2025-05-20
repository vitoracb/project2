import React, { useState } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useMembers } from '../../context/MembersContext';
import ReactNativeCalendar from 'react-native-calendars';

export function MemberPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { members } = useMembers();
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
          {members.map((m) => (
            <TouchableOpacity
              key={m.name}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                backgroundColor: value === m.name ? '#D7F9E9' : 'white',
              }}
              onPress={() => {
                onChange(m.name);
                setShowDropdown(false);
              }}
            >
              <Text style={{ color: value === m.name ? '#2D6A4F' : '#333' }}>{m.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
} 