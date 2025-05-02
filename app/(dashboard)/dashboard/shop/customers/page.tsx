"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, Search, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

export default function ShopCustomersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("recent")
  const [shop, setShop] = useState<any | null>(null)

  useEffect(() => {
    const fetchCustomerData = async () => {
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

        // Get customers who have logged flavors at this shop
        const { data: flavorLogs, error: logsError } = await supabase
          .from("flavor_logs")
          .select(`
            id,
            created_at,
            rating,
            review,
            profiles:user_id (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq("shop_id", shopData.id)
          .order("created_at", { ascending: false })

        if (logsError) throw logsError

        // Process customer data to get unique customers with their latest activity
        const uniqueCustomers = new Map()

        flavorLogs?.forEach((log) => {
          const customerId = log.profiles.id

          if (!uniqueCustomers.has(customerId)) {
            uniqueCustomers.set(customerId, {
              id: customerId,
              username: log.profiles.username,
              full_name: log.profiles.full_name,
              avatar_url: log.profiles.avatar_url,
              last_visit: log.created_at,
              total_logs: 1,
              avg_rating: log.rating || 0,
            })
          } else {
            const customer = uniqueCustomers.get(customerId)
            customer.total_logs += 1
            customer.avg_rating =
              (customer.avg_rating * (customer.total_logs - 1) + (log.rating || 0)) / customer.total_logs

            // Update last visit if this log is more recent
            if (new Date(log.created_at) > new Date(customer.last_visit)) {
              customer.last_visit = log.created_at
            }
          }
        })

        setCustomers(Array.from(uniqueCustomers.values()))
      } catch (error) {
        console.error("Error fetching customer data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomerData()
  }, [user, supabase, router])

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) => {
    const fullName = customer.full_name?.toLowerCase() || ""
    const username = customer.username?.toLowerCase() || ""

    return fullName.includes(searchQuery.toLowerCase()) || username.includes(searchQuery.toLowerCase())
  })

  // Sort customers based on selected sort option
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime()
      case "oldest":
        return new Date(a.last_visit).getTime() - new Date(b.last_visit).getTime()
      case "most_logs":
        return b.total_logs - a.total_logs
      case "highest_rating":
        return b.avg_rating - a.avg_rating
      case "name_asc":
        return (a.full_name || a.username || "").localeCompare(b.full_name || b.username || "")
      case "name_desc":
        return (b.full_name || b.username || "").localeCompare(a.full_name || a.username || "")
      default:
        return 0
    }
  })

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
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
          <CardContent>
            <Button onClick={() => router.push("/dashboard/shop/claim")} className="w-full">
              Claim or Create Shop
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            {customers.length} {customers.length === 1 ? "customer has" : "customers have"} visited your shop
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort by:{" "}
              {sortBy === "recent"
                ? "Most Recent"
                : sortBy === "oldest"
                  ? "Oldest First"
                  : sortBy === "most_logs"
                    ? "Most Logs"
                    : sortBy === "highest_rating"
                      ? "Highest Rating"
                      : sortBy === "name_asc"
                        ? "Name (A-Z)"
                        : "Name (Z-A)"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setSortBy("recent")}>Most Recent</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest First</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("most_logs")}>Most Logs</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("highest_rating")}>Highest Rating</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("name_asc")}>Name (A-Z)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("name_desc")}>Name (Z-A)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>People who have logged flavors at your shop</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedCustomers.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed text-center">
              <Users className="mb-2 h-8 w-8 text-muted-foreground" />
              {searchQuery ? (
                <>
                  <p className="text-muted-foreground">No customers match your search</p>
                  <Button variant="link" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">No customers have visited your shop yet</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Total Logs</TableHead>
                    <TableHead>Avg. Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="flex items-center gap-2">
                        <div className="h-8 w-8 overflow-hidden rounded-full bg-muted">
                          {customer.avatar_url ? (
                            <img
                              src={customer.avatar_url || "/placeholder.svg"}
                              alt={customer.full_name || customer.username}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                              {(customer.full_name || customer.username || "U")[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {customer.full_name || customer.username || "Anonymous User"}
                          </div>
                          {customer.username && customer.full_name && (
                            <div className="text-xs text-muted-foreground">@{customer.username}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(customer.last_visit)}</TableCell>
                      <TableCell>{customer.total_logs}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <svg
                            className="mr-1 h-4 w-4 fill-amber-400 text-amber-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                          <span>{customer.avg_rating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
