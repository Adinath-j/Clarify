import { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet } from 'react-native'

/**
 * Animated shimmer skeleton placeholder.
 * Uses a pulsing opacity loop for a premium loading feel.
 */
export default function Skeleton({ height = 16, width = '100%', radius = 8 }) {
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        styles.box,
        { height, width, borderRadius: radius, opacity },
      ]}
    />
  )
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#E5E7EB',
  },
})
