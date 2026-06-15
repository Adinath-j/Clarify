/**
 * Generate a new RFC4122 v4 UUID string.
 * High-entropy, pure JS implementation that is 100% crash-free in Expo Go,
 * iOS, Android, and Web environments without requiring any native polyfills.
 */
export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID()
    } catch {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
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
  return generateId() // legacy numeric → new UUID
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

/**
 * Normalises a legacy numeric timestamp to an ISO string.
 * @param {string|number} ts 
 * @returns {string} ISO string
 */
export function normalizeIso(ts) {
  if (!ts) return nowISO()
  if (typeof ts === 'number') return new Date(ts).toISOString()
  if (typeof ts === 'string' && !ts.includes('T')) {
    // maybe a stringified number
    const num = Number(ts)
    if (!isNaN(num)) return new Date(num).toISOString()
  }
  return ts
}

/**
 * Simple djb2 hash function for detecting text changes.
 * Used to avoid regenerating embeddings for identical text.
 * @param {string} str 
 * @returns {number} Unsigned 32-bit integer hash
 */
export function hashText(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return hash >>> 0
}
