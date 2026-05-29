import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'

import useTodoStore  from '../store/todoStore'
import useNotesStore from '../store/notesStore'
import useTheme      from '../hooks/useTheme'
import { debounce }  from '../utils/debounce'

const SECTION_TODO = 'todo'
const SECTION_NOTE = 'note'
const PRIORITY_COLORS = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' }

export default function SearchScreen() {
  const { colors } = useTheme()
  const todos = useTodoStore((s) => s.todos)
  const notes = useNotesStore((s) => s.notes)

  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const inputRef = useRef(null)

  // Exclude soft-deleted from counts and search
  const visibleTodos = todos.filter((t) => !t.deleted)
  const visibleNotes = notes.filter((n) => !n.deleted)

  const runSearch = useCallback(
    debounce((q) => {
      const trimmed = q.trim().toLowerCase()
      if (!trimmed) { setResults([]); return }

      const matchedTodos = visibleTodos
        .filter((t) => t.title.toLowerCase().includes(trimmed) || (t.category ?? '').toLowerCase().includes(trimmed))
        .map((t) => ({ ...t, _type: SECTION_TODO }))

      const matchedNotes = visibleNotes
        .filter((n) => n.title.toLowerCase().includes(trimmed) || (n.body ?? '').toLowerCase().includes(trimmed))
        .map((n) => ({ ...n, _type: SECTION_NOTE }))

      const combined = []
      if (matchedTodos.length > 0) { combined.push({ _type: 'header', _label: `Tasks (${matchedTodos.length})` }); combined.push(...matchedTodos) }
      if (matchedNotes.length > 0) { combined.push({ _type: 'header', _label: `Notes (${matchedNotes.length})` }); combined.push(...matchedNotes) }
      setResults(combined)
    }, 250),
    [todos, notes]
  )

  useEffect(() => {
    runSearch(query)
    return () => runSearch.cancel?.()
  }, [query, runSearch])

  const renderItem = useCallback(({ item }) => {
    if (item._type === 'header') return (
      <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{item._label}</Text>
    )
    if (item._type === SECTION_TODO) return (
      <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[item.priority] ?? colors.border }]} />
        <View style={styles.resultContent}>
          <Text style={[styles.resultTitle, { color: colors.textPrimary }, item.completed && styles.strikethrough]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.resultMeta, { color: colors.textMuted }]}>
            {item.category} · {item.dateKey}{item.completed ? ' · Done' : ''}
          </Text>
        </View>
        <Ionicons name="checkmark-circle" size={16} color={item.completed ? colors.success : colors.border} />
      </View>
    )
    if (item._type === SECTION_NOTE) return (
      <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="document-text" size={18} color={colors.accent} style={styles.noteIcon} />
        <View style={styles.resultContent}>
          <Text style={[styles.resultTitle, { color: colors.textPrimary }]} numberOfLines={1}>{item.title}</Text>
          {item.body ? <Text style={[styles.resultMeta, { color: colors.textMuted }]} numberOfLines={1}>{item.body}</Text> : null}
        </View>
        {item.pinned && <Ionicons name="bookmark" size={14} color={colors.warning} />}
      </View>
    )
    return null
  }, [colors])

  const isTyping  = query.trim().length > 0
  const noResults = isTyping && results.length === 0

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search tasks and notes…"
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            autoCorrect={false}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Stat pills */}
      {!isTyping && (
        <View style={styles.statsStrip}>
          {[
            { icon: 'checkmark-circle', label: `${visibleTodos.length} tasks`,  color: colors.accent },
            { icon: 'document-text',    label: `${visibleNotes.length} notes`,  color: '#6366F1' },
            { icon: 'checkmark-done',   label: `${visibleTodos.filter((t) => t.completed).length} done`, color: colors.success },
          ].map(({ icon, label, color }) => (
            <View key={label} style={[styles.statPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name={icon} size={14} color={color} />
              <Text style={[styles.statLabel, { color }]}>{label}</Text>
            </View>
          ))}
        </View>
      )}

      {isTyping ? (
        noResults ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No results for "{query}"</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Try a different keyword</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item, idx) => item._type === 'header' ? `h-${idx}` : `${item._type}-${item.id}`}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        <View style={styles.promptState}>
          <Text style={styles.promptIcon}>✨</Text>
          <Text style={[styles.promptText, { color: colors.textMuted }]}>
            Start typing to search across all your tasks and notes
          </Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:          { flex: 1 },
  searchRow:     { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  searchBar:     { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, gap: 8 },
  searchIcon:    { marginRight: 2 },
  searchInput:   { flex: 1, fontSize: 15, padding: 0 },
  statsStrip:    { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 12 },
  statPill:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  statLabel:     { fontSize: 12, fontWeight: '600' },
  sectionHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginTop: 16, marginBottom: 8 },
  listContent:   { paddingHorizontal: 16, paddingBottom: 120 },
  resultCard:    { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 13, marginBottom: 8, borderWidth: 1 },
  priorityDot:   { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  noteIcon:      { marginRight: 10 },
  resultContent: { flex: 1 },
  resultTitle:   { fontSize: 14, fontWeight: '600' },
  strikethrough: { textDecorationLine: 'line-through' },
  resultMeta:    { fontSize: 12, marginTop: 2 },
  emptyState:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyIcon:     { fontSize: 44, marginBottom: 12 },
  emptyTitle:    { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptySubtitle: { fontSize: 13 },
  promptState:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 48, paddingBottom: 80 },
  promptIcon:    { fontSize: 44, marginBottom: 12 },
  promptText:    { fontSize: 14, textAlign: 'center', lineHeight: 22 },
})
