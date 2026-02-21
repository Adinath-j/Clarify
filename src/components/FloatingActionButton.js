import { useState } from 'react'
import * as Haptics from 'expo-haptics'
import { Pressable, StyleSheet, Text } from 'react-native'

export default function FloatingActionButton({ onPress }) {
  return (
    <Pressable
    accessibilityLabel="Add task"
      style={styles.fab}
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
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 28,
  },
})
