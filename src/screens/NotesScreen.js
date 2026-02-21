import { View, Text, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'

import FloatingActionButton from '../components/FloatingActionButton'
import NoteSkeleton from '../components/NoteSkeleton'
import useNotesStore from '../store/notesStore'

export default function NotesScreen() {
  const notes = useNotesStore(state => state.notes)
  const hydrated = useNotesStore(state => state.hydrated)

  // 🔒 GUARD: still loading from storage
  if (!hydrated) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <NoteSkeleton />
          <NoteSkeleton />
          <NoteSkeleton />
        </View>
      </SafeAreaView>
    )
  }

  // 📭 EMPTY STATE
  if (notes.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Notes</Text>
            <Pressable hitSlop={8}>
              <Text style={styles.search}>⌕</Text>
            </Pressable>
          </View>

          <View style={styles.empty}>
            <Text style={styles.emptyText}>No notes yet</Text>
          </View>

          <FloatingActionButton />
        </View>
      </SafeAreaView>
    )
  }

  // ✅ NORMAL UI
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Notes</Text>
          <Pressable hitSlop={8}>
            <Text style={styles.search}>⌕</Text>
          </Pressable>
        </View>

        {/* Notes List */}
        <FlashList
          data={notes}
          keyExtractor={item => item.id}
          estimatedItemSize={120}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <NoteCard note={item} />}
        />

        <FloatingActionButton />
      </View>
    </SafeAreaView>
  )
}

function NoteCard({ note }) {
  return (
    <Pressable style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {note.title}
        </Text>
        {note.pinned && <Text style={styles.pin}>📌</Text>}
      </View>

      <Text style={styles.preview} numberOfLines={2}>
        {note.preview}
      </Text>

      <Text style={styles.updated}>{note.updatedAt}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
  },

  search: {
    fontSize: 20,
    color: '#6B7280',
  },

  listContent: {
    padding: 16,
    paddingBottom: 120,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    paddingRight: 8,
  },

  pin: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  preview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },

  updated: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
})
