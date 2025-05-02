"use client"

import { useState, useEffect } from "react"

interface CachedDataOptions<T> {
  key: string
  fetcher: () => Promise<T>
  initialData?: T
  maxAge?: number // in milliseconds
}

export function useCachedData<T>({
  key,
  fetcher,
  initialData,
  maxAge = 1000 * 60 * 5, // 5 minutes by default
}: CachedDataOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastFetched, setLastFetched] = useState<number | null>(null)

  const fetchData = async (force = false) => {
    // If we have data and it's not expired, use it
    if (!force && data && lastFetched && Date.now() - lastFetched < maxAge) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Try to get from cache first
      if (typeof window !== "undefined" && !force) {
        const cachedItem = localStorage.getItem(`conedex_cache_${key}`)
        if (cachedItem) {
          const { data: cachedData, timestamp } = JSON.parse(cachedItem)
          if (Date.now() - timestamp < maxAge) {
            setData(cachedData)
            setLastFetched(timestamp)
            setIsLoading(false)
            return
          }
        }
      }

      // If we're offline and have cached data, use it regardless of age
      if (typeof window !== "undefined" && !navigator.onLine) {
        const cachedItem = localStorage.getItem(`conedex_cache_${key}`)
        if (cachedItem) {
          const { data: cachedData, timestamp } = JSON.parse(cachedItem)
          setData(cachedData)
          setLastFetched(timestamp)
          setIsLoading(false)
          return
        }
      }

      // If we're offline and don't have cached data, set error
      if (typeof window !== "undefined" && !navigator.onLine) {
        throw new Error("You are offline and this data is not available offline")
      }

      // Fetch fresh data
      const freshData = await fetcher()
      setData(freshData)
      setLastFetched(Date.now())

      // Cache the data
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `conedex_cache_${key}`,
          JSON.stringify({
            data: freshData,
            timestamp: Date.now(),
          }),
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [key])

  return {
    data,
    isLoading,
    error,
    refetch: () => fetchData(true),
    lastFetched,
  }
}
