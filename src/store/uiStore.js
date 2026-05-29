import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS, SYNC_STATUS, THEME_MODES } from '../utils/constants'

const useUIStore = create((set) => ({
  // ─── Global loading ───────────────────────────────────────────────────
  loading: false,
  setLoading: (value) => set({ loading: value }),

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
}))

export default useUIStore
