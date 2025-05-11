import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, MapPin, Phone, Globe, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createServerClient } from "@/lib/supabase/server"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default async function ShopDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const { data: shop, error } = await supabase.from("shops").select("*").eq("id", params.id).single()

  if (error || !shop) {
    notFound()
  }

  // Get shop owner details if claimed
  let owner = null
  if (shop.owner_id) {
    const { data: ownerData } = await supabase.from("profiles").select("*").eq("id", shop.owner_id).single()
    owner = ownerData
  }

  // Get shop flavors
  const { data: flavors } = await supabase.from("flavors").select("*").eq("shop_id", shop.id)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/admin/shops">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold">{shop.name}</h1>
          </div>
          <p className="text-muted-foreground ml-10">
            {shop.address}, {shop.city}, {shop.state}
          </p>
        </div>
        <div className="flex gap-2 ml-10 sm:ml-0">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/admin/shops/${shop.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Shop
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the shop and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Shop Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Shop Image and Details */}
          <Card>
            <div className="relative h-48 sm:h-64 w-full">
              <img
                src={shop.image_url || "/placeholder.svg?height=256&width=768&query=ice cream shop"}
                alt={shop.name}
                className="h-full w-full object-cover"
              />
              <Badge
                className={`absolute right-2 top-2 ${
                  shop.is_verified ? "bg-green-500 hover:bg-green-600" : "bg-amber-500 hover:bg-amber-600"
                } text-white`}
              >
                {shop.is_verified ? "Verified" : "Unverified"}
              </Badge>
              {shop.owner_id && (
                <Badge className="absolute left-2 top-2 bg-mint-500 text-white hover:bg-mint-600">Claimed</Badge>
              )}
            </div>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-semibold">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-mint-500" />
                      <span>
                        {shop.address}, {shop.city}, {shop.state}
                      </span>
                    </div>
                    {shop.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blueberry-500" />
                        <span>{shop.phone}</span>
                      </div>
                    )}
                    {shop.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-strawberry-500" />
                        <a
                          href={shop.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {new URL(shop.website).hostname}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Shop Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {shop.is_verified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-amber-500" />
                      )}
                      <span>Verification: {shop.is_verified ? "Verified" : "Unverified"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {shop.is_active ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>Status: {shop.is_active ? "Active" : "Inactive"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {shop.owner_id ? (
                        <CheckCircle className="h-4 w-4 text-mint-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-500" />
                      )}
                      <span>Ownership: {shop.owner_id ? "Claimed" : "Unclaimed"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm">{shop.description || "No description available."}</p>
              </div>
            </CardContent>
          </Card>

          {/* Flavors */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Flavors</h3>
                <span className="text-sm text-muted-foreground">{flavors?.length || 0} flavors</span>
              </div>
              {flavors && flavors.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {flavors.slice(0, 6).map((flavor) => (
                    <div key={flavor.id} className="rounded-md border p-2 flex items-center gap-2">
                      <div
                        className="h-8 w-8 rounded-full"
                        style={{ backgroundColor: flavor.color_hex || "#f0f0f0" }}
                      ></div>
                      <div>
                        <p className="font-medium text-sm">{flavor.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {flavor.description?.slice(0, 30) || "No description"}
                          {(flavor.description?.length || 0) > 30 ? "..." : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No flavors available for this shop.</p>
              )}
              {flavors && flavors.length > 6 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm">
                    View All {flavors.length} Flavors
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner Information */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Owner Information</h3>
              {owner ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-mint-100 flex items-center justify-center text-mint-700 font-bold">
                      {owner.first_name?.charAt(0) || ""}
                      {owner.last_name?.charAt(0) || ""}
                    </div>
                    <div>
                      <p className="font-medium">
                        {owner.first_name} {owner.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{owner.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/dashboard/admin/users/${owner.id}`}>View Owner Profile</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-sm text-muted-foreground mb-3">This shop has not been claimed yet.</p>
                  <Button variant="outline" size="sm">
                    Assign Owner
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shop Stats */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Shop Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Reviews:</span>
                  <span className="font-medium">{shop.review_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Rating:</span>
                  <span className="font-medium">{shop.average_rating?.toFixed(1) || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Followers:</span>
                  <span className="font-medium">{shop.follower_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Created:</span>
                  <span className="font-medium">
                    {shop.created_at ? new Date(shop.created_at).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Last Updated:</span>
                  <span className="font-medium">
                    {shop.updated_at ? new Date(shop.updated_at).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Admin Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  {shop.is_verified ? "Revoke Verification" : "Verify Shop"}
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  {shop.is_active ? "Deactivate Shop" : "Activate Shop"}
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
