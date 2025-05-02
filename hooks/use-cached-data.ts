"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { saveToCache, getFromCache, isCacheStale, CACHE_KEYS } from "@/lib/utils/offline-cache"

interface UseCachedDataOptions<T> {
  key: string
  fetchFn: () => Promise<T>
  maxAge?: number // Maximum age in milliseconds
  dependencies?: any[]
  initialData?: T
}

export function useCachedData<T>({
  key,
  fetchFn,
  maxAge = 5 * 60 * 1000, // 5 minutes default
  dependencies = [],
  initialData,
}: UseCachedDataOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(
    async (forceFetch = false) => {
      setIsLoading(true)
      setError(null)

      try {
        // Check if we're online
        const isOnline = navigator.onLine

        // Try to get data from cache first
        const cachedData = getFromCache<T>(key)

        // If we have cached data and it's not stale or we're offline, use it
        if (cachedData && (!isCacheStale(key, maxAge) || !isOnline) && !forceFetch) {
          setData(cachedData)
          setLastUpdated(new Date())
          setIsLoading(false)
          return
        }

        // If we're offline and don't have cached data, set error
        if (!isOnline && !cachedData) {
          throw new Error("You are offline and no cached data is available")
        }

        // Fetch fresh data
        if (isOnline) {
          const freshData = await fetchFn()
          setData(freshData)
          saveToCache(key, freshData)
          setLastUpdated(new Date())
        }
      } catch (err) {
        console.error(`Error fetching data for ${key}:`, err)
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    },
    [key, fetchFn, maxAge],
  )

  // Refetch data when dependencies change
  useEffect(() => {
    fetchData()
  }, [...dependencies, fetchFn, key, maxAge])

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      // When we come back online, check if cache is stale and refetch if needed
      if (isCacheStale(key, maxAge)) {
        fetchData()
      }
    }

    window.addEventListener("online", handleOnline)

    return () => {
      window.removeEventListener("online", handleOnline)
    }
  }, [fetchData, key, maxAge])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refetch: () => fetchData(true),
  }
}

// Specialized hooks for common data types

export function useCachedFlavors(shopId?: string) {
  const supabase = createClient()

  return useCachedData({
    key: shopId ? `${CACHE_KEYS.FLAVORS}_${shopId}` : CACHE_KEYS.FLAVORS,
    fetchFn: async () => {
      const query = supabase.from("flavors").select("*")

      if (shopId) {
        query.eq("shop_id", shopId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
    dependencies: [shopId],
    maxAge: 30 * 60 * 1000, // 30 minutes
  })
}

export function useCachedShops() {
  const supabase = createClient()

  return useCachedData({
    key: CACHE_KEYS.SHOPS,
    fetchFn: async () => {
      const { data, error } = await supabase.from("shops").select("*")

      if (error) throw error
      return data || []
    },
    maxAge: 60 * 60 * 1000, // 1 hour
  })
}

export function useCachedUserLogs(userId: string | undefined) {
  const supabase = createClient()

  return useCachedData({
    key: `${CACHE_KEYS.USER_LOGS}_${userId}`,
    fetchFn: async () => {
      if (!userId) return []

      const { data, error } = await supabase
        .from("flavor_logs")
        .select(`
          *,
          flavors:flavor_id (name, base_type, image_url),
          shops:shop_id (name, id)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    },
    dependencies: [userId],
    initialData: [],
  })
}
