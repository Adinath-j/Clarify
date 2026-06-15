import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '../utils/constants'
import { generateId } from '../utils/syncHelpers'
import supabase from '../services/supabase'
import useTodoStore from './todoStore'
import useNotesStore from './notesStore'

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
      
      // Inject sample data
      const dateKey = require('../utils/date').getDateKey(new Date())
      const sampleTodos = [
        { id: generateId(), title: 'Swipe right to complete me', priority: 'low', category: 'General', dateKey, completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: generateId(), title: 'Swipe left to delete me', priority: 'high', category: 'General', dateKey, completed: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ]
      require('./todoStore').default.setState({ todos: sampleTodos })
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
    
    // Clear local data so another user on the same device doesn't see it
    useTodoStore.getState().clearAll()
    useNotesStore.getState().clearAll()
    
    set({ user: null, isLoggedIn: false, isGuest: false })
  },
}))

if (supabase) {
  supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      useAuthStore.setState({ user: session.user, isLoggedIn: true, isGuest: false })
    } else if (event === 'SIGNED_OUT') {
      AsyncStorage.removeItem(STORAGE_KEYS.AUTH).catch(() => {})
      useTodoStore.getState().clearAll()
      useNotesStore.getState().clearAll()
      useAuthStore.setState({ user: null, isLoggedIn: false, isGuest: false })
    }
  })
}

export default useAuthStore