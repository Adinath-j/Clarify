import { useEffect, useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import useTheme from '../hooks/useTheme'
import useUIStore from '../store/uiStore'
import useTodoStore from '../store/todoStore'
import useNotesStore from '../store/notesStore'

export default function UndoSnackbar() {
  const { colors, dark } = useTheme()
  const insets = useSafeAreaInsets()
  
  const pendingDeletions = useUIStore(s => s.pendingDeletions)
  const clearPendingDeletions = useUIStore(s => s.clearPendingDeletions)
  
  const undoDeleteTodo = useTodoStore(s => s.undoDeleteTodo)
  const undoDeleteNote = useNotesStore(s => s.undoDeleteNote)

  const [visible, setVisible] = useState(false)
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(20)

  useEffect(() => {
    let timeout
    if (pendingDeletions.length > 0) {
      setVisible(true)
      opacity.value = withTiming(1, { duration: 200 })
      translateY.value = withSpring(0, { damping: 15, stiffness: 200 })
      
      // Reset timeout on every new deletion
      timeout = setTimeout(() => {
        dismiss()
        runOnJS(clearPendingDeletions)() // Make deletions permanent
      }, 5000)
    } else {
      dismiss()
    }
    return () => clearTimeout(timeout)
  }, [pendingDeletions.length]) // only trigger when length changes

  const dismiss = () => {
    opacity.value = withTiming(0, { duration: 200 })
    translateY.value = withTiming(20, { duration: 200 }, (finished) => {
      if (finished) runOnJS(setVisible)(false)
    })
  }

  const handleUndo = () => {
    // LIFO restore
    for (let i = pendingDeletions.length - 1; i >= 0; i--) {
      const item = pendingDeletions[i]
      if (item.type === 'todo') undoDeleteTodo(item.id)
      if (item.type === 'note') undoDeleteNote(item.id)
    }
    clearPendingDeletions()
    dismiss()
  }

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }))

  if (!visible) return null

  const message = pendingDeletions.length > 1 
    ? `${pendingDeletions.length} items deleted` 
    : 'Item deleted'

  return (
    <Animated.View style={[
      styles.container, 
      { 
        backgroundColor: dark ? colors.card : colors.textPrimary, 
        bottom: 60 + Math.max(insets.bottom, 12) + 80, // Tab bar height + 80px
        borderColor: dark ? colors.border : 'transparent',
        borderWidth: dark ? 1 : 0
      },
      animatedStyle
    ]}>
      <Text style={[styles.text, { color: dark ? colors.textPrimary : colors.surface }]}>{message}</Text>
      <Pressable onPress={handleUndo} hitSlop={10}>
        <Text style={[styles.undo, { color: '#818CF8' }]}>UNDO</Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 1000,
  },
  text: { fontSize: 14, fontWeight: '500' },
  undo: { fontSize: 14, fontWeight: '700' },
})