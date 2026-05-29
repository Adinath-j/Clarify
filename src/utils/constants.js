// ─── Priority Levels ──────────────────────────────────────────────────────────
export const PRIORITIES = [
  { key: 'high',   label: 'High',   color: '#EF4444', deleteBg: '#DC2626' },
  { key: 'medium', label: 'Medium', color: '#F59E0B', deleteBg: '#D97706' },
  { key: 'low',    label: 'Low',    color: '#10B981', deleteBg: '#059669' },
]

// ─── Task Categories ──────────────────────────────────────────────────────────
export const CATEGORIES = [
  { key: 'General',  label: 'General',  icon: '📋', color: '#6B7280' },
  { key: 'Work',     label: 'Work',     icon: '💼', color: '#6366F1' },
  { key: 'Personal', label: 'Personal', icon: '🏠', color: '#EC4899' },
  { key: 'Health',   label: 'Health',   icon: '💪', color: '#10B981' },
  { key: 'Learning', label: 'Learning', icon: '📚', color: '#F59E0B' },
]

// ─── AsyncStorage Keys ────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  TODOS: 'todos',
  NOTES: 'notes',
  AUTH:  'auth_user',
  THEME: 'ui_theme',
}

// ─── Brand / UI Colors (static fallbacks — use useTheme() in components) ──────
export const COLORS = {
  primary:       '#2563EB',
  primaryLight:  '#EFF6FF',
  surface:       '#FFFFFF',
  background:    '#F9FAFB',
  border:        '#E5E7EB',
  textPrimary:   '#111827',
  textSecondary: '#6B7280',
  textMuted:     '#9CA3AF',
  success:       '#22C55E',
  error:         '#EF4444',
  warning:       '#F59E0B',
}

// ─── Filter Chips ─────────────────────────────────────────────────────────────
export const FILTER_CHIPS = [
  { key: 'high',     label: 'High',     type: 'priority', color: '#EF4444' },
  { key: 'medium',   label: 'Medium',   type: 'priority', color: '#F59E0B' },
  { key: 'low',      label: 'Low',      type: 'priority', color: '#10B981' },
  { key: 'Work',     label: 'Work',     type: 'category', color: '#6366F1' },
  { key: 'Personal', label: 'Personal', type: 'category', color: '#EC4899' },
  { key: 'Health',   label: 'Health',   type: 'category', color: '#10B981' },
  { key: 'Learning', label: 'Learning', type: 'category', color: '#F59E0B' },
]

// ─── Theme Modes ──────────────────────────────────────────────────────────────
export const THEME_MODES = {
  LIGHT:  'light',
  DARK:   'dark',
  SYSTEM: 'system',
}

// ─── Sync Status ──────────────────────────────────────────────────────────────
export const SYNC_STATUS = {
  IDLE:    'idle',
  SYNCING: 'syncing',
  SUCCESS: 'success',
  ERROR:   'error',
}

// ─── Sync Timing ──────────────────────────────────────────────────────────────
/** Background sync interval: 5 minutes */
export const SYNC_INTERVAL_MS = 5 * 60 * 1000