import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '../utils/constants'
import { generateId } from '../utils/syncHelpers'
import supabase from '../services/supabase'

const useAuthStore = create((set, get) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  isGuest: false,

  setGuestMode: async () => {
    const rawGuest = await AsyncStorage.getItem('GUEST_PROFILE')
    let guestUser = rawGuest ? JSON.parse(rawGuest) : null

    if (!guestUser) {
      guestUser = { 
        id: `guest_${generateId()}`, 
        type: 'guest',
        createdAt: new Date().toISOString(),
        onboardingCompleted: true,
        syncEnabled: false,
        aiEnabled: false,
        appVersion: '1.0.0'
      }
      await AsyncStorage.setItem('GUEST_PROFILE', JSON.stringify(guestUser))
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(guestUser))
    set({ user: guestUser, isLoggedIn: true, isGuest: true })
  },

  hydrate: async () => {
    set({ isLoading: true })
    try {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          set({ user: session.user, isLoggedIn: true, isGuest: false, isLoading: false })
          return
        }
      }

      // Fallback to local guest mode
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.AUTH)
      const localUser = raw ? JSON.parse(raw) : null
      
      if (localUser?.type === 'guest') {
        set({ user: localUser, isLoggedIn: true, isGuest: true, isLoading: false })
      } else {
        set({ user: null, isLoggedIn: false, isGuest: false, isLoading: false })
      }
    } catch (e) {
      console.warn('[authStore] hydrate error:', e)
      set({ user: null, isLoggedIn: false, isGuest: false, isLoading: false })
    }
  },

  logout: async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH).catch(() => {})
    set({ user: null, isLoggedIn: false, isGuest: false })
  },
}))

if (supabase) {
  supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      useAuthStore.setState({ user: session.user, isLoggedIn: true, isGuest: false })
    } else if (event === 'SIGNED_OUT') {
      AsyncStorage.removeItem(STORAGE_KEYS.AUTH).catch(() => {})
      useAuthStore.setState({ user: null, isLoggedIn: false, isGuest: false })
    }
  })
}

export default useAuthStore