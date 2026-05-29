import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '../utils/constants'

/**
 * Minimal auth store — ready to wire up to Supabase when cloud sync is added.
 * Currently operates in local-only mode (no remote calls).
 */
const useAuthStore = create((set) => ({
  // ─── State ────────────────────────────────────────────────────────────────
  user: null,
  isLoggedIn: false,
  isLoading: false,

  // ─── Set user (called after Supabase sign-in) ─────────────────────────────
  setUser: (user) => {
    if (user) {
      AsyncStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user)).catch(() => {})
    }
    set({ user, isLoggedIn: !!user, isLoading: false })
  },

  // ─── Hydrate from local storage ───────────────────────────────────────────
  hydrate: async () => {
    set({ isLoading: true })
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.AUTH)
      const user = raw ? JSON.parse(raw) : null
      set({ user, isLoggedIn: !!user, isLoading: false })
    } catch {
      set({ user: null, isLoggedIn: false, isLoading: false })
    }
  },

  // ─── Logout ───────────────────────────────────────────────────────────────
  logout: async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH).catch(() => {})
    set({ user: null, isLoggedIn: false })
  },
}))

export default useAuthStore
