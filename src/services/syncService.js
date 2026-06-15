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
import { nowISO, hashText } from '../utils/syncHelpers'
import { SYNC_STATUS, SYNC_INTERVAL_MS } from '../utils/constants'

let syncTimer        = null
let isSyncInProgress = false

// ─── Core Sync ───────────────────────────────────────────────────────────────

export async function syncAll() {
  console.log('[SyncService] syncAll triggered')
  // ── Guards ──────────────────────────────────────────────────────────────
  if (isSyncInProgress) {
    console.log('[SyncService] Aborting: Sync already in progress')
    return
  }
  if (!supabase) {
    console.log('[SyncService] Aborting: Supabase client is null')
    return
  }
  
  const { isOnline }  = useNetworkStore.getState()
  if (!isOnline) {
    console.log('[SyncService] Aborting: Device is offline')
    return
  }
  
  const { user }      = useAuthStore.getState()
  if (!user?.id) {
    console.log('[SyncService] Aborting: User is not authenticated / user ID is missing')
    return
  }

  console.log('[SyncService] All guards passed. Proceeding with sync for user:', user.id)
  isSyncInProgress = true

  const { setSyncStatus, setLastSynced, lastSyncedAt } = useUIStore.getState()
  const { getUnsynced: getTodoUnsynced, mergeFromCloud: mergeTodos, markSynced: markTodosSynced } = useTodoStore.getState()
  const { getUnsynced: getNoteUnsynced, mergeFromCloud: mergeNotes, markSynced: markNotesSynced } = useNotesStore.getState()

  setSyncStatus(SYNC_STATUS.SYNCING)

  try {
    let unsyncedTodos = getTodoUnsynced()
    let unsyncedNotes = getNoteUnsynced()
    
    // ── 1. PUSH unsynced local → cloud ───────────────────────────────────
    
    console.log(`[SyncService] Pushing ${unsyncedTodos.length} todos and ${unsyncedNotes.length} notes...`)

    await Promise.all([
      unsyncedTodos.length > 0 ? upsertTodos(user.id, unsyncedTodos) : Promise.resolve(),
      unsyncedNotes.length > 0 ? upsertNotes(user.id, unsyncedNotes) : Promise.resolve(),
    ])

    console.log('[SyncService] Push successful. Pulling from cloud...')

    // ── 2. PULL cloud → local (delta) ────────────────────────────────────
    const since = lastSyncedAt ?? new Date(0).toISOString()
    const [cloudTodos, cloudNotes] = await Promise.all([
      fetchTodosSince(user.id, since),
      fetchNotesSince(user.id, since),
    ])
    
    console.log(`[SyncService] Pull successful. Fetched ${cloudTodos.length} todos and ${cloudNotes.length} notes.`)

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
    console.log('[SyncService] Sync sequence finished.')
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
