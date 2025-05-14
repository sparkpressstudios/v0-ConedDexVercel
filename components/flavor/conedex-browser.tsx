"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type Flavor = {
  id: string
  name: string
  description: string
  image_url?: string
  popularity: number
  is_logged?: boolean
}

export function ConeDexBrowserComponent() {
  const [flavors, setFlavors] = useState<Flavor[]>([])
  const [filteredFlavors, setFilteredFlavors] = useState<Flavor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadFlavors() {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError("User not authenticated")
          setLoading(false)
          return
        }

        // Get all flavors with popularity count
        const { data: allFlavors, error: flavorsError } = await supabase
          .from("flavors")
          .select(`
            id, 
            name, 
            description, 
            image_url,
            popularity
          `)
          .order("popularity", { ascending: false })
          .limit(20)

        if (flavorsError) {
          throw new Error(flavorsError.message)
        }

        if (!allFlavors) {
          setFlavors([])
          setFilteredFlavors([])
          setLoading(false)
          return
        }

        // Get user's logged flavors
        const { data: userFlavors, error: userFlavorsError } = await supabase
          .from("user_flavor_logs")
          .select("flavor_id")
          .eq("user_id", user.id)

        if (userFlavorsError) {
          throw new Error(userFlavorsError.message)
        }

        const userFlavorIds = new Set(userFlavors?.map((f) => f.flavor_id) || [])

        // Mark flavors that user has logged
        const processedFlavors = allFlavors.map((flavor) => ({
          ...flavor,
          is_logged: userFlavorIds.has(flavor.id),
        }))

        setFlavors(processedFlavors)
        setFilteredFlavors(processedFlavors)
      } catch (err) {
        console.error("Error loading flavors:", err)
        setError(err instanceof Error ? err.message : "Failed to load flavors")
      } finally {
        setLoading(false)
      }
    }

    loadFlavors()
  }, [supabase])

  // Filter flavors when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFlavors(flavors)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = flavors.filter(
      (flavor) => flavor.name.toLowerCase().includes(query) || flavor.description.toLowerCase().includes(query),
    )

    setFilteredFlavors(filtered)
  }, [searchQuery, flavors])

  return (
    <Card>
      <CardHeader>
        <CardTitle>ConeDex Browser</CardTitle>
        <CardDescription>Explore and discover ice cream flavors</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search flavors..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-3 border rounded-md">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredFlavors.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No flavors found matching your search.</p>
            <p className="mt-2">Try a different search term or explore more shops!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredFlavors.map((flavor) => (
              <div
                key={flavor.id}
                className={`p-3 border rounded-md ${flavor.is_logged ? "bg-primary/5 border-primary/20" : ""}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    {flavor.image_url ? (
                      <img
                        src={flavor.image_url || "/placeholder.svg"}
                        alt={flavor.name}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-primary">{flavor.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium truncate">{flavor.name}</h4>
                      {flavor.is_logged && (
                        <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">Logged</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{flavor.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">Popularity: {flavor.popularity}</span>
                      <Link href={`/dashboard/flavors/${flavor.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Add default export
export default function ConeDexBrowser() {
  return <ConeDexBrowserComponent />
}
