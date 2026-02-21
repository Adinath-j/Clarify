import { View, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect, useState, useRef, useCallback } from 'react'
import DraggableFlatList from 'react-native-draggable-flatlist'
import * as Haptics from 'expo-haptics'

import useTodoStore from '../store/todoStore'
import TodoItem from '../components/TodoItem'
import TodoSkeleton from '../components/TodoSkeleton'
import FloatingActionButton from '../components/FloatingActionButton'
import AddTodoModal from '../components/AddTodoModal'
import FilterChips from '../components/FilterChips'
import DayHeader from '../components/DayHeader'
import UndoSnackbar from '../components/UndoSnackbar'
import { getDateKey } from '../utils/date'

const ITEM_HEIGHT = 64

export default function TodayScreen() {
  /* ---------------- STORE ---------------- */
  const {
    todos,
    hydrated,
    hydrate,
    addTodo,
    deleteTodo,
    reorderTodos,
    persistTodos,
  } = useTodoStore()

  /* ---------------- STATE ---------------- */
  const [open, setOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState([])
  const [showUndo, setShowUndo] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const dateKey = getDateKey(selectedDate)

  /* ---------------- REFS ---------------- */
  const lastDeletedRef = useRef(null)
  const undoTimerRef = useRef(null)
  const isDraggingRef = useRef(false)

  const dragEnabled = activeFilters.length === 0

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    hydrate()
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    }
  }, [])

  /* ---------------- FILTER LOGIC ---------------- */

  // 1️⃣ Day filter FIRST
  const dayTodos = todos.filter(t => t.dateKey === dateKey)

  // 2️⃣ Chip filters on top of day filter
  const filteredTodos = dayTodos.filter(t => {
    if (activeFilters.length === 0) return true
    return (
      activeFilters.includes(t.priority) ||
      activeFilters.includes(t.category)
    )
  })

  // 3️⃣ Drag only allowed when no filters
  const visibleTodos = dragEnabled ? dayTodos : filteredTodos

  // 4️⃣ Split active / completed
  const activeTodos = visibleTodos.filter(t => !t.completed)
  const completedTodos = visibleTodos.filter(t => t.completed)

  function toggleFilter(filter) {
    setActiveFilters(prev =>
      prev.includes(filter.key)
        ? prev.filter(k => k !== filter.key)
        : [...prev, filter.key]
    )
  }

  /* ---------------- DELETE + UNDO ---------------- */
  function handleDelete(todo) {
    lastDeletedRef.current = todo
    deleteTodo(todo.id)
    setShowUndo(true)

    undoTimerRef.current = setTimeout(() => {
      setShowUndo(false)
      lastDeletedRef.current = null
    }, 3000)
  }

  function undoDelete() {
    if (!lastDeletedRef.current) return
    addTodo(lastDeletedRef.current)
    lastDeletedRef.current = null
    setShowUndo(false)
  }

  /* ---------------- RENDER ITEM ---------------- */
  const renderItem = useCallback(
    ({ item, drag, isActive }) => (
      <TodoItem
        item={item}
        onDelete={handleDelete}
        onLongPress={dragEnabled ? drag : undefined}
        dragDisabled={!dragEnabled || isActive}
      />
    ),
    [dragEnabled]
  )

  /* ---------------- LOADING ---------------- */
  if (!hydrated) {
    return (
      <SafeAreaView style={styles.safe}>
        <TodoSkeleton />
        <TodoSkeleton />
        <TodoSkeleton />
      </SafeAreaView>
    )
  }

  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView style={styles.safe}>
      <DayHeader
        date={selectedDate}
        onChangeDate={setSelectedDate}
      />

      <FilterChips
        activeFilters={activeFilters}
        onToggle={toggleFilter}
      />

      <View style={styles.container}>
        <DraggableFlatList
          data={activeTodos}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}

          ListFooterComponent={
            completedTodos.length > 0 ? (
              <View style={styles.completedSection}>
                <Text style={styles.completedTitle}>COMPLETED</Text>

                {completedTodos.map(item => (
                  <TodoItem
                    key={item.id}
                    item={item}
                    onDelete={handleDelete}
                    dragDisabled={true}
                  />
                ))}
              </View>
            ) : null
          }

          contentContainerStyle={{ paddingBottom: 120 }}

          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}

          onDragEnd={({ data }) => {
            reorderTodos([...data, ...completedTodos])
            requestAnimationFrame(() => {
              requestAnimationFrame(persistTodos)
            })
          }}
        />
        {completedTodos.length > 0 && (
          <View style={styles.completedSection}>
            <Text style={styles.completedTitle}>COMPLETED</Text>
            {completedTodos.map(item => (
              <TodoItem key={item.id} item={item} dragDisabled />
            ))}
          </View>
        )}

        <FloatingActionButton onPress={() => setOpen(true)} />

        <AddTodoModal
          visible={open}
          onClose={() => setOpen(false)}
          onSubmit={(title, priority) =>
            addTodo({
              title,
              priority,
              dateKey,
            })
          }
        />
      </View>

      <UndoSnackbar
        visible={showUndo}
        onUndo={() => {
          Haptics.selectionAsync()
          undoDelete()
        }}
      />
    </SafeAreaView>
  )
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  completedSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },
  completedTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
    letterSpacing: 1,
  },
})