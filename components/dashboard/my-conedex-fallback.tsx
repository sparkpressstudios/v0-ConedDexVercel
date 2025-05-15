"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, IceCream, MapPin, PlusCircle } from "lucide-react"
import Link from "next/link"

export function MyConeDexClientFallback() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My ConeDex</h1>
          <p className="text-muted-foreground">Your personal ice cream collection and journey</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/log-flavor">
            <PlusCircle className="mr-2 h-4 w-4" />
            Log New Flavor
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Collection Progress</CardTitle>
          <CardDescription>Loading your collection progress...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-4">
              <div className="bg-pink-100 p-3 rounded-full">
                <IceCream className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Flavors Logged</p>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shops Visited</p>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Badges Earned</p>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="flavors" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="flavors">My Flavors</TabsTrigger>
          <TabsTrigger value="shops">Visited Shops</TabsTrigger>
          <TabsTrigger value="badges">Badges & Quests</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="flavors" className="mt-6">
          <div className="text-center p-8">
            <p>Loading your flavor collection...</p>
          </div>
        </TabsContent>

        <TabsContent value="shops" className="mt-6">
          <div className="text-center p-8">
            <p>Loading your visited shops...</p>
          </div>
        </TabsContent>

        <TabsContent value="badges" className="mt-6">
          <div className="text-center p-8">
            <p>Loading your badges and quests...</p>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <div className="text-center p-8">
            <p>Loading your stats...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
