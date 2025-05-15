"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, Star, Store, Users, CheckCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { checkInToShop } from "@/app/actions/shop-actions"
import { useToast } from "@/hooks/use-toast"

export default function ShopsList({ shops = [] }) {
  const { toast } = useToast()
  const [checkingIn, setCheckingIn] = useState(null)
  
  const handleCheckIn = async (shopId) => {
    setCheckingIn(shopId)
    try {
      await checkInToShop(shopId)
      toast({
        title: "Checked in successfully!",
        description: "Your check-in has been recorded.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Check-in failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setCheckingIn(null)
    }
  }
  
  if (shops.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <Store className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No shops found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Try adjusting your search or filters to find ice cream shops.
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {shops.map((shop) => (
        <Card key={shop.id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/4 bg-muted">
              <div className="aspect-video md:h-full w-full overflow-hidden">
                {shop.main_image_url ? (
                  <img
                    src={shop.main_image_url || "/placeholder.svg"}
                    alt={shop.name}
                    className="h-full w-full object-cover transition-all hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <Store className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      {shop.name}
                      {shop.is_verified && (
                        <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                      )}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-1 h-3 w-3" />
                      {shop.city}, {shop.state}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {shop.rating && (
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{shop.rating.toFixed(1)}</span>
                      </Badge>
                    )}
                    
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{shop.check_in_count}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {shop.description || "No description available for this ice cream shop."}
                </p>
                
                {shop.recent_check_ins && shop.recent_check_ins.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Recent visitors:</p>
                    <div className="flex -space-x-2 overflow-hidden">
                      {shop.recent_check_ins.map((checkIn, index) => (
                        <Avatar key={index} className="h-6 w-6 border-2 border-background">
                          <AvatarImage src={checkIn.profiles?.avatar_url || "/placeholder.svg"} alt={checkIn.profiles?.username} />
                          <AvatarFallback>
                            {checkIn.profiles?.username?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/business/${shop.id}`}>
                    View Details
                  </Link>
                </Button>
                
                <Button 
                  size="sm" 
                  onClick={() => handleCheckIn(shop.id)}
                  disabled={checkingIn === shop.id}
                >
                  {checkingIn === shop.id ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Checking in...
                    </>
                  ) : (
                    <>Check in</>
                  )}
                </Button>
              </CardFooter>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
