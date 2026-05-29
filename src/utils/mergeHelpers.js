/**
 * mergeHelpers.js
 * Conflict resolution and record merging for offline-first sync.
 * Uses last-write-wins strategy based on updatedAt timestamps.
 */
import { parseTs } from './syncHelpers'

/**
 * Merges a local array of records with a cloud array of the same type.
 * Rules:
 *   - If a record exists only locally → keep it (may be unsynced)
 *   - If a record exists only in cloud → add it
 *   - If a record exists in both → keep whichever has the larger updatedAt
 *
 * Cloud records that win are marked synced: true.
 * Local records that win retain their synced: false state.
 *
 * @param {Array} local  - Local records array
 * @param {Array} cloud  - Cloud records array
 * @returns {Array} Merged, de-duplicated array
 */
export function mergeRecords(local, cloud) {
  const map = new Map()

  // Seed with all local records first
  for (const item of local) {
    map.set(item.id, item)
  }

  // Apply cloud records — cloud wins if it is newer
  for (const cloudItem of cloud) {
    const localItem = map.get(cloudItem.id)

    if (!localItem) {
      // New record from cloud — add it, mark as synced
      map.set(cloudItem.id, { ...cloudItem, synced: true })
    } else if (parseTs(cloudItem.updatedAt) > parseTs(localItem.updatedAt)) {
      // Cloud is newer — use cloud version, mark synced
      map.set(cloudItem.id, { ...cloudItem, synced: true })
    }
    // else: local is newer or equal → keep local (already in map)
  }

  return Array.from(map.values())
}

/**
 * Returns all records that have not yet been pushed to the cloud.
 * Includes both active and soft-deleted unsynced records.
 *
 * @param {Array} records
 * @returns {Array}
 */
export function extractUnsynced(records) {
  return records.filter((r) => !r.synced)
}

/**
 * Returns only the soft-deleted records that have not been synced.
 * Used to push deletions to the cloud before pruning local storage.
 *
 * @param {Array} records
 * @returns {Array}
 */
export function extractPendingDeletes(records) {
  return records.filter((r) => r.deleted && !r.synced)
}

/**
 * Removes soft-deleted records that have already been synced to the cloud.
 * Call after a successful push to prune local storage.
 *
 * @param {Array} records
 * @returns {Array} Records with synced deletions pruned
 */
export function pruneSyncedDeletes(records) {
  return records.filter((r) => !(r.deleted && r.synced))
}
