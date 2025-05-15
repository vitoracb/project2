import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ text, variant = 'default', style, textStyle }: BadgeProps) {
  const getBadgeStyle = () => {
    switch (variant) {
      case 'default':
        return styles.defaultBadge;
      case 'primary':
        return styles.primaryBadge;
      case 'secondary':
        return styles.secondaryBadge;
      case 'success':
        return styles.successBadge;
      case 'warning':
        return styles.warningBadge;
      case 'danger':
        return styles.dangerBadge;
      default:
        return styles.defaultBadge;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'default':
        return styles.defaultText;
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'success':
        return styles.successText;
      case 'warning':
        return styles.warningText;
      case 'danger':
        return styles.dangerText;
      default:
        return styles.defaultText;
    }
  };

  return (
    <View style={[styles.badge, getBadgeStyle(), style]}>
      <Text style={[styles.text, getTextStyle(), textStyle]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  defaultBadge: {
    backgroundColor: '#F0F0F0',
  },
  defaultText: {
    color: '#666666',
  },
  primaryBadge: {
    backgroundColor: '#D7F9E9',
  },
  primaryText: {
    color: '#2D6A4F',
  },
  secondaryBadge: {
    backgroundColor: '#E8F4EA',
  },
  secondaryText: {
    color: '#40916C',
  },
  successBadge: {
    backgroundColor: '#D1FAE5',
  },
  successText: {
    color: '#059669',
  },
  warningBadge: {
    backgroundColor: '#FEF3C7',
  },
  warningText: {
    color: '#D97706',
  },
  dangerBadge: {
    backgroundColor: '#FEE2E2',
  },
  dangerText: {
    color: '#DC2626',
  },
});