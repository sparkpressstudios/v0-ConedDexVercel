"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil, MapPin, Clock, Shield, ExternalLink } from "lucide-react"

interface ShopDashboardHeaderProps {
  shop: any
}

export function ShopDashboardHeader({ shop }: ShopDashboardHeaderProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const router = useRouter()

  if (!shop) return null

  const shopImageUrl = shop.image_url || "/placeholder.svg?key=whi5d"

  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative h-40 w-full bg-neutral-100">
          {shop.backdrop_photo ? (
            <Image
              src={shop.backdrop_photo || "/placeholder.svg"}
              alt={`${shop.name} backdrop`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-primary-200 flex items-center justify-center">
              <span className="text-primary-600 text-lg font-medium">Add a backdrop photo</span>
            </div>
          )}
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-4 right-4"
            onClick={() => router.push("/dashboard/shop/edit")}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Shop
          </Button>
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="relative -mt-16 sm:-mt-12 h-24 w-24 rounded-lg overflow-hidden border-4 border-white shadow-md bg-white">
              <Image src={shopImageUrl || "/placeholder.svg"} alt={shop.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{shop.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                    {shop.address && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{shop.address}</span>
                      </div>
                    )}
                    {shop.business_hours && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{shop.business_hours}</span>
                      </div>
                    )}
                    {shop.is_verified && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 text-blue-600 border-blue-200 bg-blue-50"
                      >
                        <Shield className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/shops/${shop.id}`} target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Public View
                    </Link>
                  </Button>
                  <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">Preview Shop</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px]">
                      <DialogHeader>
                        <DialogTitle>Shop Preview</DialogTitle>
                      </DialogHeader>
                      <div className="mt-4 border rounded-lg p-4 h-[500px] overflow-auto">
                        <div className="relative h-40 w-full rounded-lg overflow-hidden mb-4">
                          <Image
                            src={shop.backdrop_photo || shopImageUrl}
                            alt={shop.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="h-16 w-16 rounded-lg overflow-hidden relative">
                            <Image
                              src={shopImageUrl || "/placeholder.svg"}
                              alt={shop.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold">{shop.name}</h2>
                            {shop.is_verified && (
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1 text-blue-600 border-blue-200 bg-blue-50"
                              >
                                <Shield className="h-3 w-3" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="space-y-4">
                          {shop.description && (
                            <div>
                              <h3 className="font-medium mb-1">About</h3>
                              <p className="text-sm text-muted-foreground">{shop.description}</p>
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium mb-1">Location</h3>
                            <p className="text-sm text-muted-foreground">{shop.address || "No address provided"}</p>
                          </div>
                          <div>
                            <h3 className="font-medium mb-1">Business Hours</h3>
                            <p className="text-sm text-muted-foreground">
                              {shop.business_hours || "No business hours provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">{shop.total_flavors || 0}</div>
                  <div className="text-sm text-muted-foreground">Flavors</div>
                </div>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">{shop.total_checkins || 0}</div>
                  <div className="text-sm text-muted-foreground">Check-ins</div>
                </div>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">{shop.total_followers || 0}</div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">{shop.average_rating || 0}</div>
                  <div className="text-sm text-muted-foreground">Avg. Rating</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
