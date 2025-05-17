import React from 'react';
import { ActionSheetIOS, Platform, Alert, TouchableOpacity, Text } from 'react-native';
import { useMembers } from '../../app/context/MembersContext';

export function MemberPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { members } = useMembers();
  return (
    <TouchableOpacity
      onPress={() => {
        if (Platform.OS === 'ios') {
          ActionSheetIOS.showActionSheetWithOptions(
            {
              options: [...members.map(m => m.name), 'Cancelar'],
              cancelButtonIndex: members.length,
            },
            (buttonIndex) => {
              if (buttonIndex < members.length) {
                onChange(members[buttonIndex].name);
              }
            }
          );
        } else {
          Alert.alert(
            'Selecione o membro',
            undefined,
            [
              ...members.map((m) => ({
                text: m.name,
                onPress: () => onChange(m.name),
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