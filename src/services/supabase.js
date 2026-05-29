/**
 * supabase.js — UUID-aware, soft-delete-aware Supabase client + CRUD helpers.
 *
 * Activate by creating a .env file:
 *   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 *
 * Without env vars the app runs 100% offline — no errors thrown.
 */

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

let supabase = null

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    const { createClient } = require('@supabase/supabase-js')
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession:    true,
        autoRefreshToken:  true,
        detectSessionInUrl: false,
      },
    })
    console.log('[Supabase] Client initialised.')
  } catch (e) {
    console.warn('[Supabase] Could not create client:', e.message)
  }
} else {
  console.log('[Supabase] Offline mode — no env vars set.')
}

export default supabase

// ─── Column mapping helpers ───────────────────────────────────────────────────

/** Convert local camelCase todo → snake_case DB row */
const todoToRow = (userId, t) => ({
  id:         t.id,
  user_id:    userId,
  title:      t.title,
  completed:  t.completed,
  priority:   t.priority,
  category:   t.category,
  date_key:   t.dateKey,
  deleted:    t.deleted  ?? false,
  created_at: t.createdAt,
  updated_at: t.updatedAt,
})

/** Convert DB row → local camelCase todo */
const rowToTodo = (r) => ({
  id:        r.id,
  title:     r.title,
  completed: r.completed,
  priority:  r.priority,
  category:  r.category,
  dateKey:   r.date_key,
  deleted:   r.deleted,
  synced:    true,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

/** Convert local camelCase note → snake_case DB row */
const noteToRow = (userId, n) => ({
  id:         n.id,
  user_id:    userId,
  title:      n.title,
  body:       n.body,
  pinned:     n.pinned,
  deleted:    n.deleted  ?? false,
  created_at: n.createdAt,
  updated_at: n.updatedAt,
})

/** Convert DB row → local camelCase note */
const rowToNote = (r) => ({
  id:        r.id,
  title:     r.title,
  body:      r.body,
  pinned:    r.pinned,
  deleted:   r.deleted,
  synced:    true,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * Upsert an array of todos to Supabase (insert or update by id).
 * Includes soft-deleted items so cloud knows to delete them on other devices.
 */
export async function upsertTodos(userId, todos) {
  if (!supabase || !todos.length) return
  const rows = todos.map((t) => todoToRow(userId, t))
  const { error } = await supabase.from('todos').upsert(rows, { onConflict: 'id' })
  if (error) throw new Error(`[Supabase] upsertTodos: ${error.message}`)
}

/**
 * Upsert notes. Includes soft-deleted items.
 */
export async function upsertNotes(userId, notes) {
  if (!supabase || !notes.length) return
  const rows = notes.map((n) => noteToRow(userId, n))
  const { error } = await supabase.from('notes').upsert(rows, { onConflict: 'id' })
  if (error) throw new Error(`[Supabase] upsertNotes: ${error.message}`)
}

/**
 * Delta fetch — todos updated after `since` ISO timestamp.
 * Returns normalised local-format objects.
 */
export async function fetchTodosSince(userId, since) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .gt('updated_at', since)
    .order('updated_at', { ascending: false })
  if (error) throw new Error(`[Supabase] fetchTodosSince: ${error.message}`)
  return (data ?? []).map(rowToTodo)
}

/**
 * Delta fetch — notes updated after `since` ISO timestamp.
 */
export async function fetchNotesSince(userId, since) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .gt('updated_at', since)
    .order('updated_at', { ascending: false })
  if (error) throw new Error(`[Supabase] fetchNotesSince: ${error.message}`)
  return (data ?? []).map(rowToNote)
}
