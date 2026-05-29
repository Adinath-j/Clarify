/**
 * useTheme.js
 * Returns the active theme object (lightTheme or darkTheme) based on:
 *  1. User's explicit mode preference stored in uiStore ('light' | 'dark' | 'system')
 *  2. Device system color scheme when mode is 'system'
 *
 * Usage:
 *   const { colors } = useTheme()
 *   <View style={{ backgroundColor: colors.background }} />
 */
import { useColorScheme } from 'react-native'
import useUIStore from '../store/uiStore'
import { lightTheme, darkTheme } from '../theme/themes'

export default function useTheme() {
  const themeMode    = useUIStore((s) => s.themeMode)
  const systemScheme = useColorScheme() // 'light' | 'dark' | null

  if (themeMode === 'dark')   return darkTheme
  if (themeMode === 'light')  return lightTheme

  // 'system' — follow device preference, default to light
  return systemScheme === 'dark' ? darkTheme : lightTheme
}
