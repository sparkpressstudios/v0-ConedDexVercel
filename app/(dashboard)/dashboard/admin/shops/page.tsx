import Link from "next/link"
import { Search, MoreHorizontal, Plus, MapPin, Phone, Globe, Store } from "lucide-react"

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

export default async function ShopsManagementPage() {
  const supabase = createServerClient()
  const { data: shops, error } = await supabase.from("shops").select("*").order("name")

  if (error) {
    console.error("Error fetching shops:", error)
  }

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
          <Input placeholder="Search shops..." className="w-full" type="search" />
          <Button type="submit" size="icon" variant="ghost">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="claimed">Claimed</TabsTrigger>
          <TabsTrigger value="unclaimed">Unclaimed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
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

        <TabsContent value="claimed" className="mt-6">
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shops && shops.filter((shop) => shop.owner_id).length > 0 ? (
              shops
                .filter((shop) => shop.owner_id)
                .map((shop) => (
                  <ShopCard
                    key={shop.id}
                    id={shop.id}
                    name={shop.name}
                    address={`${shop.address || ""}, ${shop.city || ""}, ${shop.state || ""}`}
                    imageUrl={shop.image_url}
                    phone={shop.phone}
                    website={shop.website}
                    isClaimed={true}
                  />
                ))
            ) : (
              <div className="col-span-full flex h-40 flex-col items-center justify-center text-center text-muted-foreground">
                <Store className="mb-2 h-8 w-8" />
                <p>No claimed shops found.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="unclaimed" className="mt-6">
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shops && shops.filter((shop) => !shop.owner_id).length > 0 ? (
              shops
                .filter((shop) => !shop.owner_id)
                .map((shop) => (
                  <ShopCard
                    key={shop.id}
                    id={shop.id}
                    name={shop.name}
                    address={`${shop.address || ""}, ${shop.city || ""}, ${shop.state || ""}`}
                    imageUrl={shop.image_url}
                    phone={shop.phone}
                    website={shop.website}
                    isClaimed={false}
                  />
                ))
            ) : (
              <div className="col-span-full flex h-40 flex-col items-center justify-center text-center text-muted-foreground">
                <Store className="mb-2 h-8 w-8" />
                <p>No unclaimed shops found.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-full flex h-40 flex-col items-center justify-center text-center text-muted-foreground">
              <Store className="mb-2 h-8 w-8" />
              <p>No shops pending approval.</p>
            </div>
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
}

function ShopCard({ id, name, address, imageUrl, phone, website, isClaimed }: ShopCardProps) {
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
              <DropdownMenuItem className="text-red-600">Delete Shop</DropdownMenuItem>
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
                {new URL(website).hostname}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-mint-500 flex-shrink-0" />
            <span className="line-clamp-1">{address}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
