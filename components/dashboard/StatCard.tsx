import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export function StatCard({ title, value, icon, trend, color = '#2D6A4F' }: StatCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {icon && <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>{icon}</View>}
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {trend && (
        <View style={styles.trendContainer}>
          <View
            style={[
              styles.trendBadge,
              { backgroundColor: trend.isPositive ? '#D1FAE5' : '#FEE2E2' },
            ]}
          >
            <Text
              style={[
                styles.trendValue,
                { color: trend.isPositive ? '#059669' : '#DC2626' },
              ]}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </Text>
          </View>
          <Text style={styles.trendLabel}>from last month</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    color: '#6C584C',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendLabel: {
    fontSize: 12,
    color: '#6C584C',
    opacity: 0.7,
  },
});