import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS, SYNC_STATUS, THEME_MODES } from '../utils/constants'

const useUIStore = create((set) => ({
  // ─── Global loading ───────────────────────────────────────────────────
  loading: false,
  setLoading: (value) => set({ loading: value }),

  // ─── Quick Capture ────────────────────────────────────────────────────
  isQuickCaptureOpen: false,
  openQuickCapture: () => set({ isQuickCaptureOpen: true }),
  closeQuickCapture: () => set({ isQuickCaptureOpen: false }),

  // ─── Global Creation Modals ──────────────────────────────────────────
  isAddTodoOpen: false,
  openAddTodo: () => set({ isAddTodoOpen: true }),
  closeAddTodo: () => set({ isAddTodoOpen: false }),

  isAddNoteOpen: false,
  openAddNote: () => set({ isAddNoteOpen: true }),
  closeAddNote: () => set({ isAddNoteOpen: false }),

  // ─── Walkthrough ──────────────────────────────────────────────────────
  hasSeenWalkthrough: false,
  setHasSeenWalkthrough: async (value) => {
    set({ hasSeenWalkthrough: value })
    try {
      await AsyncStorage.setItem('hasSeenWalkthrough', value.toString())
    } catch {}
  },
  hydrateWalkthrough: async () => {
    try {
      const stored = await AsyncStorage.getItem('hasSeenWalkthrough')
      if (stored !== null) {
        set({ hasSeenWalkthrough: stored === 'true' })
      }
    } catch {}
  },

  hasSeenSwipeTutorial: false,
  setHasSeenSwipeTutorial: async (value) => {
    set({ hasSeenSwipeTutorial: value })
    try {
      await AsyncStorage.setItem('hasSeenSwipeTutorial', value.toString())
    } catch {}
  },
  hydrateSwipeTutorial: async () => {
    try {
      const stored = await AsyncStorage.getItem('hasSeenSwipeTutorial')
      if (stored !== null) {
        set({ hasSeenSwipeTutorial: stored === 'true' })
      }
    } catch {}
  },

  // ─── Theme ────────────────────────────────────────────────────────────
  /** 'light' | 'dark' | 'system' */
  themeMode: THEME_MODES.SYSTEM,

  setThemeMode: async (mode) => {
    set({ themeMode: mode })
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, mode)
    } catch {}
  },

  hydrateTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.THEME)
      if (stored && Object.values(THEME_MODES).includes(stored)) {
        set({ themeMode: stored })
      }
    } catch {}
  },

  // ─── Sync status ──────────────────────────────────────────────────────
  /** 'idle' | 'syncing' | 'success' | 'error' */
  syncStatus: SYNC_STATUS.IDLE,
  isSyncing:  false,
  syncError:  null,
  lastSyncedAt: null, // ISO string of last successful sync

  setSyncStatus: (status, error = null) =>
    set({
      syncStatus: status,
      isSyncing:  status === SYNC_STATUS.SYNCING,
      syncError:  error,
    }),

  setLastSynced: (isoString) =>
    set({ lastSyncedAt: isoString }),

  // ─── Undo Batching ──────────────────────────────────────────────────────
  pendingDeletions: [], // [{ id, type: 'todo' | 'note' }]
  addPendingDeletion: (id, type) => set((state) => ({ 
    pendingDeletions: [...state.pendingDeletions, { id, type }] 
  })),
  clearPendingDeletions: () => set({ pendingDeletions: [] }),
}))

export default useUIStore
