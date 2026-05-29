import { View, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect, useState, useRef, useCallback } from 'react'
import DraggableFlatList from 'react-native-draggable-flatlist'
import * as Haptics from 'expo-haptics'

import useTodoStore from '../store/todoStore'
import useTheme     from '../hooks/useTheme'
import TodoItem     from '../components/TodoItem'
import TodoSkeleton from '../components/TodoSkeleton'
import FloatingActionButton from '../components/FloatingActionButton'
import AddTodoModal  from '../components/AddTodoModal'
import FilterChips   from '../components/FilterChips'
import DayHeader     from '../components/DayHeader'
import UndoSnackbar  from '../components/UndoSnackbar'
import { getDateKey } from '../utils/date'

const ITEM_HEIGHT = 64

export default function TodayScreen() {
  const { colors } = useTheme()

  const {
    todos,
    hydrated,
    hydrate,
    addTodo,
    deleteTodo,
    undoDeleteTodo,
    reorderTodos,
    persistTodos,
  } = useTodoStore()

  const [open, setOpen]                   = useState(false)
  const [activeFilters, setActiveFilters] = useState([])
  const [showUndo, setShowUndo]           = useState(false)
  const [selectedDate, setSelectedDate]   = useState(new Date())

  const dateKey        = getDateKey(selectedDate)
  const lastDeletedRef = useRef(null)
  const undoTimerRef   = useRef(null)
  const dragEnabled    = activeFilters.length === 0

  useEffect(() => {
    hydrate()
    return () => { if (undoTimerRef.current) clearTimeout(undoTimerRef.current) }
  }, [])

  // ─── Filter logic (exclude soft-deleted) ──────────────────────────────
  const dayTodos = todos.filter((t) => t.dateKey === dateKey && !t.deleted)

  const filteredTodos = dayTodos.filter((t) => {
    if (activeFilters.length === 0) return true
    return activeFilters.includes(t.priority) || activeFilters.includes(t.category)
  })

  const visibleTodos   = dragEnabled ? dayTodos : filteredTodos
  const activeTodos    = visibleTodos.filter((t) => !t.completed)
  const completedTodos = visibleTodos.filter((t) => t.completed)

  function toggleFilter(filter) {
    setActiveFilters((prev) =>
      prev.includes(filter.key) ? prev.filter((k) => k !== filter.key) : [...prev, filter.key]
    )
  }

  // ─── Soft-delete + undo ───────────────────────────────────────────────
  function handleDelete(todo) {
    lastDeletedRef.current = todo.id
    deleteTodo(todo.id) // soft delete — sets deleted: true
    setShowUndo(true)

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(() => {
      setShowUndo(false)
      lastDeletedRef.current = null
    }, 3000)
  }

  function handleUndo() {
    if (!lastDeletedRef.current) return
    Haptics.selectionAsync()
    undoDeleteTodo(lastDeletedRef.current) // restores deleted: false
    lastDeletedRef.current = null
    setShowUndo(false)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
  }

  // ─── Render item ──────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item, drag, isActive }) => (
      <TodoItem
        item={item}
        onDelete={handleDelete}
        onLongPress={dragEnabled ? drag : undefined}
        dragActive={isActive}
        dragDisabled={!dragEnabled}
      />
    ),
    [dragEnabled]
  )

  // ─── Loading ──────────────────────────────────────────────────────────
  if (!hydrated) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={{ padding: 16 }}>
          <TodoSkeleton /><TodoSkeleton /><TodoSkeleton />
        </View>
      </SafeAreaView>
    )
  }

  const isEmpty = dayTodos.length === 0
  const isToday = getDateKey(selectedDate) === getDateKey(new Date())

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <DayHeader date={selectedDate} onChangeDate={setSelectedDate} />
      <FilterChips activeFilters={activeFilters} onToggle={toggleFilter} />

      <View style={styles.container}>
        {isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>{isToday ? '✅' : '📅'}</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {isToday ? 'Nothing on your plate' : 'No tasks for this day'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              {isToday ? 'Tap + to add your first task' : 'Navigate back or add a task here'}
            </Text>
          </View>
        ) : (
          <DraggableFlatList
            data={activeTodos}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListFooterComponent={
              completedTodos.length > 0 ? (
                <View style={styles.completedSection}>
                  <Text style={[styles.completedTitle, { color: colors.textMuted }]}>
                    ✓ COMPLETED ({completedTodos.length})
                  </Text>
                  {completedTodos.map((item) => (
                    <TodoItem key={item.id} item={item} onDelete={handleDelete} dragDisabled />
                  ))}
                </View>
              ) : null
            }
            contentContainerStyle={{ paddingBottom: 120 }}
            getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
            onDragEnd={({ data }) => {
              reorderTodos([...data, ...completedTodos])
              requestAnimationFrame(() => requestAnimationFrame(persistTodos))
            }}
          />
        )}

        <FloatingActionButton onPress={() => setOpen(true)} />
        <AddTodoModal
          visible={open}
          onClose={() => setOpen(false)}
          onSubmit={(title, priority, category) =>
            addTodo({ title, priority, category: category ?? 'General', dateKey })
          }
        />
      </View>

      <UndoSnackbar visible={showUndo} onUndo={handleUndo} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:      { flex: 1 },
  container: { flex: 1 },
  completedSection: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120 },
  completedTitle:   { fontSize: 11, fontWeight: '700', marginBottom: 10, letterSpacing: 1.2 },
  emptyState:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyIcon:   { fontSize: 52, marginBottom: 16 },
  emptyTitle:  { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySubtitle:{ fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
})