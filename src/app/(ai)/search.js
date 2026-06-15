import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import useTheme from '../../hooks/useTheme'

export default function AISearchScreen() {
  const { colors } = useTheme()
  const { q } = useLocalSearchParams()
  const [filter, setFilter] = useState('All')

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        
        {/* Search Query Pill */}
        <LinearGradient
          colors={['#6366f1', '#a855f7']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.queryPill}
        >
          <Text style={styles.queryText}>{q || 'Show me everything related to internships'}</Text>
        </LinearGradient>

        <View style={styles.headerRow}>
          <Ionicons name="sparkles" size={16} color={colors.primary} />
          <Text style={[styles.headerText, { color: colors.textSecondary }]}>Here's what I found</Text>
        </View>

        {/* Filters */}
        <View style={styles.filtersRow}>
          {['All 12', 'Tasks 4', 'Notes 8'].map(f => {
            const label = f.split(' ')[0]
            const active = filter === label || (filter === 'All' && label === 'All')
            return (
              <TouchableOpacity 
                key={f} 
                style={[
                  styles.filterPill, 
                  { backgroundColor: colors.card, borderColor: active ? colors.primary : colors.border }
                ]}
                onPress={() => setFilter(label)}
              >
                <Text style={[styles.filterText, { color: active ? colors.primary : colors.textSecondary }]}>
                  {f}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Results List */}
        <View style={styles.resultsList}>
          
          {/* Result 1: Task */}
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.resultHeader}>
              <Text style={[styles.resultType, { color: colors.textSecondary }]}>Task</Text>
              <Ionicons name="ellipse-outline" size={20} color={colors.textSecondary} />
            </View>
            <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>Apply for Product Internship at Google</Text>
            <View style={styles.tagsRow}>
              <View style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>Work</Text>
              </View>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>24 May, 2024</Text>
            </View>
          </View>

          {/* Result 2: Note */}
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.resultHeader}>
              <Text style={[styles.resultType, { color: colors.textSecondary }]}>Note</Text>
            </View>
            <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>Internship Preparation Plan</Text>
            <Text style={[styles.previewText, { color: colors.textSecondary }]} numberOfLines={2}>
              Resources, roadmap and timeline for summer internships...
            </Text>
            <View style={styles.tagsRow}>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>20 May, 2024</Text>
            </View>
          </View>

          {/* Result 3: Note */}
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.resultHeader}>
              <Text style={[styles.resultType, { color: colors.textSecondary }]}>Note</Text>
            </View>
            <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>Companies to Apply</Text>
            <Text style={[styles.previewText, { color: colors.textSecondary }]} numberOfLines={2}>
              Google, Microsoft, Notion, Linear, Figma, Stripe...
            </Text>
            <View style={styles.tagsRow}>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>18 May, 2024</Text>
            </View>
          </View>

        </View>

        <TouchableOpacity style={styles.loadMoreBtn}>
          <Text style={[styles.loadMoreText, { color: colors.primary }]}>Load more</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  queryPill: {
    padding: 16, borderRadius: 16, marginBottom: 24,
    shadowColor: '#6366f1', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
  },
  queryText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  headerText: { fontSize: 14, fontWeight: '500' },
  
  filtersRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  filterPill: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1
  },
  filterText: { fontSize: 13, fontWeight: '600' },
  
  resultsList: { gap: 16 },
  resultCard: {
    padding: 16, borderRadius: 16, borderWidth: 1
  },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  resultType: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  resultTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  previewText: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  
  tagsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: '700' },
  dateText: { fontSize: 12 },
  
  loadMoreBtn: { marginTop: 32, alignItems: 'center' },
  loadMoreText: { fontSize: 14, fontWeight: '600' }
})
