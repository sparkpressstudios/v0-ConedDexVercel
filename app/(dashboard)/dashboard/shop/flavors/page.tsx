"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { IceCream, PlusCircle, Search, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
// Import the ErrorBoundary at the top of the file
import { ErrorBoundary } from "@/components/ui/error-boundary"

export default function ShopFlavorsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const [flavors, setFlavors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [baseTypeFilter, setBaseTypeFilter] = useState<string[]>([])
  const [availableBaseTypes, setAvailableBaseTypes] = useState<string[]>([])
  const [shop, setShop] = useState<any | null>(null)

  useEffect(() => {
    const fetchShopData = async () => {
      if (!user) return

      setLoading(true)
      try {
        // Get the shop
        const { data: shopData, error: shopError } = await supabase
          .from("shops")
          .select("*")
          .eq("owner_id", user.id)
          .single()

        if (shopError) {
          if (shopError.code === "PGRST116") {
            // No shop found, redirect to claim page
            router.push("/dashboard/shop/claim")
            return
          }
          throw shopError
        }

        setShop(shopData)

        // Get shop flavors
        const { data: flavorData, error: flavorError } = await supabase
          .from("flavors")
          .select("*")
          .eq("shop_id", shopData.id)
          .order("created_at", { ascending: false })

        if (flavorError) throw flavorError

        setFlavors(flavorData || [])

        // Extract unique base types
        const baseTypes = Array.from(new Set(flavorData?.map((flavor) => flavor.base_type || "Ice Cream")))
        setAvailableBaseTypes(baseTypes as string[])
      } catch (error) {
        console.error("Error fetching shop data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchShopData()
  }, [user, supabase, router])

  // Filter flavors based on search query and base type filter
  const filteredFlavors = flavors.filter((flavor) => {
    const matchesSearch =
      flavor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (flavor.description && flavor.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesBaseType = baseTypeFilter.length === 0 || baseTypeFilter.includes(flavor.base_type || "Ice Cream")

    return matchesSearch && matchesBaseType
  })

  const toggleBaseTypeFilter = (baseType: string) => {
    setBaseTypeFilter((current) => {
      if (current.includes(baseType)) {
        return current.filter((type) => type !== baseType)
      } else {
        return [...current, baseType]
      }
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter className="border-t p-4">
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Shop Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You haven't claimed or created a shop yet.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard/shop/claim")} className="w-full">
              Claim or Create Shop
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Wrap the main content with ErrorBoundary
  return (
    <div className="space-y-6">
      <ErrorBoundary>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manage Flavors</h1>
            <p className="text-muted-foreground">
              {shop.name} has {flavors.length} flavor{flavors.length === 1 ? "" : "s"} in the menu
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard/shop/flavors/add")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Flavor
          </Button>
        </div>
      </ErrorBoundary>

      <ErrorBoundary>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search flavors..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {baseTypeFilter.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {baseTypeFilter.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {availableBaseTypes.map((baseType) => (
                <DropdownMenuCheckboxItem
                  key={baseType}
                  checked={baseTypeFilter.includes(baseType)}
                  onCheckedChange={() => toggleBaseTypeFilter(baseType)}
                >
                  {baseType}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ErrorBoundary>

      <ErrorBoundary>
        {filteredFlavors.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed text-center">
            <IceCream className="mb-2 h-8 w-8 text-muted-foreground" />
            {searchQuery || baseTypeFilter.length > 0 ? (
              <>
                <p className="text-muted-foreground">No flavors match your search</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("")
                    setBaseTypeFilter([])
                  }}
                >
                  Clear filters
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">You haven't added any flavors yet</p>
                <Button variant="link" onClick={() => router.push("/dashboard/shop/flavors/add")}>
                  Add your first flavor
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFlavors.map((flavor) => (
              <Card key={flavor.id} className="overflow-hidden">
                {flavor.image_url ? (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={flavor.image_url || "/placeholder.svg?height=200&width=300&query=ice cream scoop"}
                      alt={flavor.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-muted">
                    <IceCream className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{flavor.name}</CardTitle>
                    <Badge variant={flavor.is_available ? "default" : "outline"}>
                      {flavor.is_available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{flavor.base_type || "Ice Cream"}</p>
                </CardHeader>
                <CardContent>
                  {flavor.description && <p className="text-sm line-clamp-2">{flavor.description}</p>}
                </CardContent>
                <CardFooter className="border-t p-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => router.push(`/dashboard/shop/flavors/${flavor.id}`)}
                  >
                    Edit Flavor
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </ErrorBoundary>
    </div>
  )
}
