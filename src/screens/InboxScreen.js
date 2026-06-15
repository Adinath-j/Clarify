import React, { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import useTheme from '../hooks/useTheme'
import useTodoStore from '../store/todoStore'
import useNotesStore from '../store/notesStore'
import useUIStore from '../store/uiStore'
import TodoItem from '../components/TodoItem'
import NoteItem from '../components/NoteItem'
import EmptyState from '../components/EmptyState'
import SegmentedFilter from '../components/SegmentedFilter'


export default function InboxScreen() {
  const { colors, layout, typography } = useTheme()
  const [filter, setFilter] = useState('All') // 'All', 'Tasks', 'Notes'
  
  const allTodos = useTodoStore((s) => s.todos)
  const allNotes = useNotesStore((s) => s.notes)
  const { hasSeenSwipeTutorial, setHasSeenSwipeTutorial } = useUIStore()

  const todos = allTodos.filter(t => !t.deleted)
  const notes = allNotes.filter(n => !n.deleted)

  const inboxItems = [
    ...todos.map(t => ({ ...t, _type: 'task' })),
    ...notes.map(n => ({ ...n, _type: 'note' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const filteredItems = inboxItems.filter(item => {
    if (filter === 'Tasks') return item._type === 'task'
    if (filter === 'Notes') return item._type === 'note'
    return true
  })

  const showTutorial = !hasSeenSwipeTutorial && filteredItems.some(i => i._type === 'task')

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[{ paddingHorizontal: layout.spacing.xl, paddingVertical: layout.spacing.md }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[typography.headingM, { color: colors.textPrimary }]}>Inbox</Text>
          <TouchableOpacity>
            <Ionicons name="search-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: layout.spacing.md }}>
          <SegmentedFilter 
            options={['All', 'Tasks', 'Notes']}
            selectedOption={filter}
            onSelect={setFilter}
          />
        </View>
      </View>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {showTutorial && (
              <View style={[styles.tutorialBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                <Text style={[typography.bodyS, { color: colors.textPrimary, flex: 1, marginLeft: 8 }]}>
                  💡 Swipe left to delete, swipe right to complete tasks.
                </Text>
                <TouchableOpacity onPress={() => setHasSeenSwipeTutorial(true)} style={{ padding: 4 }}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
            {filteredItems.length > 0 && <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Today</Text>}
          </>
        }
        renderItem={({ item }) => {
          if (item._type === 'task') {
            return <TodoItem item={item} onDelete={(task) => {
              useTodoStore.getState().deleteTodo(task.id)
              useUIStore.getState().addPendingDeletion(task.id, 'todo')
            }} />
          }
          return <NoteItem note={item} onPress={() => {}} />
        }}
        ListEmptyComponent={
          <EmptyState 
            title="Your inbox is clear." 
            subtitle="Capture thoughts, tasks, and notes quickly."
            icon="checkmark-done-circle-outline"
          />
        }
      />

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerRight: { flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 4 },
  
  segmentedControl: { paddingHorizontal: 20, marginBottom: 20 },
  segmentedInner: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
  },
  filterPill: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 20 },
  
  listContent: { paddingBottom: 180 },
  sectionTitle: { fontSize: 13, fontWeight: '600', paddingHorizontal: 20, paddingBottom: 10, paddingTop: 10 },
  
  tutorialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
  }
})
