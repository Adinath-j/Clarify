/**
 * syncService.js
 * Offline-first sync orchestrator.
 *
 * Architecture:
 *   push()   — upload unsynced local records to Supabase
 *   pull()   — fetch cloud records updated since lastSyncedAt
 *   syncAll()— push → pull → merge → mark synced → update lastSyncedAt
 *
 * startSync() — starts the 5-minute background interval
 * stopSync()  — clears the interval (call on app background)
 * triggerSync()— fires syncAll() immediately (debounced by isSyncInProgress lock)
 */

import supabase, {
  upsertTodos,
  upsertNotes,
  fetchTodosSince,
  fetchNotesSince,
} from './supabase'

import useTodoStore    from '../store/todoStore'
import useNotesStore   from '../store/notesStore'
import useAuthStore    from '../store/authStore'
import useNetworkStore from '../store/networkStore'
import useUIStore      from '../store/uiStore'
import { nowISO }      from '../utils/syncHelpers'
import { SYNC_STATUS, SYNC_INTERVAL_MS } from '../utils/constants'

let syncTimer        = null
let isSyncInProgress = false

// ─── Core Sync ───────────────────────────────────────────────────────────────

export async function syncAll() {
  // ── Guards ──────────────────────────────────────────────────────────────
  if (isSyncInProgress)                    return
  if (!supabase)                           return // no cloud client
  const { isOnline }  = useNetworkStore.getState()
  if (!isOnline)                           return
  const { user }      = useAuthStore.getState()
  if (!user?.id)                           return // not authenticated

  isSyncInProgress = true

  const { setSyncStatus, setLastSynced, lastSyncedAt } = useUIStore.getState()
  const { getUnsynced: getTodoUnsynced, mergeFromCloud: mergeTodos, markSynced: markTodosSynced } = useTodoStore.getState()
  const { getUnsynced: getNoteUnsynced, mergeFromCloud: mergeNotes, markSynced: markNotesSynced } = useNotesStore.getState()

  setSyncStatus(SYNC_STATUS.SYNCING)

  try {
    // ── 1. PUSH unsynced local → cloud ───────────────────────────────────
    const unsyncedTodos = getTodoUnsynced()
    const unsyncedNotes = getNoteUnsynced()

    await Promise.all([
      unsyncedTodos.length > 0 ? upsertTodos(user.id, unsyncedTodos) : Promise.resolve(),
      unsyncedNotes.length > 0 ? upsertNotes(user.id, unsyncedNotes) : Promise.resolve(),
    ])

    // ── 2. PULL cloud → local (delta) ────────────────────────────────────
    const since = lastSyncedAt ?? new Date(0).toISOString()
    const [cloudTodos, cloudNotes] = await Promise.all([
      fetchTodosSince(user.id, since),
      fetchNotesSince(user.id, since),
    ])

    // ── 3. MERGE ─────────────────────────────────────────────────────────
    if (cloudTodos.length > 0) mergeTodos(cloudTodos)
    if (cloudNotes.length > 0) mergeNotes(cloudNotes)

    // ── 4. MARK SYNCED ───────────────────────────────────────────────────
    markTodosSynced(unsyncedTodos.map((t) => t.id))
    markNotesSynced(unsyncedNotes.map((n) => n.id))

    // ── 5. UPDATE LAST SYNCED ────────────────────────────────────────────
    const now = nowISO()
    setLastSynced(now)
    setSyncStatus(SYNC_STATUS.SUCCESS)

    // Auto-reset status to idle after 3 seconds
    setTimeout(() => {
      useUIStore.getState().setSyncStatus(SYNC_STATUS.IDLE)
    }, 3000)

  } catch (err) {
    console.warn('[SyncService] syncAll error:', err.message)
    setSyncStatus(SYNC_STATUS.ERROR, err.message)
  } finally {
    isSyncInProgress = false
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fire an immediate sync. Safe to call any time — the isSyncInProgress
 * lock prevents duplicate concurrent runs.
 */
export function triggerSync() {
  syncAll()
}

/**
 * Start the background sync interval (every SYNC_INTERVAL_MS).
 * Idempotent — safe to call multiple times.
 */
export function startSync() {
  if (syncTimer) return
  // Initial sync on start (non-blocking)
  triggerSync()
  syncTimer = setInterval(triggerSync, SYNC_INTERVAL_MS)
  console.log('[SyncService] Background sync started.')
}

/**
 * Stop the background sync interval.
 * Call when the app goes to background (in useAppLifecycle).
 */
export function stopSync() {
  if (syncTimer) {
    clearInterval(syncTimer)
    syncTimer = null
    console.log('[SyncService] Background sync stopped.')
  }
}
