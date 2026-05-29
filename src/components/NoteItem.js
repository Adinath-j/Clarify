import { View, Text, Pressable, StyleSheet, Animated } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useRef, memo } from 'react'
import useNotesStore from '../store/notesStore'

/**
 * NoteItem — swipeable note card supporting:
 *   • Swipe-left  → delete (red background)
 *   • Swipe-right → toggle pin (yellow background)
 *   • Tap         → navigate to note editor (via onPress)
 */
function NoteItem({ note, onPress }) {
  const togglePin  = useNotesStore((s) => s.togglePin)
  const deleteNote = useNotesStore((s) => s.deleteNote)
  const swipeRef   = useRef(null)

  /* ─── Right action: Delete ─────────────────────────────────────────── */
  const renderRightActions = (_, dragX) => {
    const scale = dragX.interpolate({
      inputRange:  [-100, -50, 0],
      outputRange: [1, 0.85, 0.6],
      extrapolate: 'clamp',
    })
    return (
      <View style={styles.deleteBack}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <MaterialIcons name="delete" size={24} color="#fff" />
        </Animated.View>
      </View>
    )
  }

  /* ─── Left action: Pin/Unpin ────────────────────────────────────────── */
  const renderLeftActions = (_, dragX) => {
    const scale = dragX.interpolate({
      inputRange:  [0, 50, 100],
      outputRange: [0.6, 0.85, 1],
      extrapolate: 'clamp',
    })
    return (
      <View style={styles.pinBack}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons
            name={note.pinned ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color="#fff"
          />
        </Animated.View>
      </View>
    )
  }

  /* ─── Formatted timestamp ───────────────────────────────────────────── */
  const timeLabel = formatTime(note.updatedAt)

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      rightThreshold={80}
      leftThreshold={80}
      overshootRight={false}
      overshootLeft={false}
      friction={2}
      onSwipeableWillOpen={(dir) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      }}
      onSwipeableOpen={(dir) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        if (dir === 'right') {
          deleteNote(note.id)
        } else {
          togglePin(note.id)
          swipeRef.current?.close()
        }
      }}
    >
      <Pressable
        style={[styles.card, note.pinned && styles.pinnedCard]}
        onPress={() => onPress?.(note)}
      >
        {/* Pin indicator */}
        {note.pinned && (
          <View style={styles.pinBadge}>
            <Ionicons name="bookmark" size={11} color="#F59E0B" />
          </View>
        )}

        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {note.title}
          </Text>
          <Text style={styles.timeText}>{timeLabel}</Text>
        </View>

        {note.body ? (
          <Text style={styles.preview} numberOfLines={2}>
            {note.body}
          </Text>
        ) : (
          <Text style={styles.emptyBody}>No content</Text>
        )}
      </Pressable>
    </Swipeable>
  )
}

export default memo(NoteItem)

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diffMs  = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs  = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1)   return 'Just now'
  if (diffMins < 60)  return `${diffMins}m ago`
  if (diffHrs < 24)   return `${diffHrs}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7)   return d.toLocaleDateString(undefined, { weekday: 'short' })
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pinnedCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  pinBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingRight: 20,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  timeText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  preview: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
  },
  emptyBody: {
    fontSize: 13,
    color: '#D1D5DB',
    fontStyle: 'italic',
  },
  deleteBack: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 22,
    borderRadius: 14,
    marginBottom: 10,
    flex: 1,
  },
  pinBack: {
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 22,
    borderRadius: 14,
    marginBottom: 10,
    flex: 1,
  },
})
