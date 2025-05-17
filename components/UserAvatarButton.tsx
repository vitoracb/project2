import { useUser } from '@clerk/clerk-expo';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import React from 'react';

export function UserAvatarButton({ onPress }: { onPress?: () => void }) {
  const { user } = useUser();

  const initial = user?.firstName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <TouchableOpacity
      style={styles.avatar}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.avatarText}>{initial}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D6A4F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 