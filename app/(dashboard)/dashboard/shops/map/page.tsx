import DashboardShopsMap from "@/components/shop/dashboard-shops-map"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shop Map | ConeDex Dashboard",
  description: "View all ice cream shops on an interactive map",
}

export default function ShopsMapPage() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Ice Cream Shop Map</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] w-full">
            <DashboardShopsMap />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
