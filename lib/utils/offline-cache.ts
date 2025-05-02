"use client"

/**
 * Offline Cache Manager
 *
 * This module provides utilities for caching data locally for offline use
 * and synchronizing with the server when back online.
 */

// Cache version - increment when cache structure changes
const CACHE_VERSION = 1

// Cache keys
const CACHE_KEYS = {
  FLAVORS: "conedex_flavors",
  SHOPS: "conedex_shops",
  USER_LOGS: "conedex_user_logs",
  BADGES: "conedex_badges",
  CACHE_META: "conedex_cache_meta",
}

// Cache metadata
interface CacheMeta {
  version: number
  lastUpdated: {
    [key: string]: number
  }
}

/**
 * Initialize cache metadata
 */
export function initCacheMeta(): CacheMeta {
  const defaultMeta: CacheMeta = {
    version: CACHE_VERSION,
    lastUpdated: {},
  }

  try {
    const storedMeta = localStorage.getItem(CACHE_KEYS.CACHE_META)

    if (storedMeta) {
      const parsedMeta = JSON.parse(storedMeta) as CacheMeta

      // If cache version has changed, return default metadata
      if (parsedMeta.version !== CACHE_VERSION) {
        return defaultMeta
      }

      return parsedMeta
    }
  } catch (error) {
    console.error("Error reading cache metadata:", error)
  }

  return defaultMeta
}

/**
 * Save cache metadata
 */
export function saveCacheMeta(meta: CacheMeta): void {
  try {
    localStorage.setItem(CACHE_KEYS.CACHE_META, JSON.stringify(meta))
  } catch (error) {
    console.error("Error saving cache metadata:", error)
  }
}

/**
 * Update cache timestamp for a specific key
 */
export function updateCacheTimestamp(key: string): void {
  try {
    const meta = initCacheMeta()
    meta.lastUpdated[key] = Date.now()
    saveCacheMeta(meta)
  } catch (error) {
    console.error("Error updating cache timestamp:", error)
  }
}

/**
 * Get cache timestamp for a specific key
 */
export function getCacheTimestamp(key: string): number {
  try {
    const meta = initCacheMeta()
    return meta.lastUpdated[key] || 0
  } catch (error) {
    console.error("Error getting cache timestamp:", error)
    return 0
  }
}

/**
 * Check if cache is stale
 * @param key Cache key
 * @param maxAge Maximum age in milliseconds
 */
export function isCacheStale(key: string, maxAge: number): boolean {
  const timestamp = getCacheTimestamp(key)
  const now = Date.now()
  return now - timestamp > maxAge
}

/**
 * Save data to cache
 */
export function saveToCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    updateCacheTimestamp(key)
  } catch (error) {
    console.error(`Error saving to cache (${key}):`, error)
  }
}

/**
 * Get data from cache
 */
export function getFromCache<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key)
    return data ? (JSON.parse(data) as T) : null
  } catch (error) {
    console.error(`Error getting from cache (${key}):`, error)
    return null
  }
}

/**
 * Clear specific cache
 */
export function clearCache(key: string): void {
  try {
    localStorage.removeItem(key)

    // Update metadata
    const meta = initCacheMeta()
    delete meta.lastUpdated[key]
    saveCacheMeta(meta)
  } catch (error) {
    console.error(`Error clearing cache (${key}):`, error)
  }
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  try {
    Object.values(CACHE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })

    // Reset metadata
    saveCacheMeta({
      version: CACHE_VERSION,
      lastUpdated: {},
    })
  } catch (error) {
    console.error("Error clearing all caches:", error)
  }
}

/**
 * Get cache size in bytes
 */
export function getCacheSize(): number {
  try {
    let totalSize = 0

    Object.values(CACHE_KEYS).forEach((key) => {
      const item = localStorage.getItem(key)
      if (item) {
        totalSize += item.length * 2 // Approximate size in bytes (UTF-16)
      }
    })

    return totalSize
  } catch (error) {
    console.error("Error calculating cache size:", error)
    return 0
  }
}

/**
 * Check if storage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = "__storage_test__"
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

// Export cache keys for use in other modules
export { CACHE_KEYS }
