import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useMemo } from 'react'

import useTodoStore from '../store/todoStore'
import useTheme     from '../hooks/useTheme'
import InsightsSkeleton from '../components/InsightsSkeleton'

function dateKeyOffset(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

function buildLast7DayLabels() {
  const labels = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    labels.push({ key: d.toISOString().slice(0, 10), label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), isToday: i === 0 })
  }
  return labels
}

const WEEK_LABELS = buildLast7DayLabels()

export default function InsightsScreen() {
  const { colors } = useTheme()
  const { todos, hydrated } = useTodoStore()
  const [activeTab, setActiveTab] = useState('tasks')

  const stats = useMemo(() => {
    const last7Keys  = WEEK_LABELS.map((d) => d.key)
    // Exclude soft-deleted
    const weekTodos  = todos.filter((t) => last7Keys.includes(t.dateKey) && !t.deleted)
    const total      = weekTodos.length
    const completed  = weekTodos.filter((t) => t.completed).length
    const rate       = total > 0 ? Math.round((completed / total) * 100) : 0
    const perDay     = WEEK_LABELS.map(({ key }) => ({ key, count: weekTodos.filter((t) => t.dateKey === key && t.completed).length }))
    const maxDayCount = Math.max(...perDay.map((d) => d.count), 1)
    const best       = perDay.reduce((a, b) => (b.count > a.count ? b : a), perDay[0])
    let streak = 0
    for (let i = 0; i < WEEK_LABELS.length; i++) {
      const idx   = WEEK_LABELS.length - 1 - i
      if (perDay[idx]?.count > 0) streak++
      else break
    }
    const highDone = weekTodos.filter((t) => t.priority === 'high' && t.completed).length
    const highAll  = weekTodos.filter((t) => t.priority === 'high').length
    return { total, completed, rate, perDay, maxDayCount, best, streak, highDone, highAll }
  }, [todos])

  if (!hydrated) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Weekly Insights</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <InsightsSkeleton />
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Weekly Insights</Text>
        <View style={[styles.insightsBadge, { backgroundColor: colors.accentLight }]}>
          <Text style={{ fontSize: 18 }}>📊</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Toggle */}
        <View style={[styles.toggle, { backgroundColor: colors.border }]}>
          {['tasks', 'focus'].map((tab) => (
            <Pressable key={tab} onPress={() => setActiveTab(tab)}
              style={[styles.toggleItem, activeTab === tab && { backgroundColor: colors.surface }]}>
              <Text style={[styles.toggleText, { color: activeTab === tab ? colors.accent : colors.textSecondary },
                activeTab === tab && { fontWeight: '700' }]}>
                {tab === 'tasks' ? 'Tasks' : 'Focus Time'}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'focus' ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.comingSoon}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>⏱️</Text>
              <Text style={[styles.comingSoonTitle, { color: colors.textPrimary }]}>Focus Time Tracking</Text>
              <Text style={[styles.comingSoonText, { color: colors.textMuted }]}>Pomodoro-style timers — coming soon!</Text>
            </View>
          </View>
        ) : (
          <>
            {/* Completion Rate */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Completion Rate · Last 7 Days</Text>
              <View style={styles.metricRow}>
                <Text style={[styles.metric, { color: colors.textPrimary }]}>{stats.rate}%</Text>
                {stats.total > 0 && (
                  <View style={[styles.trendBadge, { backgroundColor: stats.rate >= 70 ? colors.successLight : colors.warningLight }]}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: stats.rate >= 70 ? colors.success : colors.warning }}>
                      {stats.rate >= 70 ? '↗ On track' : '↘ Keep going'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.subText, { color: colors.textSecondary }]}>
                {stats.total > 0
                  ? `You finished ${stats.completed} of ${stats.total} tasks this week.`
                  : 'No tasks logged this week yet.'}
              </Text>
            </View>

            {/* Bar Chart */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Daily Activity</Text>
              <Text style={[styles.cardSubLabel, { color: colors.textMuted }]}>Tasks completed per day</Text>
              <View style={styles.chart}>
                {stats.perDay.map(({ key, count }, i) => {
                  const isToday  = WEEK_LABELS[i]?.isToday
                  const barH     = Math.max(4, Math.round((count / stats.maxDayCount) * 110))
                  const dayLabel = WEEK_LABELS[i]?.label ?? ''
                  return (
                    <View key={key} style={styles.barItem}>
                      <Text style={[styles.barCount, { color: colors.textMuted }]}>{count > 0 ? count : ''}</Text>
                      <View style={[styles.bar, { height: barH, backgroundColor: isToday ? colors.accent : count > 0 ? colors.accentDim : colors.border }]} />
                      <Text style={[styles.dayLabel, { color: isToday ? colors.accent : colors.textMuted }, isToday && { fontWeight: '700' }]}>{dayLabel}</Text>
                    </View>
                  )
                })}
              </View>
            </View>

            {/* Highlights */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Highlights</Text>
            {[
              { icon: '⚡', title: 'Most Productive Day', text: stats.best.count > 0 ? `You crushed it on ${WEEK_LABELS.find((d) => d.key === stats.best.key)?.label ?? '–'} with ${stats.best.count} completed task${stats.best.count !== 1 ? 's' : ''}.` : 'Complete tasks this week to see your best day!' },
              { icon: '🔥', title: `${stats.streak}-Day Streak`, text: stats.streak > 1 ? `${stats.streak} consecutive days of completions!` : stats.streak === 1 ? 'You completed tasks today — keep it up!' : 'Start completing tasks daily to build a streak!' },
              { icon: '🎯', title: 'High Priority Focus', text: stats.highAll > 0 ? `Completed ${stats.highDone} of ${stats.highAll} high-priority tasks (${Math.round((stats.highDone / stats.highAll) * 100)}%).` : 'No high-priority tasks this week.' },
            ].map(({ icon, title, text }) => (
              <View key={title} style={[styles.insightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.insightIcon, { backgroundColor: colors.accentLight }]}>
                  <Text>{icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.insightTitle, { color: colors.textPrimary }]}>{title}</Text>
                  <Text style={[styles.insightText, { color: colors.textSecondary }]}>{text}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:         { flex: 1 },
  titleRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  title:        { fontSize: 26, fontWeight: '700' },
  insightsBadge:{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  content:      { padding: 16, paddingBottom: 120 },
  toggle:       { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 16 },
  toggleItem:   { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  toggleText:   { fontSize: 14, fontWeight: '500' },
  card:         { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  cardLabel:    { fontSize: 13, marginBottom: 4 },
  metricRow:    { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginBottom: 6 },
  metric:       { fontSize: 44, fontWeight: '800', lineHeight: 52 },
  trendBadge:   { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  subText:      { fontSize: 14, lineHeight: 20 },
  cardTitle:    { fontSize: 17, fontWeight: '700' },
  cardSubLabel: { fontSize: 13, marginBottom: 16, marginTop: 2 },
  chart:        { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 140 },
  barItem:      { flex: 1, alignItems: 'center' },
  barCount:     { fontSize: 10, marginBottom: 4, height: 14 },
  bar:          { width: 14, borderRadius: 6, marginBottom: 6 },
  dayLabel:     { fontSize: 11 },
  sectionTitle: { fontSize: 19, fontWeight: '700', marginBottom: 12 },
  insightCard:  { flexDirection: 'row', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1 },
  insightIcon:  { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  insightTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  insightText:  { fontSize: 13, lineHeight: 19 },
  comingSoon:   { alignItems: 'center', paddingVertical: 24 },
  comingSoonTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  comingSoonText:  { fontSize: 13, textAlign: 'center', lineHeight: 20 },
})
