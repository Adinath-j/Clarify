import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'todos'

const todayKey = () => new Date().toISOString().slice(0, 10)

const normalizeTodo = t => ({
  id: t.id,
  title: t.title,
  completed: t.completed ?? false,
  priority: t.priority ?? 'medium',
  category: t.category ?? 'General',
  dateKey: t.dateKey ?? todayKey(),
  updatedAt: t.updatedAt ?? Date.now(),
})

const useTodoStore = create((set, get) => ({
  // ---------- state ----------
  todos: [],
  hydrated: false,
  lastDeleted: null,

  // ---------- hydrate ----------
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      const stored = raw ? JSON.parse(raw) : []
      const todos = stored.map(normalizeTodo)
      set({ todos, hydrated: true })
    } catch {
      set({ todos: [], hydrated: true })
    }
  },

  // ---------- add ----------
  addTodo: ({ title, priority = 'medium', category = 'General', dateKey }) =>
    set(state => {
      const todo = normalizeTodo({
        id: Date.now(),
        title,
        priority,
        category,
        dateKey: dateKey ?? todayKey(),
        completed: false,
      })

      const todos = [todo, ...state.todos]
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
      return { todos }
    }),

  // ---------- toggle ----------
  toggleTodo: id =>
    set(state => {
      const todos = state.todos.map(t =>
        t.id === id
          ? { ...t, completed: !t.completed, updatedAt: Date.now() }
          : t
      )
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
      return { todos }
    }),

  // ---------- delete ----------
  deleteTodo: id =>
    set(state => {
      const todos = state.todos.filter(t => t.id !== id)
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
      return { todos }
    }),

  // ---------- delete with undo ----------
  deleteTodoWithUndo: todo =>
    set(state => {
      const todos = state.todos.filter(t => t.id !== todo.id)
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
      return { todos, lastDeleted: todo }
    }),

  undoDelete: () =>
    set(state => {
      if (!state.lastDeleted) return {}
      const restored = {
        ...state.lastDeleted,
        updatedAt: Date.now(),
      }
      const todos = [restored, ...state.todos]
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
      return { todos, lastDeleted: null }
    }),

  // ---------- reorder (drag) ----------
  reorderTodos: newTodos =>
    set(() => {
      return { todos: newTodos }
    }),

  persistTodos: async () => {
    const todos = get().todos
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  },

  // ---------- clear ----------
  clearAll: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY)
    set({ todos: [], lastDeleted: null })
  },
}))

export default useTodoStore