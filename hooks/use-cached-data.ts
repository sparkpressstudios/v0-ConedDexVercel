"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

// Demo data for flavor logs
const demoFlavorLogs = [
  {
    id: "log1",
    flavor_id: "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    user_id: "user1",
    shop_id: "shop1",
    rating: 4.5,
    notes: "Absolutely delicious! The vanilla flavor was rich and creamy.",
    photo_url: "https://images.unsplash.com/photo-1570197788417-0e82375c9371",
    visit_date: "2023-06-15T14:30:00Z",
    created_at: "2023-06-15T14:30:00Z",
    flavors: {
      name: "Vanilla Bean Dream",
      base_type: "dairy",
      image_url: "https://images.unsplash.com/photo-1570197788417-0e82375c9371",
      category: "classic",
      rarity: "common",
    },
    shops: {
      name: "Sweet Scoops Ice Cream",
      id: "shop1",
    },
  },
  {
    id: "log2",
    flavor_id: "b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
    user_id: "user1",
    shop_id: "shop1",
    rating: 5,
    notes: "The best chocolate ice cream I've ever had! Rich and fudgy.",
    photo_url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb",
    visit_date: "2023-06-10T16:45:00Z",
    created_at: "2023-06-10T16:45:00Z",
    flavors: {
      name: "Chocolate Fudge Brownie",
      base_type: "dairy",
      image_url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb",
      category: "chocolate",
      rarity: "common",
    },
    shops: {
      name: "Sweet Scoops Ice Cream",
      id: "shop1",
    },
  },
  // Add more demo data as needed
]

// Demo data for shops
const demoShops = [
  {
    id: "shop1",
    name: "Sweet Scoops Ice Cream",
    address: "123 Main St, Anytown, USA",
    city: "Anytown",
    state: "CA",
    zip: "12345",
    phone: "555-123-4567",
    website: "https://sweetscoops.example.com",
    description: "A charming ice cream parlor with a wide variety of flavors.",
    logo_url: "https://images.unsplash.com/photo-1581932557745-0a5f0d33bb0c",
    cover_photo: "https://images.unsplash.com/photo-1581932557745-0a5f0d33bb0c",
    hours: {
      monday: "10:00 AM - 9:00 PM",
      tuesday: "10:00 AM - 9:00 PM",
      wednesday: "10:00 AM - 9:00 PM",
      thursday: "10:00 AM - 9:00 PM",
      friday: "10:00 AM - 10:00 PM",
      saturday: "11:00 AM - 10:00 PM",
      sunday: "11:00 AM - 8:00 PM",
    },
    rating: 4.8,
    review_count: 120,
    created_at: "2022-01-15T12:00:00Z",
    updated_at: "2023-05-20T15:30:00Z",
  },
  {
    id: "shop2",
    name: "Frosty's Delights",
    address: "456 Oak Ave, Somewhere, USA",
    city: "Somewhere",
    state: "NY",
    zip: "67890",
    phone: "555-987-6543",
    website: "https://frostys.example.com",
    description: "Artisanal ice cream made with locally sourced ingredients.",
    logo_url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb",
    cover_photo: "https://images.unsplash.com/photo-1563805042-7684c019e1cb",
    hours: {
      monday: "11:00 AM - 8:00 PM",
      tuesday: "11:00 AM - 8:00 PM",
      wednesday: "11:00 AM - 8:00 PM",
      thursday: "11:00 AM - 8:00 PM",
      friday: "11:00 AM - 9:00 PM",
      saturday: "12:00 PM - 9:00 PM",
      sunday: "12:00 PM - 7:00 PM",
    },
    rating: 4.5,
    review_count: 85,
    created_at: "2022-03-10T14:20:00Z",
    updated_at: "2023-04-15T11:45:00Z",
  },
  // Add more demo shops as needed
]

