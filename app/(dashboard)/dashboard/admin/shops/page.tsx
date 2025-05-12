import Link from "next/link"
import { Search, MoreHorizontal, Plus, MapPin, Phone, Globe, Store, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createServerClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"

export const dynamic = "force-dynamic"

export default async function ShopsManagementPage({ searchParams }: { searchParams: { q?: string; status?: string } }) {
  const supabase = await createServerClient()

  // Get query parameters
  const searchQuery = searchParams.q || ""
  const statusFilter = searchParams.status || "all"

  // Build the query
  let query = supabase.from("shops").select(`
    *,
    owner:owner_id(id, email, full_name),
    reviews:reviews(count)
  `)

  // Apply filters
  if (searchQuery) {
    query = query.ilike("name", `%${searchQuery}%`)
  }

  if (statusFilter === "claimed") {
    query = query.not("owner_id", "is", null)
  } else if (statusFilter === "unclaimed") {
    query = query.is("owner_id", null)
  } else if (statusFilter === "pending") {
    query = query.eq("status", "pending")
  }

  // Execute the query
  const { data: shops, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching shops:", error)
  }

  // Count shops by status
  const claimedCount = shops?.filter((shop) => shop.owner_id).length || 0
  const unclaimedCount = shops?.filter((shop) => !shop.owner_id).length || 0
  const pendingCount = shops?.filter((shop) => shop.status === "pending").length || 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Shop Management</h1>
          <p className="text-muted-foreground">Manage ice cream shops in the ConeDex platform</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/admin/shops/import">
              <Plus className="mr-2 h-4 w-4" />
              Import Shops
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/dashboard/admin/shops/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Shop Manually
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <form action="/dashboard/admin/shops" method="GET">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                name="q"
                placeholder="Search shops..."
                className="w-full"
                type="search"
                defaultValue={searchQuery}
              />
              <Button type="submit" size="icon" variant="ghost">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}
          </form>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/admin/shops">All Shops</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/admin/shops?status=claimed">Claimed Shops</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/admin/shops?status=unclaimed">Unclaimed Shops</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/admin/shops?status=pending">Pending Approval</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={statusFilter === "all" ? "all" : statusFilter}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="all" asChild>
            <Link href="/dashboard/admin/shops">All</Link>
          </TabsTrigger>
          <TabsTrigger value="claimed" asChild>
            <Link href="/dashboard/admin/shops?status=claimed">
              Claimed {claimedCount > 0 && <Badge className="ml-2">{claimedCount}</Badge>}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="unclaimed" asChild>
            <Link href="/dashboard/admin/shops?status=unclaimed">
              Unclaimed {unclaimedCount > 0 && <Badge className="ml-2">{unclaimedCount}</Badge>}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="pending" asChild>
            <Link href="/dashboard/admin/shops?status=pending">
              Pending {pendingCount > 0 && <Badge className="ml-2">{pendingCount}</Badge>}
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter === "all" ? "all" : statusFilter} className="mt-6">
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shops && shops.length > 0 ? (
              shops.map((shop) => (
                <ShopCard
                  key={shop.id}
                  id={shop.id}
                  name={shop.name}
                  address={`${shop.address || ""}, ${shop.city || ""}, ${shop.state || ""}`}
                  imageUrl={shop.image_url}
                  phone={shop.phone}
                  website={shop.website}
                  isClaimed={!!shop.owner_id}
                  ownerName={shop.owner?.full_name}
                  reviewCount={shop.reviews?.[0]?.count || 0}
                  createdAt={shop.created_at}
                />
              ))
            ) : (
              <div className="col-span-full flex h-40 flex-col items-center justify-center text-center text-muted-foreground">
                <Store className="mb-2 h-8 w-8" />
                <p>No shops found. Import shops or add them manually.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface ShopCardProps {
  id: string
  name: string
  address: string
  imageUrl: string | null
  phone: string | null
  website: string | null
  isClaimed: boolean
  ownerName?: string
  reviewCount?: number
  createdAt?: string
}

function ShopCard({
  id,
  name,
  address,
  imageUrl,
  phone,
  website,
  isClaimed,
  ownerName,
  reviewCount,
  createdAt,
}: ShopCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-40 sm:h-48 w-full">
        <img
          src={imageUrl || "/placeholder.svg?height=192&width=384&query=ice cream shop"}
          alt={name}
          className="h-full w-full object-cover"
        />
        {isClaimed && (
          <Badge className="absolute right-2 top-2 bg-mint-500 text-white hover:bg-mint-600">Claimed</Badge>
        )}
      </div>
      <CardHeader className="pb-2 flex-grow-0">
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-1 text-base sm:text-lg">{name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/admin/shops/${id}`}>View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/admin/shops/${id}/edit`}>Edit Shop</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={`/dashboard/admin/shops/${id}/delete`} className="text-red-600">
                  Delete Shop
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="line-clamp-1 text-xs sm:text-sm">{address}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 text-xs sm:text-sm">
          {phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blueberry-500 flex-shrink-0" />
              <span className="truncate">{phone}</span>
            </div>
          )}
          {website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-strawberry-500 flex-shrink-0" />
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate"
              >
                {website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-mint-500 flex-shrink-0" />
            <span className="line-clamp-1">{address}</span>
          </div>

          {isClaimed && ownerName && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-muted-foreground">Owner: {ownerName}</span>
            </div>
          )}

          <div className="flex justify-between mt-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-muted-foreground">{reviewCount} reviews</span>
            {createdAt && (
              <span className="text-xs text-muted-foreground">
                Added {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
