import { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { useSharedValue, withTiming, interpolateColor, useDerivedValue, useReducedMotion, useAnimatedStyle } from 'react-native-reanimated'
import useUIStore from '../store/uiStore'
import { lightColors, darkColors } from '../theme/colors'
import { lightTheme } from '../theme/themes'
const { layout, typography } = lightTheme

export default function useAnimatedTheme() {
  const themeMode    = useUIStore((s) => s.themeMode)
  const systemScheme = useColorScheme()
  const reducedMotion = useReducedMotion()

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark')
  
  // Shared value for animation (0 = light, 1 = dark)
  const progress = useSharedValue(isDark ? 1 : 0)

  useEffect(() => {
    const target = isDark ? 1 : 0
    if (reducedMotion) {
      progress.value = target
    } else {
      progress.value = withTiming(target, { duration: 250 })
    }
  }, [isDark, reducedMotion])

  const animatedColors = {
    background: useDerivedValue(() => interpolateColor(progress.value, [0, 1], [lightColors.background, darkColors.background])),
    surface: useDerivedValue(() => interpolateColor(progress.value, [0, 1], [lightColors.surface, darkColors.surface])),
    card: useDerivedValue(() => interpolateColor(progress.value, [0, 1], [lightColors.card, darkColors.card])),
    textPrimary: useDerivedValue(() => interpolateColor(progress.value, [0, 1], [lightColors.textPrimary, darkColors.textPrimary])),
    textSecondary: useDerivedValue(() => interpolateColor(progress.value, [0, 1], [lightColors.textSecondary, darkColors.textSecondary])),
    border: useDerivedValue(() => interpolateColor(progress.value, [0, 1], [lightColors.border, darkColors.border])),
    primary: useDerivedValue(() => interpolateColor(progress.value, [0, 1], [lightColors.primary, darkColors.primary])),
    success: useDerivedValue(() => interpolateColor(progress.value, [0, 1], [lightColors.success, darkColors.success])),
    warning: useDerivedValue(() => interpolateColor(progress.value, [0, 1], [lightColors.warning, darkColors.warning])),
    error: useDerivedValue(() => interpolateColor(progress.value, [0, 1], [lightColors.error, darkColors.error])),
  }

  const animatedStyles = {
    bgBackground: useAnimatedStyle(() => ({ backgroundColor: animatedColors.background.value })),
    bgSurface: useAnimatedStyle(() => ({ backgroundColor: animatedColors.surface.value })),
    bgCard: useAnimatedStyle(() => ({ backgroundColor: animatedColors.card.value })),
    bgPrimary: useAnimatedStyle(() => ({ backgroundColor: animatedColors.primary.value })),
    bgBorder: useAnimatedStyle(() => ({ backgroundColor: animatedColors.border.value })),
    
    textPrimary: useAnimatedStyle(() => ({ color: animatedColors.textPrimary.value })),
    textSecondary: useAnimatedStyle(() => ({ color: animatedColors.textSecondary.value })),
    textPrimaryColor: useAnimatedStyle(() => ({ color: animatedColors.primary.value })),
    textWarningColor: useAnimatedStyle(() => ({ color: animatedColors.warning.value })),
    textErrorColor: useAnimatedStyle(() => ({ color: animatedColors.error.value })),
    
    border: useAnimatedStyle(() => ({ borderColor: animatedColors.border.value })),
    borderPrimary: useAnimatedStyle(() => ({ borderColor: animatedColors.primary.value })),
  }

  const staticColors = isDark ? darkColors : lightColors

  return { animatedColors, staticColors, animatedStyles, isDark, layout, typography }
}
