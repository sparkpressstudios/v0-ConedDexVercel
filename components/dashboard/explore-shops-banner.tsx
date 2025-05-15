import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Store, MapPin, Search } from "lucide-react"
import Link from "next/link"

export function ExploreShopsBanner() {
  return (
    <Card className="overflow-hidden border-purple-200">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-6 text-white md:w-2/3">
            <div className="mb-4 flex items-center">
              <Store className="mr-2 h-6 w-6" />
              <h3 className="text-xl font-bold">Discover Ice Cream Shops</h3>
            </div>
            <p className="mb-6 max-w-md">
              Explore ice cream shops in your area, check in to your favorites, and discover new flavors to try!
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary" className="bg-white text-purple-700 hover:bg-gray-100">
                <Link href="/shops">
                  <Search className="mr-2 h-4 w-4" />
                  Explore Shops
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white text-white hover:bg-purple-500">
                <Link href="/shops?view=map">
                  <MapPin className="mr-2 h-4 w-4" />
                  View Map
                </Link>
              </Button>
            </div>
          </div>
          <div className="hidden bg-purple-50 p-6 md:flex md:w-1/3 md:items-center md:justify-center">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-purple-600">100+</div>
              <div className="text-sm text-muted-foreground">Ice Cream Shops</div>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Join thousands of ice cream enthusiasts exploring shops worldwide
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
