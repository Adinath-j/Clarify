import { useEffect, useRef } from 'react'
import { Animated, StyleSheet } from 'react-native'
import useTheme from '../hooks/useTheme'

/**
 * Animated shimmer skeleton placeholder.
 * Uses a pulsing opacity loop for a premium loading feel.
 * Color adapts to light/dark theme.
 */
export default function Skeleton({ height = 16, width = '100%', radius = 8 }) {
  const { colors } = useTheme()
  const opacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ])
    )
    pulse.start()
    return () => pulse.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        { height, width, borderRadius: radius, opacity, backgroundColor: colors.skeleton },
      ]}
    />
  )
}