export function useCachedUserLogs(userId?: string) {
  const [data, setData] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // If no userId is provided, return early
    if (!userId) {
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Try to get data from localStorage first
        const cachedData = localStorage.getItem(`user_logs_${userId}`)
        const cacheTimestamp = localStorage.getItem(`user_logs_${userId}_timestamp`)

        // Check if we have valid cached data (less than 5 minutes old)
        if (cachedData && cacheTimestamp) {
          const parsedData = JSON.parse(cachedData)
          const timestamp = Number.parseInt(cacheTimestamp)
          const now = Date.now()

          // If cache is less than 5 minutes old, use it
          if (now - timestamp < 5 * 60 * 1000) {
            setData(parsedData)
            setIsLoading(false)

            // Refresh in background
            fetchFromSupabase(userId).catch(console.error)
            return
          }
        }

        // If no valid cache, fetch from Supabase
        await fetchFromSupabase(userId)
      } catch (err: any) {
        console.error("Error in useCachedUserLogs:", err)
        setError(err)

        // Try to use cached data even if it's old
        try {
          const cachedData = localStorage.getItem(`user_logs_${userId}`)
          if (cachedData) {
            setData(JSON.parse(cachedData))
          } else {
            // If no cached data at all, use demo data
            setData(demoFlavorLogs)
          }
        } catch (cacheErr) {
          console.error("Error reading from cache:", cacheErr)
          // Last resort: use demo data
          setData(demoFlavorLogs)
        }
      } finally {
        setIsLoading(false)
      }
    }

    const fetchFromSupabase = async (userId: string) => {
      try {
        const supabase = createClient()

        // Fetch flavor logs with related data
        const { data: logs, error } = await supabase
          .from("flavor_logs")
          .select(`
            *,
            flavors:flavor_id(*),
            shops:shop_id(*)
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (error) throw error

        // Update state and cache
        setData(logs || [])
        localStorage.setItem(`user_logs_${userId}`, JSON.stringify(logs || []))
        localStorage.setItem(`user_logs_${userId}_timestamp`, Date.now().toString())
      } catch (err) {
        console.error("Error fetching from Supabase:", err)
        throw err
      }
    }

    fetchData()
  }, [userId])

  const refetch = async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      await fetchFromSupabase(userId)
    } catch (err: any) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFromSupabase = async (userId: string) => {
    try {
      const supabase = createClient()

      // Fetch flavor logs with related data
      const { data: logs, error } = await supabase
        .from("flavor_logs")
        .select(`
          *,
          flavors:flavor_id(*),
          shops:shop_id(*)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Update state and cache
      setData(logs || [])
      localStorage.setItem(`user_logs_${userId}`, JSON.stringify(logs || []))
      localStorage.setItem(`user_logs_${userId}_timestamp`, Date.now().toString())
    } catch (err) {
      console.error("Error fetching from Supabase:", err)
      throw err
    }
  }

  return { data, isLoading, error, refetch }
}

export function useCachedShops() {
  const [data, setData] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Try to get data from localStorage first
        const cachedData = localStorage.getItem("shops_cache")
        const cacheTimestamp = localStorage.getItem("shops_cache_timestamp")

        // Check if we have valid cached data (less than 30 minutes old)
        if (cachedData && cacheTimestamp) {
          const parsedData = JSON.parse(cachedData)
          const timestamp = Number.parseInt(cacheTimestamp)
          const now = Date.now()

          // If cache is less than 30 minutes old, use it
          if (now - timestamp < 30 * 60 * 1000) {
            setData(parsedData)
            setIsLoading(false)

            // Refresh in background
            fetchFromSupabase().catch(console.error)
            return
          }
        }

        // If no valid cache, fetch from Supabase
        await fetchFromSupabase()
      } catch (err: any) {
        console.error("Error in useCachedShops:", err)
        setError(err)

        // Try to use cached data even if it's old
        try {
          const cachedData = localStorage.getItem("shops_cache")
          if (cachedData) {
            setData(JSON.parse(cachedData))
          } else {
            // If no cached data at all, use demo data
            setData(demoShops)
          }
        } catch (cacheErr) {
          console.error("Error reading from cache:", cacheErr)
          // Last resort: use demo data
          setData(demoShops)
        }
      } finally {
        setIsLoading(false)
      }
    }

    const fetchFromSupabase = async () => {
      try {
        const supabase = createClient()

        // Fetch shops
        const { data: shops, error } = await supabase.from("shops").select("*").order("name", { ascending: true })

        if (error) throw error

        // Update state and cache
        setData(shops || [])
        localStorage.setItem("shops_cache", JSON.stringify(shops || []))
        localStorage.setItem("shops_cache_timestamp", Date.now().toString())
      } catch (err) {
        console.error("Error fetching from Supabase:", err)
        throw err
      }
    }

    fetchData()
  }, [])

  const refetch = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await fetchFromSupabase()
    } catch (err: any) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFromSupabase = async () => {
    try {
      const supabase = createClient()

      // Fetch shops
      const { data: shops, error } = await supabase.from("shops").select("*").order("name", { ascending: true })

      if (error) throw error

      // Update state and cache
      setData(shops || [])
      localStorage.setItem("shops_cache", JSON.stringify(shops || []))
      localStorage.setItem("shops_cache_timestamp", Date.now().toString())
    } catch (err) {
      console.error("Error fetching from Supabase:", err)
      throw err
    }
  }

  return { data, isLoading, error, refetch }
}

// Add more hooks for other data types as needed
