import React, { useRef, memo, useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, Animated as RNAnimated } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated'
import useTodoStore from '../store/todoStore'
import useTheme from '../hooks/useTheme'

const ITEM_HEIGHT = 72

function TodoItem({ item, onDelete, onLongPress, dragActive = false, dragDisabled = false }) {
  const { colors, layout, typography } = useTheme()
  const toggleTodo = useTodoStore((s) => s.toggleTodo)
  
  const PRIORITY_STYLE = {
    high:   { colorToken: 'error', icon: 'flag' },
    medium: { colorToken: 'warning', icon: 'calendar-outline' },
    low:    { colorToken: 'success', icon: 'calendar-outline' },
  }
  
  const p = PRIORITY_STYLE[item.priority ?? 'medium']
  const swipeRef = useRef(null)

  const scale = useSharedValue(1)
  const opacity = useSharedValue(item.completed ? 0.5 : 1)

  useEffect(() => {
    opacity.value = withTiming(item.completed ? 0.5 : 1, { duration: 250 })
  }, [item.completed])

  const checkboxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }))

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }))

  const handleToggle = () => {
    Haptics.selectionAsync()
    scale.value = withSpring(0.7, { damping: 10, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 400 })
    })
    toggleTodo(item.id)
  }

  const renderRightActions = (_, dragX) => {
    const scaleAnim = dragX.interpolate({
      inputRange: [-120, -60, 0],
      outputRange: [1, 0.85, 0.6],
      extrapolate: 'clamp',
    })
    return (
      <View style={[styles.backRow, { backgroundColor: colors.error }]}>
        <RNAnimated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Ionicons name="trash-outline" size={24} color={colors.card} />
        </RNAnimated.View>
      </View>
    )
  }

  const renderLeftActions = (_, dragX) => {
    const scaleAnim = dragX.interpolate({
      inputRange: [0, 60, 120],
      outputRange: [0.6, 0.85, 1],
      extrapolate: 'clamp',
    })
    return (
      <View style={[styles.backRowLeft, { backgroundColor: colors.success }]}>
        <RNAnimated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Ionicons name="checkmark-outline" size={24} color={colors.card} />
        </RNAnimated.View>
      </View>
    )
  }

  // Derive tags from item data
  let tagText = item.priority ? (item.priority.charAt(0).toUpperCase() + item.priority.slice(1)) : 'Medium'
  let dateText = 'Today'
  if (item.title.toLowerCase().includes('tomorrow')) dateText = 'Tomorrow, 4:00 PM'
  
  let rightIcon = p.icon
  let rightIconColorToken = p.colorToken

  return (
    <Swipeable
      ref={swipeRef}
      enabled={!dragActive}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      rightThreshold={96}
      leftThreshold={96}
      overshootRight={false}
      overshootLeft={false}
      friction={2.4}
      onSwipeableRightOpen={() => {
        onDelete(item)
      }}
      onSwipeableLeftOpen={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        handleToggle()
        swipeRef.current?.close()
      }}
    >
      <Animated.View style={[styles.card, cardStyle, { backgroundColor: 'transparent', borderBottomColor: colors.border }]}>
        <Pressable
          onPress={handleToggle}
          onLongPress={onLongPress}
          delayLongPress={260}
          style={styles.row}
        >
          {/* Checkbox */}
          <Pressable onPress={handleToggle} hitSlop={10} style={styles.checkboxContainer}>
            <Animated.View style={[
              styles.checkbox, 
              checkboxStyle, 
              { borderColor: colors.border },
              item.completed && { backgroundColor: colors.primary, borderColor: colors.primary }
            ]}>
              {item.completed && <Ionicons name="checkmark" size={14} color={colors.background} />}
            </Animated.View>
          </Pressable>
          
          <View style={styles.contentCol}>
            <Text numberOfLines={1} style={[typography.bodyM, { color: colors.textPrimary, fontWeight: '500' }, item.completed && { textDecorationLine: 'line-through', color: colors.textSecondary }]}>
              {item.title}
            </Text>
            <View style={styles.tagsRow}>
              <Text style={[typography.caption, { color: colors[p.colorToken] }]}>{tagText}</Text>
              <Text style={[typography.caption, { marginHorizontal: layout.spacing.sm, color: colors.textSecondary }]}>•</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>{dateText}</Text>
            </View>
          </View>

          <View style={styles.rightIconContainer}>
            <Ionicons name={rightIcon} size={16} color={colors[rightIconColorToken]} />
          </View>
        </Pressable>
      </Animated.View>
    </Swipeable>
  )
}

export default memo(TodoItem)

const styles = StyleSheet.create({
  backRow:  { height: ITEM_HEIGHT, flex: 1, justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 22 },
  backRowLeft: { height: ITEM_HEIGHT, flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingHorizontal: 22 },
  card:     { height: ITEM_HEIGHT, borderBottomWidth: 1 },
  row:      { flexDirection: 'row', alignItems: 'center', height: ITEM_HEIGHT, paddingHorizontal: 20 },
  checkboxContainer: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start', marginRight: 4 },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  contentCol: { flex: 1, justifyContent: 'center' },
  title:    { fontSize: 15, fontWeight: '500', marginBottom: 4 },
  tagsRow:  { flexDirection: 'row', alignItems: 'center' },
  tagText:  { fontSize: 11, fontWeight: '500' },
  tagDot:   { fontSize: 11, marginHorizontal: 6 },
  rightIconContainer: { width: 40, height: 44, justifyContent: 'center', alignItems: 'flex-end' }
})