import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '../utils/constants'
import { generateId, normalizeLegacyId, nowISO, normalizeIso } from '../utils/syncHelpers'
import { mergeRecords, pruneSyncedDeletes } from '../utils/mergeHelpers'

const STORAGE_KEY = STORAGE_KEYS.TODOS

const todayKey = () => new Date().toISOString().slice(0, 10)

/**
 * Normalise a todo, migrating legacy numeric IDs to UUID on first load.
 */
const normalizeTodo = (t) => ({
  id:        normalizeLegacyId(t.id ?? generateId()),
  title:     t.title      ?? '',
  completed: t.completed  ?? false,
  priority:  t.priority   ?? 'medium',
  category:  t.category   ?? 'General',
  deleted:   t.deleted    ?? false,
  synced:    t.synced     ?? false,
  dateKey:   t.dateKey    ?? '',
  embedding: t.embedding ?? null,
  embedding_text_hash: t.embedding_text_hash ?? null,
  embedding_model: t.embedding_model ?? null,
  embedding_updated_at: normalizeIso(t.embedding_updated_at),
  createdAt: normalizeIso(t.createdAt),
  updatedAt: normalizeIso(t.updatedAt),
})

/** Persist the full todos array (including soft-deleted) to AsyncStorage. */
async function persist(todos) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch (e) {
    console.warn('[todoStore] persist error:', e.message)
  }
}

const useTodoStore = create((set, get) => ({
  // ─── State ───────────────────────────────────────────────────────────────
  /**
   * ALL todos including soft-deleted ones.
   * UI screens filter with: todos.filter(t => !t.deleted)
   */
  todos:    [],
  hydrated: false,

  // ─── Hydrate ─────────────────────────────────────────────────────────────
  hydrate: async () => {
    try {
      const raw    = await AsyncStorage.getItem(STORAGE_KEY)
      const stored = raw ? JSON.parse(raw) : []
      const todos  = stored.map(normalizeTodo)

      // Re-persist if any IDs were migrated (one-time migration)
      const hadLegacyIds = stored.some(
        (t) => typeof t.id === 'number' || (typeof t.id === 'string' && t.id.length <= 8)
      )
      if (hadLegacyIds) await persist(todos)

      set({ todos, hydrated: true })
    } catch {
      set({ todos: [], hydrated: true })
    }
  },

  // ─── Add ─────────────────────────────────────────────────────────────────
  addTodo: ({ title, priority = 'medium', category = 'General', dateKey }) =>
    set((state) => {
      const todo  = normalizeTodo({ id: generateId(), title, priority, category, dateKey })
      const todos = [todo, ...state.todos]
      persist(todos)
      setTimeout(() => require('../services/syncService').triggerSync(), 50)
      return { todos }
    }),

  // ─── Toggle ──────────────────────────────────────────────────────────────
  toggleTodo: (id) =>
    set((state) => {
      const todos = state.todos.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, updatedAt: nowISO(), synced: false }
          : t
      )
      persist(todos)
      setTimeout(() => require('../services/syncService').triggerSync(), 50)
      return { todos }
    }),

  // ─── Soft Delete ─────────────────────────────────────────────────────────
  deleteTodo: (id) =>
    set((state) => {
      const todos = state.todos.map((t) =>
        t.id === id
          ? { ...t, deleted: true, updatedAt: nowISO(), synced: false }
          : t
      )
      persist(todos)
      setTimeout(() => require('../services/syncService').triggerSync(), 50)
      return { todos }
    }),

  // ─── Undo Soft Delete ────────────────────────────────────────────────────
  undoDeleteTodo: (id) =>
    set((state) => {
      const todos = state.todos.map((t) =>
        t.id === id
          ? { ...t, deleted: false, updatedAt: nowISO(), synced: false }
          : t
      )
      persist(todos)
      setTimeout(() => require('../services/syncService').triggerSync(), 50)
      return { todos }
    }),

  // ─── Reorder (drag & drop) ───────────────────────────────────────────────
  reorderTodos: (newTodos) => set({ todos: newTodos }),

  persistTodos: async () => persist(get().todos),

  // ─── Sync: get all unsynced records (active + soft-deleted) ──────────────
  getUnsynced: () => get().todos.filter((t) => !t.synced),

  // ─── Sync: mark IDs as synced + prune synced soft-deletes ─────────────────
  markSynced: (ids) =>
    set((state) => {
      const idSet = new Set(ids)
      let todos   = state.todos.map((t) =>
        idSet.has(t.id) ? { ...t, synced: true } : t
      )
      todos = pruneSyncedDeletes(todos) // remove synced deletions from local store
      persist(todos)
      return { todos }
    }),

  // ─── Sync: merge cloud records into local store ───────────────────────────
  mergeFromCloud: (cloudRecords) =>
    set((state) => {
      const merged = mergeRecords(state.todos, cloudRecords.map(normalizeTodo))
      persist(merged)
      return { todos: merged }
    }),

  // --- Silently update embedding ---
  updateEmbedding: (id, embeddingData) => 
    set((state) => {
      const todos = state.todos.map(t => 
        t.id === id ? { ...t, ...embeddingData } : t
      )
      persist(todos)
      return { todos }
    }),

  // ─── Clear all ───────────────────────────────────────────────────────────
  clearAll: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY)
    set({ todos: [] })
  },
}))

export default useTodoStore