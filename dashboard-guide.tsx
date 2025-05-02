"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { User, ShieldCheck, Store, IceCream, Award, BarChart3, Settings, Users, Flag, Database } from "lucide-react"

export default function DashboardGuide() {
  const [activeTab, setActiveTab] = useState("admin")

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">ConeDex Dashboard Guide</h1>
      <p className="text-center mb-8 text-muted-foreground max-w-2xl mx-auto">
        Use these demo accounts to access the different dashboards and explore the platform's functionality.
      </p>

      <Tabs defaultValue="admin" value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Admin</span>
          </TabsTrigger>
          <TabsTrigger value="shop" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span>Shop Owner</span>
          </TabsTrigger>
          <TabsTrigger value="explorer" className="flex items-center gap-2">
            <IceCream className="h-4 w-4" />
            <span>Explorer</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admin">
          <AdminDashboardGuide />
        </TabsContent>

        <TabsContent value="shop">
          <ShopDashboardGuide />
        </TabsContent>

        <TabsContent value="explorer">
          <ExplorerDashboardGuide />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AdminDashboardGuide() {
  return (
    <Card>
      <CardHeader className="bg-mint-50 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-mint-100">
            <ShieldCheck className="h-6 w-6 text-mint-600" />
          </div>
          <div>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>Platform management and oversight</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Login Credentials</h3>
            <div className="bg-gray-50 p-4 rounded-md font-mono text-sm">
              <div>
                <span className="text-gray-500">Email:</span> admin@conedex.com
              </div>
              <div>
                <span className="text-gray-500">Password:</span> [Use Supabase Auth dashboard to set]
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Key Features</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded-full bg-mint-100">
                  <BarChart3 className="h-4 w-4 text-mint-600" />
                </div>
                <div>
                  <span className="font-medium">Platform Analytics</span>
                  <p className="text-sm text-muted-foreground">Monitor user activity, flavor logs, and system health</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded-full bg-mint-100">
                  <Users className="h-4 w-4 text-mint-600" />
                </div>
                <div>
                  <span className="font-medium">User Management</span>
                  <p className="text-sm text-muted-foreground">Manage users, roles, and permissions</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded-full bg-mint-100">
                  <Store className="h-4 w-4 text-mint-600" />
                </div>
                <div>
                  <span className="font-medium">Shop Approvals</span>
                  <p className="text-sm text-muted-foreground">Review and approve shop submissions</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded-full bg-mint-100">
                  <Flag className="h-4 w-4 text-mint-600" />
                </div>
                <div>
                  <span className="font-medium">Content Moderation</span>
                  <p className="text-sm text-muted-foreground">Review flagged content and reports</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded-full bg-mint-100">
                  <Database className="h-4 w-4 text-mint-600" />
                </div>
                <div>
                  <span className="font-medium">Database Tools</span>
                  <p className="text-sm text-muted-foreground">Manage database operations and backups</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t">
        <div className="text-sm text-muted-foreground">
          <strong>Dashboard URL:</strong> /dashboard/admin
        </div>
      </CardFooter>
    </Card>
  )
}

function ShopDashboardGuide() {
  return (
    <Card>
      <CardHeader className="bg-blueberry-50 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-blueberry-100">
            <Store className="h-6 w-6 text-blueberry-600" />
          </div>
          <div>
            <CardTitle>Shop Owner Dashboard</CardTitle>
            <CardDescription>Manage your ice cream shop</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Login Credentials</h3>
            <div className="bg-gray-50 p-4 rounded-md font-mono text-sm">
              <div>
                <span className="text-gray-500">Email:</span> shopowner@conedex.com
              </div>
              <div>
                <span className="text-gray-500">Password:</span> [Use Supabase Auth dashboard to set]
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Shop Details</h3>
            <div className="bg-gray-50 p-4 rounded-md text-sm">
              <div>
                <span className="font-medium">Shop Name:</span> Sweet Scoops Ice Cream
              </div>
              <div>
                <span className="font-medium">Location:</span> 123 Frost Avenue, Creamville, CA
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                <span className="text-green-600 font-medium">Verified</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Key Features</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded-full bg-blueberry-100">
                  <IceCream className="h-4 w-4 text-blueberry-600" />
                </div>
                <div>
                  <span className="font-medium">Flavor Management</span>
                  <p className="text-sm text-muted-foreground">Add, edit, and manage your shop's flavors</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded-full bg-blueberry-100">
                  <BarChart3 className="h-4 w-4 text-blueberry-600" />
                </div>
                <div>
                  <span className="font-medium">Shop Analytics</span>
                  <p className="text-sm text-muted-foreground">View customer logs, ratings, and flavor popularity</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded-full bg-blueberry-100">
                  <Settings className="h-4 w-4 text-blueberry-600" />
                </div>
                <div>
                  <span className="font-medium">Shop Profile</span>
                  <p className="text-sm text-muted-foreground">Update shop details, hours, and contact information</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t">
        <div className="text-sm text-muted-foreground">
          <strong>Dashboard URL:</strong> /dashboard/shop
        </div>
      </CardFooter>
    </Card>
  )
}

function ExplorerDashboardGuide() {
  return (
    <Card>
      <CardHeader className="bg-strawberry-50 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-strawberry-100">
            <IceCream className="h-6 w-6 text-strawberry-600" />
          </div>
          <div>
            <CardTitle>Explorer Dashboard</CardTitle>
            <CardDescription>Discover and log ice cream flavors</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Login Credentials</h3>
            <div className="bg-gray-50 p-4 rounded-md font-mono text-sm">
              <div>
                <span className="text-gray-500">Email:</span> explorer@conedex.com
              </div>
              <div>
                <span className="text-gray-500">Password:</span> [Use Supabase Auth dashboard to set]
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Explorer Profile</h3>
            <div className="bg-gray-50 p-4 rounded-md text-sm">
              <div>
                <span className="font-medium">Name:</span> Emma Explorer
              </div>
              <div>
                <span className="font-medium">Favorite Flavor:</span> Mint Chocolate Chip
              </div>
              <div>
                <span className="font-medium">Badges:</span> Ice Cream Rookie, Flavor Explorer
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Key Features</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded-full bg-strawberry-100">
                  <IceCream className="h-4 w-4 text-strawberry-600" />
                </div>
                <div>
                  <span className="font-medium">Flavor Logging</span>
                  <p className="text-sm text-muted-foreground">Log and rate ice cream flavors you've tried</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded-full bg-strawberry-100">
                  <Store className="h-4 w-4 text-strawberry-600" />
                </div>
                <div>
                  <span className="font-medium">Shop Discovery</span>
                  <p className="text-sm text-muted-foreground">Find new ice cream shops near you</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded-full bg-strawberry-100">
                  <Award className="h-4 w-4 text-strawberry-600" />
                </div>
                <div>
                  <span className="font-medium">Badge Collection</span>
                  <p className="text-sm text-muted-foreground">Earn badges by completing challenges</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 p-1 rounded-full bg-strawberry-100">
                  <User className="h-4 w-4 text-strawberry-600" />
                </div>
                <div>
                  <span className="font-medium">ConeDex</span>
                  <p className="text-sm text-muted-foreground">Track your personal ice cream collection</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t">
        <div className="text-sm text-muted-foreground">
          <strong>Dashboard URL:</strong> /dashboard
        </div>
      </CardFooter>
    </Card>
  )
}
