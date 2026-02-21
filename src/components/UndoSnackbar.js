import { View, Text, Pressable, StyleSheet } from 'react-native'

export default function UndoSnackbar({ visible, onUndo }) {
  if (!visible) return null

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Task deleted</Text>
      <Pressable onPress={onUndo}>
        <Text style={styles.undo}>UNDO</Text>
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
    backgroundColor: '#111827',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: { color: '#fff' },
  undo: { color: '#60A5FA', fontWeight: '600' },
})