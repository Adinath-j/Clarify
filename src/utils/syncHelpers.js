/**
 * syncHelpers.js
 * UUID generation + timestamp utilities for offline-first sync.
 *
 * IMPORTANT: 'react-native-get-random-values' MUST be imported before 'uuid'
 * so that crypto.getRandomValues() is polyfilled on native platforms.
 */
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'

/**
 * Generate a new v4 UUID string.
 * Safe to call on both iOS and Android via the polyfill above.
 */
export function generateId() {
  return uuidv4()
}

/**
 * Returns the current time as an ISO 8601 string.
 * Used for all updatedAt / createdAt / deletedAt fields.
 */
export function nowISO() {
  return new Date().toISOString()
}

/**
 * Converts legacy numeric/timestamp IDs to UUID strings during migration.
 * - If the ID is already a UUID string (contains '-'), it is returned as-is.
 * - Otherwise a brand-new UUID is generated.
 *
 * Called once per record during hydrate() on the first app launch after
 * the UUID migration. After re-persisting, all IDs are UUIDs forever.
 *
 * @param {string|number} id
 * @returns {string} UUID
 */
export function normalizeLegacyId(id) {
  if (typeof id === 'string' && id.length > 8) return id // already a UUID
  return uuidv4() // legacy numeric → new UUID
}

/**
 * Parse an updatedAt value into a comparable number (milliseconds).
 * Handles both ISO strings and numeric timestamps gracefully.
 *
 * @param {string|number} ts
 * @returns {number}
 */
export function parseTs(ts) {
  if (!ts) return 0
  if (typeof ts === 'number') return ts
  return new Date(ts).getTime() || 0
}
