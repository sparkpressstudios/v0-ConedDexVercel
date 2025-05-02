"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"

type SyncItem = {
  id: string
  endpoint: string
  method: "POST" | "PUT" | "DELETE"
  data: any
  timestamp: number
}

export function useOfflineSync() {
  const [pendingItems, setPendingItems] = useState<SyncItem[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null)

  // Load pending items from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedItems = localStorage.getItem("conedex_offline_queue")
      if (storedItems) {
        setPendingItems(JSON.parse(storedItems))
      }
    }
  }, [])

  // Save pending items to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined" && pendingItems.length > 0) {
      localStorage.setItem("conedex_offline_queue", JSON.stringify(pendingItems))
    }
  }, [pendingItems])

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (pendingItems.length > 0) {
        syncPendingItems()
      }
    }

    window.addEventListener("online", handleOnline)
    return () => {
      window.removeEventListener("online", handleOnline)
    }
  }, [pendingItems])

  // Add an item to the sync queue
  const addToSyncQueue = (endpoint: string, method: "POST" | "PUT" | "DELETE", data: any) => {
    const newItem: SyncItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      endpoint,
      method,
      data,
      timestamp: Date.now(),
    }

    setPendingItems((prev) => [...prev, newItem])

    // If we're online, try to sync immediately
    if (navigator.onLine) {
      syncPendingItems()
    }

    return newItem.id
  }

  // Update the syncPendingItems function to handle authentication refresh
  const syncPendingItems = async () => {
    if (isSyncing || pendingItems.length === 0 || !navigator.onLine) return

    setIsSyncing(true)

    try {
      // Check if auth token needs refresh
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        // Try to refresh the session
        const { error } = await supabase.auth.refreshSession()
        if (error) {
          console.error("Failed to refresh auth session for offline sync:", error)
          setIsSyncing(false)
          return // Can't sync without auth
        }
      }

      const itemsToSync = [...pendingItems]
      const successfulItems: string[] = []

      for (const item of itemsToSync) {
        try {
          const response = await fetch(item.endpoint, {
            method: item.method,
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(item.data),
          })

          if (response.ok) {
            successfulItems.push(item.id)
          } else {
            // Handle specific error cases
            if (response.status === 401) {
              // Authentication error - try to refresh token again
              const { error } = await supabase.auth.refreshSession()
              if (error) {
                console.error("Failed to refresh auth during sync:", error)
                break // Stop trying if we can't authenticate
              }
              // Retry this item in the next sync cycle
            } else {
              console.error(`Failed to sync item (${response.status}):`, item)
            }
          }
        } catch (error) {
          console.error("Failed to sync item:", item, error)
        }
      }

      // Remove successful items from the queue
      if (successfulItems.length > 0) {
        setPendingItems((prev) => prev.filter((item) => !successfulItems.includes(item.id)))

        // Clear localStorage if no items remain
        if (pendingItems.length === successfulItems.length) {
          localStorage.removeItem("conedex_offline_queue")
        } else {
          localStorage.setItem(
            "conedex_offline_queue",
            JSON.stringify(pendingItems.filter((item) => !successfulItems.includes(item.id))),
          )
        }
      }
    } catch (error) {
      console.error("Error during sync process:", error)
    } finally {
      setIsSyncing(false)
      setLastSyncTime(Date.now())
    }
  }

  return {
    addToSyncQueue,
    pendingItems,
    isSyncing,
    lastSyncTime,
    syncPendingItems,
  }
}
