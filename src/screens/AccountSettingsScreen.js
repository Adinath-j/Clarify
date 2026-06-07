import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import useTheme from '../hooks/useTheme'
import { Ionicons } from '@expo/vector-icons'

export default function AccountSettingsScreen() {
  const { colors } = useTheme()
  const router = useRouter()

  const Row = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={24} color={colors.text} />
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PREFERENCES</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Row icon="color-palette-outline" label="Theme" />
          <Row icon="notifications-outline" label="Notifications" />
          <Row icon="globe-outline" label="Language" />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>AI FEATURES</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Row icon="sparkles-outline" label="AI Recommendations" />
          <Row icon="analytics-outline" label="Productivity Insights" />
        </View>
        
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>SUPPORT</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Row icon="help-circle-outline" label="Help Center" />
          <Row icon="document-text-outline" label="Terms of Service" />
          <Row icon="shield-checkmark-outline" label="Privacy Policy" />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 24, 
    paddingTop: 56, 
    paddingBottom: 16 
  },
  backButton: { padding: 4 },
  title: { fontSize: 20, fontWeight: '700' },
  content: { flex: 1, padding: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 16 },
  card: { borderRadius: 16, overflow: 'hidden' },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(0,0,0,0.05)' 
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 16, fontWeight: '500' }
})
