import * as Haptics from 'expo-haptics'
import { Pressable, StyleSheet, Text } from 'react-native'
import useTheme from '../hooks/useTheme'

export default function FloatingActionButton({ onPress }) {
  const { colors } = useTheme()

  return (
    <Pressable
      accessibilityLabel="Add task"
      style={[styles.fab, { backgroundColor: colors.accent }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress?.()
      }}
    >
      <Text style={styles.plus}>＋</Text>
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
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 28,
  },
})
