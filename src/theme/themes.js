/**
 * themes.js
 * Assembled light and dark theme objects.
 * Import `useTheme()` hook in components — don't import directly from here.
 */
import { lightColors, darkColors } from './colors'

const layout = {
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 8, md: 12, lg: 16, xl: 20 },
}

const typography = {
  headingXL: { fontSize: 32, fontWeight: '800' },
  headingL:  { fontSize: 24, fontWeight: '800' },
  headingM:  { fontSize: 18, fontWeight: '700' },
  bodyL:     { fontSize: 16, fontWeight: '500' },
  bodyM:     { fontSize: 14, fontWeight: '400' },
  bodyS:     { fontSize: 12, fontWeight: '500' },
  caption:   { fontSize: 10, fontWeight: '600' },
}

export const lightTheme = {
  dark: false,
  colors: lightColors,
  layout,
  typography,
}

export const darkTheme = {
  dark: true,
  colors: darkColors,
  layout,
  typography,
}

/** Maps mode strings to theme objects for convenience. */
export const THEMES = {
  light:  lightTheme,
  dark:   darkTheme,
  system: null, // resolved at runtime by useTheme()
}
