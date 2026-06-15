import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import useTheme from '../../hooks/useTheme'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TOPICS = [
  { name: 'AI & ML', percent: '50%', color: '#6366f1' },
  { name: 'Learning', percent: '25%', color: '#0ea5e9' },
  { name: 'Career', percent: '16%', color: '#10b981' },
  { name: 'Others', percent: '9%', color: '#f59e0b' }
]

export default function InsightsScreen() {
  const { colors } = useTheme()
  const [tab, setTab] = useState('Overview')

  // Generate a mock 7x24 heatmap (Mon-Sun, 24 hours). We'll group by 2h blocks for simplicity = 12 columns
  const heatmapData = Array.from({ length: 7 }).map(() => 
    Array.from({ length: 12 }).map(() => Math.random() > 0.6 ? Math.random() : 0)
  )

  const getOpacity = (val) => {
    if (val === 0) return 0.1
    if (val < 0.4) return 0.4
    if (val < 0.7) return 0.7
    return 1
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        
        {/* Segmented Control */}
        <View style={[styles.segmentContainer, { backgroundColor: colors.surface }]}>
          {['Overview', 'Trends', 'Focus', 'Activity'].map(t => (
            <TouchableOpacity 
              key={t} 
              style={[styles.segmentBtn, tab === t && { backgroundColor: colors.card }]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.segmentText, { color: tab === t ? colors.textPrimary : colors.textSecondary }]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Top Topics */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 32 }]}>Top Topics</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Topics you've worked on the most</Text>
        
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Fake Donut Chart via CSS */}
          <View style={[styles.donut, { borderColor: '#6366f1' }]}>
            <View style={[styles.donutInner, { backgroundColor: colors.card }]}>
              <Text style={[styles.donutTotal, { color: colors.textPrimary }]}>12</Text>
              <Text style={[styles.donutLabel, { color: colors.textSecondary }]}>Total Items</Text>
            </View>
          </View>
          
          <View style={styles.legend}>
            {TOPICS.map(t => (
              <View key={t.name} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: t.color }]} />
                <Text style={[styles.legendName, { color: colors.textSecondary }]}>{t.name}</Text>
                <Text style={[styles.legendPercent, { color: colors.textPrimary }]}>{t.percent}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Heatmap */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginTop: 32 }]}>Day-wise Productivity</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Your productivity heatmap</Text>
        
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 16 }]}>
          <View style={styles.heatmapGrid}>
            <View style={styles.dayLabels}>
              {DAYS.map(d => <Text key={d} style={[styles.dayText, { color: colors.textSecondary }]}>{d}</Text>)}
            </View>
            <View style={styles.heatmapBlocks}>
              {heatmapData.map((row, rIdx) => (
                <View key={rIdx} style={styles.heatmapRow}>
                  {row.map((val, cIdx) => (
                    <View 
                      key={cIdx} 
                      style={[styles.heatmapCell, { backgroundColor: '#a855f7', opacity: getOpacity(val) }]} 
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
          <View style={styles.timeLabels}>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>12 AM</Text>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>6 AM</Text>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>12 PM</Text>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>6 PM</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  segmentContainer: {
    flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 16
  },
  segmentBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  segmentText: { fontSize: 13, fontWeight: '600' },
  
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, marginBottom: 16 },
  
  card: {
    flexDirection: 'row', padding: 24, borderRadius: 16, borderWidth: 1,
    alignItems: 'center'
  },
  
  donut: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 16, 
    justifyContent: 'center', alignItems: 'center',
    marginRight: 32
  },
  donutInner: {
    width: 88, height: 88, borderRadius: 44, position: 'absolute',
    justifyContent: 'center', alignItems: 'center'
  },
  donutTotal: { fontSize: 24, fontWeight: '700' },
  donutLabel: { fontSize: 10, textAlign: 'center' },
  
  legend: { flex: 1, gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  legendName: { flex: 1, fontSize: 13 },
  legendPercent: { fontSize: 13, fontWeight: '600' },

  heatmapGrid: { flexDirection: 'row', gap: 12 },
  dayLabels: { justifyContent: 'space-between', paddingVertical: 4 },
  dayText: { fontSize: 11, height: 16 },
  heatmapBlocks: { flex: 1, gap: 4 },
  heatmapRow: { flexDirection: 'row', justifyContent: 'space-between' },
  heatmapCell: { width: 16, height: 16, borderRadius: 4 },
  
  timeLabels: { flexDirection: 'row', justifyContent: 'space-between', marginLeft: 36, marginTop: 8 },
  timeText: { fontSize: 10 }
})
