import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '../utils/constants'
import { generateId, normalizeLegacyId, nowISO, normalizeIso } from '../utils/syncHelpers'
import { mergeRecords, pruneSyncedDeletes } from '../utils/mergeHelpers'

const STORAGE_KEY = STORAGE_KEYS.NOTES

/**
 * Normalise a note, migrating legacy numeric IDs to UUID on first load.
 */
const normalizeNote = (n) => ({
  id:        normalizeLegacyId(n.id ?? generateId()),
  title:     n.title     ?? 'Untitled',
  body:      n.body      ?? '',
  pinned:    n.pinned    ?? false,
  deleted:   n.deleted   ?? false,
  synced:    n.synced    ?? false,
  createdAt: normalizeIso(n.createdAt),
  updatedAt: normalizeIso(n.updatedAt),
})

async function persist(notes) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  } catch (e) {
    console.warn('[notesStore] persist error:', e.message)
  }
}

const useNotesStore = create((set, get) => ({
  // ─── State ───────────────────────────────────────────────────────────────
  /**
   * ALL notes including soft-deleted.
   * UI screens filter with: notes.filter(n => !n.deleted)
   */
  notes:    [],
  hydrated: false,

  // ─── Hydrate ─────────────────────────────────────────────────────────────
  hydrate: async () => {
    try {
      const raw    = await AsyncStorage.getItem(STORAGE_KEY)
      const stored = raw ? JSON.parse(raw) : []
      const notes  = stored.map(normalizeNote)

      const hadLegacyIds = stored.some(
        (n) => typeof n.id === 'number' || (typeof n.id === 'string' && n.id.length <= 8)
      )
      if (hadLegacyIds) await persist(notes)

      set({ notes, hydrated: true })
    } catch {
      set({ notes: [], hydrated: true })
    }
  },

  // ─── Persist helper ───────────────────────────────────────────────────────
  persistNotes: async () => persist(get().notes),

  // ─── Add ─────────────────────────────────────────────────────────────────
  addNote: ({ title, body = '' }) =>
    set((state) => {
      const note  = normalizeNote({ id: generateId(), title: title.trim() || 'Untitled', body })
      const notes = [note, ...state.notes]
      persist(notes)
      return { notes }
    }),

  // ─── Edit ────────────────────────────────────────────────────────────────
  editNote: (id, { title, body }) =>
    set((state) => {
      const notes = state.notes.map((n) =>
        n.id === id
          ? { ...n, title: title ?? n.title, body: body ?? n.body, updatedAt: nowISO(), synced: false }
          : n
      )
      persist(notes)
      return { notes }
    }),

  // ─── Toggle Pin ──────────────────────────────────────────────────────────
  togglePin: (id) =>
    set((state) => {
      const notes = state.notes.map((n) =>
        n.id === id ? { ...n, pinned: !n.pinned, updatedAt: nowISO(), synced: false } : n
      )
      persist(notes)
      return { notes }
    }),

  // ─── Soft Delete ─────────────────────────────────────────────────────────
  deleteNote: (id) =>
    set((state) => {
      const notes = state.notes.map((n) =>
        n.id === id
          ? { ...n, deleted: true, updatedAt: nowISO(), synced: false }
          : n
      )
      persist(notes)
      return { notes }
    }),

  // ─── Undo Soft Delete ────────────────────────────────────────────────────
  undoDeleteNote: (id) =>
    set((state) => {
      const notes = state.notes.map((n) =>
        n.id === id
          ? { ...n, deleted: false, updatedAt: nowISO(), synced: false }
          : n
      )
      persist(notes)
      return { notes }
    }),

  // ─── Sync: get unsynced ───────────────────────────────────────────────────
  getUnsynced: () => get().notes.filter((n) => !n.synced),

  // ─── Sync: mark IDs as synced + prune soft-deletes ────────────────────────
  markSynced: (ids) =>
    set((state) => {
      const idSet = new Set(ids)
      let notes   = state.notes.map((n) =>
        idSet.has(n.id) ? { ...n, synced: true } : n
      )
      notes = pruneSyncedDeletes(notes)
      persist(notes)
      return { notes }
    }),

  // ─── Sync: merge cloud records ────────────────────────────────────────────
  mergeFromCloud: (cloudRecords) =>
    set((state) => {
      const merged = mergeRecords(state.notes, cloudRecords.map(normalizeNote))
      persist(merged)
      return { notes: merged }
    }),

  // ─── Clear all ───────────────────────────────────────────────────────────
  clearAll: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY)
    set({ notes: [] })
  },
}))

export default useNotesStore
