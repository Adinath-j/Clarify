/**
 * themes.js
 * Assembled light and dark theme objects.
 * Import `useTheme()` hook in components — don't import directly from here.
 */
import { lightColors, darkColors } from './colors'

export const lightTheme = {
  dark: false,
  colors: lightColors,
}

export const darkTheme = {
  dark: true,
  colors: darkColors,
}

/** Maps mode strings to theme objects for convenience. */
export const THEMES = {
  light:  lightTheme,
  dark:   darkTheme,
  system: null, // resolved at runtime by useTheme()
}
