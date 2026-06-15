import React, { useState } from 'react'
import { StyleSheet, View, Pressable, Text, Dimensions } from 'react-native'
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  useSharedValue,
  interpolate,
  Extrapolate,
  withDelay
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import useTheme from '../hooks/useTheme'
import useUIStore from '../store/uiStore'

const { width, height } = Dimensions.get('window')

const ACTIONS = [
  { id: 'ask-ai', icon: 'sparkles', label: 'Ask AI', actionType: 'route', route: '/(ai)/ask', color: '#8b5cf6' },
  { id: 'breakdown', icon: 'git-network', label: 'Break Down', actionType: 'route', route: '/(ai)/breakdown', color: '#ec4899' },
  { id: 'new-note', icon: 'document-text', label: 'New Note', actionType: 'modal', modalType: 'note', color: '#10b981' },
  { id: 'new-task', icon: 'checkmark-circle', label: 'New Task', actionType: 'modal', modalType: 'todo', color: '#3b82f6' }
]

export default function ExpandingFAB() {
  const { colors, layout, dark } = useTheme()
  const { openAddTodo, openAddNote } = useUIStore()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const bottomPadding = Math.max(insets.bottom, 12)
  const fabBottom = 60 + bottomPadding + layout.spacing.lg // 60 is tab bar height

  const [isOpen, setIsOpen] = useState(false)
  const progress = useSharedValue(0)

  const toggleOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    const nextState = !isOpen
    setIsOpen(nextState)
    progress.value = withSpring(nextState ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    })
  }

  const handleAction = (action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setIsOpen(false)
    progress.value = withTiming(0, { duration: 200 })
    setTimeout(() => {
      if (action.actionType === 'route') {
        router.push(action.route)
      } else if (action.actionType === 'modal') {
        if (action.modalType === 'todo') openAddTodo()
        if (action.modalType === 'note') openAddNote()
      }
    }, 200)
  }

  // --- Styles ---

  const scrimStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      pointerEvents: isOpen ? 'auto' : 'none',
    }
  })

  const mainFabStyle = useAnimatedStyle(() => {
    const rotate = interpolate(progress.value, [0, 1], [0, 45])
    return {
      transform: [{ rotate: `${rotate}deg` }],
      backgroundColor: progress.value > 0.5 ? colors.surfaceContainer : colors.primary
    }
  })

  const mainIconStyle = useAnimatedStyle(() => {
    return {
      color: progress.value > 0.5 ? colors.textPrimary : colors.card
    }
  })

  return (
    <>
      {/* Dark Scrim */}
      <Animated.View style={[styles.scrim, scrimStyle]}>
        <Pressable style={styles.scrimPressable} onPress={toggleOpen} />
      </Animated.View>

      <View style={[styles.container, { bottom: fabBottom }]}>
        
        {/* Child FABs */}
        {ACTIONS.map((action, index) => {
          const distance = 76
          const yOffset = -distance * (4 - index)
          const xOffset = 0
          
          const animatedStyle = useAnimatedStyle(() => {
            // Add stagger based on index
            const delayedProgress = Math.max(0, Math.min(1, (progress.value - index * 0.1) * 1.5))
            
            const translateY = interpolate(delayedProgress, [0, 1], [0, yOffset])
            const translateX = interpolate(delayedProgress, [0, 1], [0, xOffset])
            const scale = interpolate(delayedProgress, [0, 0.5, 1], [0.5, 0.8, 1])
            const opacity = delayedProgress
            return {
              opacity,
              transform: [
                { translateX },
                { translateY },
                { scale }
              ],
              pointerEvents: isOpen ? 'auto' : 'none'
            }
          })

          return (
            <Animated.View key={action.id} style={[styles.childFabContainer, animatedStyle]}>
              <Text 
                style={[
                  styles.label, 
                  { 
                    color: colors.textPrimary, 
                    backgroundColor: colors.surfaceContainer,
                  }
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {action.label}
              </Text>
              <Pressable 
                style={[styles.childFab, { backgroundColor: colors.surface }]}
                onPress={() => handleAction(action)}
              >
                <Ionicons name={action.icon} size={20} color={action.color} />
              </Pressable>
            </Animated.View>
          )
        })}

        {/* Main FAB */}
        <Pressable onPress={toggleOpen}>
          <Animated.View style={[styles.mainFab, mainFabStyle, { shadowColor: colors.primary }]}>
            <Animated.Text style={[styles.plus, mainIconStyle]}>＋</Animated.Text>
          </Animated.View>
        </Pressable>

      </View>
    </>
  )
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    top: -height,
    bottom: -height,
    left: -width,
    right: -width,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 100,
  },
  scrimPressable: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    position: 'absolute',
    right: 20,
    alignItems: 'flex-end',
    zIndex: 101,
  },
  childFabContainer: {
    position: 'absolute',
    right: 4, // Center aligning child FAB (48px) with Main FAB (56px) -> offset by 4
    bottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 300, // Gives enough room for the label to grow without wrapping
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    overflow: 'hidden',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 16,
    minWidth: 150,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  childFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  mainFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  plus: {
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '400',
  }
})
