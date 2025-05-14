"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  Plus,
  Download,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash,
  Eye,
  MapPin,
  Star,
  StarOff,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ShopsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shops, setShops] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setIsLoading(true)
        const supabase = createClient()

        // In a real app, we'd fetch from the database
        // For now, let's use mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockShops = [
          {
            id: "shop_1",
            name: "Creamy Delights",
            address: "123 Main St, New York, NY",
            status: "active",
            is_claimed: true,
            is_verified: true,
            is_featured: true,
            owner_id: "usr_2",
            owner_name: "Sarah Johnson",
            created_at: "2023-05-12T10:30:00Z",
            flavor_count: 24,
            rating: 4.7,
            review_count: 56,
          },
          {
            id: "shop_2",
            name: "Frosty Scoops",
            address: "456 Elm St, Chicago, IL",
            status: "active",
            is_claimed: true,
            is_verified: true,
            is_featured: false,
            owner_id: "usr_4",
            owner_name: "Emma Wilson",
            created_at: "2023-06-03T09:15:00Z",
            flavor_count: 18,
            rating: 4.5,
            review_count: 42,
          },
          {
            id: "shop_3",
            name: "Sweet Treats Ice Cream",
            address: "789 Oak Ave, Los Angeles, CA",
            status: "active",
            is_claimed: false,
            is_verified: false,
            is_featured: false,
            owner_id: null,
            owner_name: null,
            created_at: "2023-04-18T14:45:00Z",
            flavor_count: 0,
            rating: 4.2,
            review_count: 28,
          },
          {
            id: "shop_4",
            name: "Scoops Delight",
            address: "321 Pine St, Seattle, WA",
            status: "active",
            is_claimed: true,
            is_verified: false,
            is_featured: false,
            owner_id: "usr_7",
            owner_name: "David Kim",
            created_at: "2023-07-22T16:20:00Z",
            flavor_count: 15,
            rating: 4.3,
            review_count: 31,
          },
          {
            id: "shop_5",
            name: "Glacier Ice Cream",
            address: "555 Maple Dr, Denver, CO",
            status: "active",
            is_claimed: false,
            is_verified: false,
            is_featured: false,
            owner_id: null,
            owner_name: null,
            created_at: "2023-03-10T08:30:00Z",
            flavor_count: 0,
            rating: 4.0,
            review_count: 19,
          },
          {
            id: "shop_6",
            name: "Frozen Bliss",
            address: "888 Cedar Ln, Austin, TX",
            status: "inactive",
            is_claimed: false,
            is_verified: false,
            is_featured: false,
            owner_id: null,
            owner_name: null,
            created_at: "2023-08-05T11:10:00Z",
            flavor_count: 0,
            rating: 3.8,
            review_count: 12,
          },
          {
            id: "shop_7",
            name: "Chill Zone",
            address: "222 Birch Rd, Miami, FL",
            status: "active",
            is_claimed: true,
            is_verified: true,
            is_featured: true,
            owner_id: "usr_9",
            owner_name: "Robert Garcia",
            created_at: "2023-05-30T13:45:00Z",
            flavor_count: 22,
            rating: 4.8,
            review_count: 64,
          },
          {
            id: "shop_8",
            name: "Arctic Treats",
            address: "777 Walnut Blvd, Boston, MA",
            status: "pending_review",
            is_claimed: true,
            is_verified: false,
            is_featured: false,
            owner_id: "usr_11",
            owner_name: "Jennifer Taylor",
            created_at: "2023-07-14T10:20:00Z",
            flavor_count: 0,
            rating: 0,
            review_count: 0,
          },
        ]

        setShops(mockShops)
      } catch (err) {
        console.error("Error fetching shops:", err)
        setError("Failed to load shops. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchShops()
  }, [])

  // Filter shops based on search query and active tab
  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (shop.owner_name && shop.owner_name.toLowerCase().includes(searchQuery.toLowerCase()))

    if (activeTab === "all") return matchesSearch
    if (activeTab === "claimed") return matchesSearch && shop.is_claimed
    if (activeTab === "unclaimed") return matchesSearch && !shop.is_claimed
    if (activeTab === "verified") return matchesSearch && shop.is_verified
    if (activeTab === "featured") return matchesSearch && shop.is_featured

    return matchesSearch
  })

  const handleViewShop = (shopId: string) => {
    router.push(`/dashboard/admin/shops/${shopId}`)
  }

  const handleEditShop = (shopId: string) => {
    router.push(`/dashboard/admin/shops/${shopId}/edit`)
  }

  const handleDeleteShop = (shopId: string) => {
    // In a real app, we'd call an API to delete the shop
    alert(`Delete shop ${shopId} (This would be a confirmation modal in the real app)`)
  }

  const handleToggleFeatured = (shopId: string, currentStatus: boolean) => {
    // In a real app, we'd call an API to toggle featured status
    alert(`${currentStatus ? "Remove from" : "Add to"} featured shops: ${shopId}`)
  }

  if (isLoading) {
    return <ShopsPageSkeleton />
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Shops</h2>
        <p className="text-red-700">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Shop Management</h1>
          <p className="text-muted-foreground">Manage and monitor ice cream shops</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Shop
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search shops..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="sm:ml-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Shops</TabsTrigger>
          <TabsTrigger value="claimed">Claimed</TabsTrigger>
          <TabsTrigger value="unclaimed">Unclaimed</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <ShopsTable
            shops={filteredShops}
            onView={handleViewShop}
            onEdit={handleEditShop}
            onDelete={handleDeleteShop}
            onToggleFeatured={handleToggleFeatured}
          />
        </TabsContent>

        <TabsContent value="claimed" className="mt-6">
          <ShopsTable
            shops={filteredShops}
            onView={handleViewShop}
            onEdit={handleEditShop}
            onDelete={handleDeleteShop}
            onToggleFeatured={handleToggleFeatured}
          />
        </TabsContent>

        <TabsContent value="unclaimed" className="mt-6">
          <ShopsTable
            shops={filteredShops}
            onView={handleViewShop}
            onEdit={handleEditShop}
            onDelete={handleDeleteShop}
            onToggleFeatured={handleToggleFeatured}
          />
        </TabsContent>

        <TabsContent value="verified" className="mt-6">
          <ShopsTable
            shops={filteredShops}
            onView={handleViewShop}
            onEdit={handleEditShop}
            onDelete={handleDeleteShop}
            onToggleFeatured={handleToggleFeatured}
          />
        </TabsContent>

        <TabsContent value="featured" className="mt-6">
          <ShopsTable
            shops={filteredShops}
            onView={handleViewShop}
            onEdit={handleEditShop}
            onDelete={handleDeleteShop}
            onToggleFeatured={handleToggleFeatured}
          />
        </TabsContent>
      </Tabs>

      <div className="text-sm text-muted-foreground">
        Showing {filteredShops.length} of {shops.length} shops
      </div>
    </div>
  )
}

