import * as Haptics from 'expo-haptics'
import { Pressable, StyleSheet, Text } from 'react-native'
import useTheme from '../hooks/useTheme'
import useUIStore from '../store/uiStore'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function FloatingActionButton({ onPress }) {
  const { colors, layout } = useTheme()
  const openQuickCapture = useUIStore((s) => s.openQuickCapture)
  const insets = useSafeAreaInsets()
  const bottomPadding = Math.max(insets.bottom, 12)

  return (
    <Pressable
      accessibilityLabel="Add task or note"
      style={[
        styles.fab, 
        { 
          backgroundColor: colors.primary,
          shadowColor: colors.primary, 
          bottom: 60 + bottomPadding + layout.spacing.lg // 60 is tab bar base height
        }
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        if (onPress) {
          onPress()
        } else {
          openQuickCapture()
        }
      }}
    >
      <Text style={[styles.plus, { color: colors.card }]}>＋</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  plus: {
    fontSize: 28,
    lineHeight: 28,
  },
})
