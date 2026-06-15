import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import useTheme from '../hooks/useTheme'

export default function AIInsightCard({ insight }) {
  const { colors } = useTheme()

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.headerRow}>
        <Ionicons name="sparkles" size={16} color={colors.primary} />
        <Text style={[styles.headerText, { color: colors.primary }]}>AI Insight</Text>
      </View>
      <Text style={[styles.insightText, { color: colors.textPrimary }]}>{insight}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  insightText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500'
  }
})