function ShopsTable({
  shops,
  onView,
  onEdit,
  onDelete,
  onToggleFeatured,
}: {
  shops: any[]
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onToggleFeatured: (id: string, currentStatus: boolean) => void
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                <div className="flex items-center gap-1">
                  Shop Name
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Flavors</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shops.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No shops found
                </TableCell>
              </TableRow>
            ) : (
              shops.map((shop) => (
                <TableRow key={shop.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(shop.id)}>
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center">
                        {shop.name}
                        {shop.is_featured && (
                          <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">Featured</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {shop.address}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <ShopStatusBadge status={shop.status} />
                      <div className="flex space-x-1">
                        {shop.is_claimed && (
                          <Badge variant="outline" className="text-xs">
                            Claimed
                          </Badge>
                        )}
                        {shop.is_verified && (
                          <Badge variant="outline" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {shop.owner_name ? (
                      <div className="text-sm">{shop.owner_name}</div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Unclaimed</div>
                    )}
                  </TableCell>
                  <TableCell>{shop.flavor_count}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {shop.rating > 0 ? (
                        <>
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
                          <span>{shop.rating}</span>
                          <span className="text-muted-foreground ml-1">({shop.review_count})</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">No ratings</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onView(shop.id)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(shop.id)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit shop
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleFeatured(shop.id, shop.is_featured)
                          }}
                        >
                          {shop.is_featured ? (
                            <>
                              <StarOff className="mr-2 h-4 w-4" />
                              Remove from featured
                            </>
                          ) : (
                            <>
                              <Star className="mr-2 h-4 w-4" />
                              Add to featured
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(shop.id)
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete shop
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ShopStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    case "inactive":
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Inactive</Badge>
    case "pending_review":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pending Review</Badge>
    case "suspended":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Suspended</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function ShopsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 w-full sm:w-64" />
        <Skeleton className="h-10 w-32 sm:ml-auto" />
      </div>

      <Skeleton className="h-10 w-full" />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div>
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-4 w-56" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Skeleton className="h-4 w-48" />
    </div>
  )
}
