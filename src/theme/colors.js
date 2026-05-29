/**
 * colors.js
 * Semantic color tokens for light and dark themes.
 * Import these in themes.js — do NOT import directly in components.
 * Components should use the `useTheme()` hook instead.
 */

export const lightColors = {
  // ─── Backgrounds ──────────────────────────────────────────────────────
  background:  '#F9FAFB',
  surface:     '#FFFFFF',
  surfaceAlt:  '#F3F4F6',

  // ─── Borders ──────────────────────────────────────────────────────────
  border:      '#E5E7EB',
  borderLight: '#F3F4F6',

  // ─── Text ─────────────────────────────────────────────────────────────
  textPrimary:   '#111827',
  textSecondary: '#6B7280',
  textMuted:     '#9CA3AF',
  textInverse:   '#FFFFFF',

  // ─── Brand ────────────────────────────────────────────────────────────
  accent:      '#2563EB',
  accentLight: '#EFF6FF',
  accentDim:   '#BFDBFE',

  // ─── Status ───────────────────────────────────────────────────────────
  success:     '#22C55E',
  successLight:'#DCFCE7',
  danger:      '#EF4444',
  dangerLight: '#FEE2E2',
  warning:     '#F59E0B',
  warningLight:'#FEF9C3',

  // ─── Priority dots ────────────────────────────────────────────────────
  priorityHigh:   '#EF4444',
  priorityMedium: '#F59E0B',
  priorityLow:    '#10B981',

  // ─── Skeleton ─────────────────────────────────────────────────────────
  skeleton:    '#E5E7EB',

  // ─── Tab Bar ──────────────────────────────────────────────────────────
  tabBar:      '#FFFFFF',
  tabBarBorder:'#E5E7EB',
  tabActive:   '#2563EB',
  tabInactive: '#9CA3AF',

  // ─── Status bar ───────────────────────────────────────────────────────
  statusBarStyle: 'dark-content',
}

export const darkColors = {
  // ─── Backgrounds ──────────────────────────────────────────────────────
  background:  '#0F172A',
  surface:     '#1E293B',
  surfaceAlt:  '#0F172A',

  // ─── Borders ──────────────────────────────────────────────────────────
  border:      '#334155',
  borderLight: '#1E293B',

  // ─── Text ─────────────────────────────────────────────────────────────
  textPrimary:   '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted:     '#64748B',
  textInverse:   '#0F172A',

  // ─── Brand ────────────────────────────────────────────────────────────
  accent:      '#3B82F6',
  accentLight: '#1E3A5F',
  accentDim:   '#1D4ED8',

  // ─── Status ───────────────────────────────────────────────────────────
  success:     '#4ADE80',
  successLight:'#14532D',
  danger:      '#F87171',
  dangerLight: '#7F1D1D',
  warning:     '#FBBF24',
  warningLight:'#78350F',

  // ─── Priority dots ────────────────────────────────────────────────────
  priorityHigh:   '#F87171',
  priorityMedium: '#FBBF24',
  priorityLow:    '#4ADE80',

  // ─── Skeleton ─────────────────────────────────────────────────────────
  skeleton:    '#334155',

  // ─── Tab Bar ──────────────────────────────────────────────────────────
  tabBar:      '#1E293B',
  tabBarBorder:'#334155',
  tabActive:   '#3B82F6',
  tabInactive: '#64748B',

  // ─── Status bar ───────────────────────────────────────────────────────
  statusBarStyle: 'light-content',
}
