import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated from 'react-native-reanimated'
const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView)
import { useEffect, useState, useRef, useCallback } from 'react'
import DraggableFlatList from 'react-native-draggable-flatlist'
import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'


import useTodoStore from '../store/todoStore'
import useAuthStore from '../store/authStore'
import useAnimatedTheme from '../hooks/useAnimatedTheme'
import TodoItem     from '../components/TodoItem'
import TodoSkeleton from '../components/TodoSkeleton'

import { getDateKey } from '../utils/date'
import useUIStore from '../store/uiStore'
import { calculateStreak } from '../utils/streak'

import WalkthroughOverlay from '../components/WalkthroughOverlay'

const ITEM_HEIGHT = 64
const { width } = Dimensions.get('window')

export default function DashboardScreen() {
  const { animatedStyles, staticColors: colors, layout, typography } = useAnimatedTheme()
  const { user } = useAuthStore()

  const {
    todos,
    hydrated,
    hydrate,
    addTodo,
    deleteTodo,
    reorderTodos,
    persistTodos,
  } = useTodoStore()

  const { addPendingDeletion } = useUIStore()

  useEffect(() => {
    hydrate()
  }, [])

  const dateKey = getDateKey(new Date())
  const dayTodos = todos.filter((t) => t.dateKey === dateKey && !t.deleted)
  const activeTodos = dayTodos.filter((t) => !t.completed)
  const completedTodos = dayTodos.filter((t) => t.completed)
  const highPriorityCount = activeTodos.filter((t) => t.priority === 'high').length
  
  const completionRate = dayTodos.length > 0 ? Math.round((completedTodos.length / dayTodos.length) * 100) : 0
  const streak = calculateStreak(todos)
  const hasEnoughData = todos.length >= 5

  const hour = new Date().getHours()
  let greeting = 'Good Evening'
  if (hour < 12) greeting = 'Good Morning'
  else if (hour < 18) greeting = 'Good Afternoon'

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'User'

  function handleDelete(todo) {
    deleteTodo(todo.id)
    addPendingDeletion(todo.id, 'todo')
  }

  const renderItem = useCallback(
    ({ item, drag, isActive }) => (
      <TodoItem
        item={item}
        onDelete={handleDelete}
        onLongPress={drag}
        dragActive={isActive}
        dragDisabled={false}
      />
    ),
    []
  )

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <View>
          <Animated.Text style={[typography.headingL, animatedStyles.textPrimary]}>{greeting},</Animated.Text>
          <Animated.Text style={[typography.headingXL, animatedStyles.textPrimary]}>{firstName} 👋</Animated.Text>
          <Animated.Text style={[typography.bodyM, animatedStyles.textSecondary]}>Here's your overview</Animated.Text>
        </View>
        <TouchableOpacity style={styles.bellIcon}>
          <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Grid Stats */}
      <View style={styles.statsGrid}>
        <Animated.View style={[styles.statBox, { flex: 1.2 }, animatedStyles.bgCard, animatedStyles.border]}>
          <Animated.Text style={[styles.statBoxTitle, animatedStyles.textSecondary]}>Tasks Remaining</Animated.Text>
          <Animated.Text style={[styles.statBoxValue, animatedStyles.textPrimary]}>{activeTodos.length}</Animated.Text>
          <Animated.Text style={[styles.statBoxSub, highPriorityCount > 0 ? animatedStyles.textErrorColor : animatedStyles.textSecondary]}>
            {highPriorityCount} High Priority
          </Animated.Text>
        </Animated.View>
        <Animated.View style={[styles.statBox, { flex: 1 }, animatedStyles.bgCard, animatedStyles.border]}>
          <Animated.Text style={[styles.statBoxTitle, animatedStyles.textSecondary]}>Completed Today</Animated.Text>
          <Animated.Text style={[styles.statBoxValue, animatedStyles.textPrimary]}>{completedTodos.length}</Animated.Text>
          <Animated.Text style={[styles.statBoxSub, { color: colors.success }]}>Great progress!</Animated.Text>
        </Animated.View>
        <Animated.View style={[styles.statBox, { flex: 0.8 }, animatedStyles.bgCard, animatedStyles.border]}>
          <Animated.Text style={[styles.statBoxTitle, animatedStyles.textSecondary]}>Day Streak</Animated.Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="flame" size={20} color={colors.warning} />
            <Animated.Text style={[styles.statBoxValue, animatedStyles.textPrimary, { marginLeft: 4 }]}>{streak}</Animated.Text>
          </View>
        </Animated.View>
      </View>

      {/* Today's Progress Card */}
      {hasEnoughData ? (
        <Animated.View style={[styles.progressCard, animatedStyles.bgCard, animatedStyles.border]}>
          <View>
            <Animated.Text style={[styles.progressTitle, animatedStyles.textPrimary]}>Today's Progress</Animated.Text>
            <Animated.View style={[styles.ringContainer, animatedStyles.borderPrimary]}>
              <Animated.View style={[styles.ringInner, animatedStyles.bgCard]}>
                <Animated.Text style={[styles.ringText, animatedStyles.textPrimary]}>{completionRate}%</Animated.Text>
              </Animated.View>
            </Animated.View>
          </View>
          
          <View style={styles.barChartContainer}>
            {['S','M','T','W','T','F','S'].map((day, i) => (
              <View key={i} style={styles.barCol}>
                <Animated.View style={styles.barTrack}>
                  {/* Real data calculation should go here in the future, for now if enough data, just show a flat line or hide */}
                  <Animated.View style={[styles.barFill, { height: '10%' }, i === new Date().getDay() ? animatedStyles.bgPrimary : animatedStyles.bgBorder]} />
                </Animated.View>
                <Animated.Text style={[styles.barLabel, animatedStyles.textSecondary]}>{day}</Animated.Text>
              </View>
            ))}
          </View>
        </Animated.View>
      ) : null}

      {/* AI Insight Gradient Card */}
      <Animated.View
        style={[styles.aiInsightCard, animatedStyles.bgSurface, animatedStyles.border, { borderRadius: layout.radius.lg }]}
      >
        <View style={styles.aiHeaderRow}>
          <Ionicons name="sparkles" size={14} color={colors.primary} />
          <Animated.Text style={[typography.caption, animatedStyles.textPrimaryColor, { textTransform: 'uppercase' }]}>AI Insight</Animated.Text>
        </View>
        
        {hasEnoughData ? (
          <Animated.Text style={[typography.bodyM, animatedStyles.textPrimary, { lineHeight: 22 }]}>
            You complete <Animated.Text style={[animatedStyles.textPrimaryColor, { fontWeight: '700' }]}>{Math.round(todos.filter(t => t.completed).length / todos.length * 100)}%</Animated.Text> of your tasks on time. Great consistency!
          </Animated.Text>
        ) : (
          <Animated.Text style={[typography.bodyM, animatedStyles.textPrimary, { lineHeight: 22 }]}>
            Keep using Clarify to unlock personalized recommendations and productivity insights.
          </Animated.Text>
        )}
        <Ionicons name="sparkles" size={48} color={colors.primary} style={styles.brainIcon} />
      </Animated.View>

      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <Animated.Text style={[styles.sectionTitle, animatedStyles.textPrimary]}>Today's Tasks</Animated.Text>
        <TouchableOpacity>
          <Animated.Text style={[styles.viewAllText, animatedStyles.textPrimaryColor]}>View All</Animated.Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  if (!hydrated) {
    return (
      <AnimatedSafeAreaView style={[styles.safe, animatedStyles.bgBackground]}>
        <View style={{ padding: 16 }}>
          <TodoSkeleton /><TodoSkeleton /><TodoSkeleton />
        </View>
      </AnimatedSafeAreaView>
    )
  }

  return (
    <AnimatedSafeAreaView style={[styles.safe, animatedStyles.bgBackground]} edges={['top', 'left', 'right']}>
      <DraggableFlatList
        data={activeTodos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={<ListHeader />}
        contentContainerStyle={{ paddingBottom: 180 }}
        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
        onDragEnd={({ data }) => {
          reorderTodos([...data, ...completedTodos])
          requestAnimationFrame(() => requestAnimationFrame(persistTodos))
        }}
        showsVerticalScrollIndicator={false}
      />

      <WalkthroughOverlay />
    </AnimatedSafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greetingText: { fontSize: 24, fontWeight: '500' },
  nameText: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  subtitleText: { fontSize: 14 },
  bellIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'flex-end' },
  
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statBox: { borderRadius: 16, padding: 14, borderWidth: 1 },
  statBoxTitle: { fontSize: 10, fontWeight: '600', marginBottom: 8 },
  statBoxValue: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  statBoxSub: { fontSize: 10, fontWeight: '500' },
  
  progressCard: { borderRadius: 16, padding: 20, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  progressTitle: { fontSize: 12, fontWeight: '700', marginBottom: 16 },
  ringContainer: { width: 72, height: 72, borderRadius: 36, borderWidth: 5, justifyContent: 'center', alignItems: 'center' },
  ringInner: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  ringText: { fontSize: 18, fontWeight: '800' },
  
  barChartContainer: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', paddingTop: 20 },
  barCol: { alignItems: 'center', gap: 6 },
  barTrack: { width: 8, height: 50, borderRadius: 4, backgroundColor: 'transparent', justifyContent: 'flex-end' },
  barFill: { width: 8, borderRadius: 4 },
  barLabel: { fontSize: 10, fontWeight: '600' },

  aiInsightCard: { borderRadius: 16, padding: 20, borderWidth: 1, marginBottom: 24, overflow: 'hidden' },
  aiHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  aiTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  aiBody: { fontSize: 15, lineHeight: 22, width: '80%' },
  brainIcon: { position: 'absolute', right: -10, bottom: -10, opacity: 0.3 },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  viewAllText: { fontSize: 13, fontWeight: '600' }
})
