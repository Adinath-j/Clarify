import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'notes'

const useNotesStore = create(set => ({
  notes: [],
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      const notes = raw ? JSON.parse(raw) : []
      set({ notes, hydrated: true })
    } catch {
      set({ notes: [], hydrated: true })
    }
  },
}))

export default useNotesStore
