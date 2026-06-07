import { View, Text, Pressable, StyleSheet } from 'react-native'
import useTheme from '../hooks/useTheme'

export default function UndoSnackbar({ visible, onUndo }) {
  const { colors, dark } = useTheme()
  if (!visible) return null

  return (
    <View style={[styles.container, { backgroundColor: dark ? colors.surface : '#111827' }]}>
      <Text style={styles.text}>Task deleted</Text>
      <Pressable onPress={onUndo}>
        <Text style={[styles.undo, { color: colors.accent }]}>UNDO</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
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
  },
  text: { color: '#fff' },
  undo: { fontWeight: '600' },
})