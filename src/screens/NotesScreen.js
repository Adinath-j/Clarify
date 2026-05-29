import { View, Text, StyleSheet, SectionList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useCallback } from 'react'
import * as Haptics from 'expo-haptics'

import useNotesStore from '../store/notesStore'
import useTheme      from '../hooks/useTheme'
import NoteItem      from '../components/NoteItem'
import NoteSkeleton  from '../components/NoteSkeleton'
import FloatingActionButton from '../components/FloatingActionButton'
import AddNoteModal  from '../components/AddNoteModal'

export default function NotesScreen() {
  const { colors } = useTheme()

  const notes    = useNotesStore((s) => s.notes)
  const hydrated = useNotesStore((s) => s.hydrated)
  const addNote  = useNotesStore((s) => s.addNote)
  const editNote = useNotesStore((s) => s.editNote)

  const [modalVisible, setModalVisible] = useState(false)
  const [editingNote, setEditingNote]   = useState(null)

  const handleAdd = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setEditingNote(null)
    setModalVisible(true)
  }, [])

  const handleNotePress = useCallback((note) => {
    setEditingNote(note)
    setModalVisible(true)
  }, [])

  const handleSubmit = useCallback(({ title, body }) => {
    if (editingNote) editNote(editingNote.id, { title, body })
    else addNote({ title, body })
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }, [editingNote, addNote, editNote])

  // Filter out soft-deleted notes
  const visibleNotes = notes.filter((n) => !n.deleted)
  const pinned   = visibleNotes.filter((n) => n.pinned)
  const unpinned = visibleNotes.filter((n) => !n.pinned)

  const sections = []
  if (pinned.length > 0)   sections.push({ title: 'PINNED', data: pinned })
  if (unpinned.length > 0) sections.push({ title: 'NOTES',  data: unpinned })

  if (!hydrated) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Notes</Text>
        </View>
        <View style={{ padding: 16 }}>
          <NoteSkeleton /><NoteSkeleton /><NoteSkeleton />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Notes</Text>
        <Text style={[styles.count, { color: colors.textMuted }]}>
          {visibleNotes.length > 0 ? `${visibleNotes.length} note${visibleNotes.length !== 1 ? 's' : ''}` : ''}
        </Text>
      </View>

      {visibleNotes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No notes yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Tap the + button to create your first note
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{title}</Text>
          )}
          renderItem={({ item }) => <NoteItem note={item} onPress={handleNotePress} />}
          stickySectionHeadersEnabled={false}
        />
      )}

      <FloatingActionButton onPress={handleAdd} />
      <AddNoteModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingNote(null) }}
        onSubmit={handleSubmit}
        initialTitle={editingNote?.title}
        initialBody={editingNote?.body}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:          { flex: 1 },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  title:         { fontSize: 26, fontWeight: '700' },
  count:         { fontSize: 13, fontWeight: '500' },
  listContent:   { paddingHorizontal: 16, paddingBottom: 120 },
  sectionHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8, marginTop: 4 },
  emptyState:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyIcon:     { fontSize: 52, marginBottom: 16 },
  emptyTitle:    { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
})
