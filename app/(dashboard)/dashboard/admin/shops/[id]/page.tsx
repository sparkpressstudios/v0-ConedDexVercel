import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Edit, MapPin, Phone, Globe, Clock, Shield, User, Calendar } from "lucide-react"
import { VerifyShopButton } from "@/components/admin/shops/verify-shop-button"
import { DeleteShopButton } from "@/components/admin/shops/delete-shop-button"

export default async function AdminShopDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Fetch shop details
  const { data: shop, error } = await supabase
    .from("shops")
    .select(`
      *,
      profiles:owner_id (
        id,
        full_name,
        email
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !shop) {
    notFound()
  }

  // Format dates
  const createdAt = new Date(shop.created_at).toLocaleDateString()
  const updatedAt = shop.updated_at ? new Date(shop.updated_at).toLocaleDateString() : "Never"

  // Fetch shop stats
  const { data: stats } = await supabase.rpc("get_shop_stats", { shop_id: shop.id })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/admin/shops">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shops
            </Link>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/dashboard/admin/shops/${shop.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Shop
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{shop.name}</CardTitle>
                  <CardDescription>{shop.description}</CardDescription>
                </div>
                <Badge variant={shop.is_verified ? "success" : "outline"}>
                  {shop.is_verified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Address</div>
                    <div className="text-sm text-muted-foreground">
                      {shop.address || "No address provided"}
                      {shop.city && shop.state && (
                        <>
                          <br />
                          {shop.city}, {shop.state} {shop.zip_code}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Contact</div>
                    <div className="text-sm text-muted-foreground">
                      {shop.phone || "No phone provided"}
                      {shop.email && (
                        <>
                          <br />
                          {shop.email}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {shop.website && (
                  <div className="flex items-start gap-2">
                    <Globe className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">Website</div>
                      <div className="text-sm text-muted-foreground">
                        <a href={shop.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {shop.website}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Hours</div>
                    <div className="text-sm text-muted-foreground">{shop.hours || "No hours provided"}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Flavors</CardTitle>
                <CardDescription>Flavors offered by this shop</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.flavor_count ? (
                  <div className="text-2xl font-bold">{stats.flavor_count} flavors</div>
                ) : (
                  <div className="text-muted-foreground">No flavors added yet</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
                <CardDescription>Customer reviews for this shop</CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.review_count ? (
                  <div>
                    <div className="text-2xl font-bold">{stats.review_count} reviews</div>
                    <div className="text-sm text-muted-foreground">
                      Average rating: {stats.avg_rating?.toFixed(1) || "N/A"}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No reviews yet</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shop Owner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {shop.profiles ? (
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">{shop.profiles.full_name || "Unknown"}</div>
                    <div className="text-sm text-muted-foreground">{shop.profiles.email}</div>
                    <Button variant="link" className="p-0 h-auto" asChild>
                      <Link href={`/dashboard/admin/users/${shop.owner_id}`}>View Profile</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">No owner assigned</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shop Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-[20px_1fr] items-start gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Verification Status</div>
                  <div className="text-sm text-muted-foreground">{shop.is_verified ? "Verified" : "Not Verified"}</div>
                </div>

                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Created</div>
                  <div className="text-sm text-muted-foreground">{createdAt}</div>
                </div>

                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Last Updated</div>
                  <div className="text-sm text-muted-foreground">{updatedAt}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/dashboard/admin/shops/${shop.id}/edit`}>Edit Shop</Link>
              </Button>
              <VerifyShopButton
                shopId={shop.id}
                shopName={shop.name}
                isVerified={shop.is_verified}
                ownerId={shop.owner_id}
              />
              <DeleteShopButton shopId={shop.id} shopName={shop.name} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
