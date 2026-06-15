import React, { useEffect } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, useReducedMotion } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import useAnimatedTheme from '../hooks/useAnimatedTheme'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)
const AnimatedIcon = Animated.createAnimatedComponent(Ionicons)

export default function SegmentedFilter({ options, selectedOption, onSelect }) {
  const { animatedStyles, staticColors, layout, typography } = useAnimatedTheme()
  const selectedIndex = options.indexOf(selectedOption)
  const translateX = useSharedValue(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) {
      translateX.value = selectedIndex * 100
    } else {
      translateX.value = withTiming(selectedIndex * 100, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      })
    }
  }, [selectedIndex, reducedMotion])

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${translateX.value}%` }],
    width: `${100 / options.length}%`,
  }))

  const getIconForOption = (option) => {
    if (option === 'Light') return 'sunny'
    if (option === 'Dark') return 'moon'
    if (option === 'System') return 'phone-portrait-outline'
    return null
  }

  return (
    <Animated.View style={[styles.container, animatedStyles.bgSurface, { borderRadius: layout.radius.xl, padding: layout.spacing.xs }]}>
      <Animated.View
        style={[
          styles.indicator,
          animatedStyles.bgCard,
          animatedStyles.border,
          { borderRadius: layout.radius.lg, shadowColor: staticColors.border },
          indicatorStyle,
        ]}
      />
      <View style={styles.optionsRow}>
        {options.map((option, index) => {
          const isSelected = selectedOption === option
          const iconName = getIconForOption(option)
          
          return (
            <AnimatedPressable
              key={option}
              style={styles.option}
              onPress={() => onSelect(option)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {iconName && (
                  <AnimatedIcon 
                    name={iconName} 
                    size={14} 
                    style={[isSelected ? animatedStyles.textPrimaryColor : animatedStyles.textSecondary]} 
                  />
                )}
                <Animated.Text
                  style={[
                    typography.bodyS,
                    isSelected ? animatedStyles.textPrimary : animatedStyles.textSecondary,
                  ]}
                >
                  {option}
                </Animated.Text>
              </View>
            </AnimatedPressable>
          )
        })}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionsRow: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  option: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
})
