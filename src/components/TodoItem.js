import { View, Text, StyleSheet, Pressable, Animated } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { MaterialIcons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useRef, memo } from 'react'
import useTodoStore from '../store/todoStore'
import useTheme from '../hooks/useTheme'

const PRIORITY_STYLE = {
  high:   { color: '#EF4444', deleteBg: '#DC2626', elevation: 4 },
  medium: { color: '#F59E0B', deleteBg: '#D97706', elevation: 2 },
  low:    { color: '#10B981', deleteBg: '#059669', elevation: 1 },
}

const ITEM_HEIGHT = 64

function TodoItem({ item, onDelete, onLongPress, dragActive = false, dragDisabled = false }) {
  const { colors } = useTheme()
  const toggleTodo = useTodoStore((s) => s.toggleTodo)
  const p = PRIORITY_STYLE[item.priority ?? 'medium']
  const swipeRef = useRef(null)

  const renderRightActions = (_, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-120, -60, 0],
      outputRange: [1, 0.85, 0.6],
      extrapolate: 'clamp',
    })
    return (
      <View style={[styles.backRow, { backgroundColor: p.deleteBg }]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <MaterialIcons name="delete" size={26} color="#FFFFFF" />
        </Animated.View>
      </View>
    )
  }

  return (
    <Swipeable
      ref={swipeRef}
      enabled={!dragActive}
      renderRightActions={renderRightActions}
      rightThreshold={96}
      overshootRight={false}
      friction={2.4}
      onSwipeableWillOpen={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      onSwipeableOpen={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        onDelete(item)
      }}
    >
      <View style={[styles.card, {
        backgroundColor: colors.surface,
        borderLeftColor: p.color,
        elevation: dragActive ? 0 : p.elevation,
        opacity: item.completed ? 0.55 : 1,
      }]}>
        <Pressable
          onPress={() => { Haptics.selectionAsync(); toggleTodo(item.id) }}
          onLongPress={onLongPress}
          delayLongPress={260}
          style={styles.row}
        >
          <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: colors.surface },
            item.completed && { backgroundColor: colors.success, borderColor: colors.success }]}>
            {item.completed && <MaterialIcons name="check" size={14} color="#FFFFFF" />}
          </View>
          <Text numberOfLines={2} style={[styles.title, { color: colors.textPrimary },
            item.completed && { textDecorationLine: 'line-through', color: colors.textMuted }]}>
            {item.title}
          </Text>
        </Pressable>
      </View>
    </Swipeable>
  )
}

export default memo(TodoItem)

const styles = StyleSheet.create({
  backRow:  { height: ITEM_HEIGHT, flex: 1, justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 22 },
  card:     { height: ITEM_HEIGHT, borderLeftWidth: 4 },
  row:      { flexDirection: 'row', alignItems: 'center', height: ITEM_HEIGHT, paddingHorizontal: 14 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title:    { flex: 1, fontSize: 16, fontWeight: '500' },
})