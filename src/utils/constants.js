// ─── Priority Levels ──────────────────────────────────────────────────────────
export const PRIORITIES = [
  { key: 'high',   label: 'High',   colorToken: 'error' },
  { key: 'medium', label: 'Medium', colorToken: 'warning' },
  { key: 'low',    label: 'Low',    colorToken: 'success' },
]

// ─── Task Categories ──────────────────────────────────────────────────────────
export const CATEGORIES = [
  { key: 'General',  label: 'General',  icon: '📋', colorToken: 'textSecondary' },
  { key: 'Work',     label: 'Work',     icon: '💼', colorToken: 'primary' },
  { key: 'Personal', label: 'Personal', icon: '🏠', colorToken: 'warning' },
  { key: 'Health',   label: 'Health',   icon: '💪', colorToken: 'success' },
  { key: 'Learning', label: 'Learning', icon: '📚', colorToken: 'warning' },
]

// ─── AsyncStorage Keys ────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  TODOS: 'todos',
  NOTES: 'notes',
  AUTH:  'auth_user',
  THEME: 'ui_theme',
}

// ─── Filter Chips ─────────────────────────────────────────────────────────────
export const FILTER_CHIPS = [
  { key: 'high',     label: 'High',     type: 'priority', colorToken: 'error' },
  { key: 'medium',   label: 'Medium',   type: 'priority', colorToken: 'warning' },
  { key: 'low',      label: 'Low',      type: 'priority', colorToken: 'success' },
  { key: 'Work',     label: 'Work',     type: 'category', colorToken: 'primary' },
  { key: 'Personal', label: 'Personal', type: 'category', colorToken: 'warning' },
  { key: 'Health',   label: 'Health',   type: 'category', colorToken: 'success' },
  { key: 'Learning', label: 'Learning', type: 'category', colorToken: 'warning' },
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