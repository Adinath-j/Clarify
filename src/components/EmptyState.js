import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import useTheme from '../hooks/useTheme'

export default function EmptyState({ title, subtitle, icon }) {
  const { colors } = useTheme()

  return (
    <View style={styles.container}>
      <Ionicons name={icon || "planet-outline"} size={64} color={colors.primary} style={{ opacity: 0.8, marginBottom: 16 }} />
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 }
})
