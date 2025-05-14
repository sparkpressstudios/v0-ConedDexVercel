"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  UserPlus,
  Download,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash,
  Shield,
  Mail,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function UsersPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const supabase = createClient()

        // In a real app, we'd fetch from the database
        // For now, let's use mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockUsers = [
          {
            id: "usr_1",
            full_name: "John Smith",
            email: "john.smith@example.com",
            role: "explorer",
            created_at: "2023-05-12T10:30:00Z",
            last_sign_in_at: "2023-09-28T15:45:00Z",
            status: "active",
            flavors_logged: 24,
            shops_visited: 8,
            badges_earned: 5,
          },
          {
            id: "usr_2",
            full_name: "Sarah Johnson",
            email: "sarah@icecreamheaven.com",
            role: "shop_owner",
            created_at: "2023-06-03T09:15:00Z",
            last_sign_in_at: "2023-09-27T11:20:00Z",
            status: "active",
            flavors_logged: 12,
            shops_visited: 3,
            badges_earned: 2,
          },
          {
            id: "usr_3",
            full_name: "Michael Chen",
            email: "michael.chen@example.com",
            role: "explorer",
            created_at: "2023-04-18T14:45:00Z",
            last_sign_in_at: "2023-09-25T09:30:00Z",
            status: "active",
            flavors_logged: 37,
            shops_visited: 15,
            badges_earned: 8,
          },
          {
            id: "usr_4",
            full_name: "Emma Wilson",
            email: "emma@frostybites.com",
            role: "shop_owner",
            created_at: "2023-07-22T16:20:00Z",
            last_sign_in_at: "2023-09-28T10:15:00Z",
            status: "active",
            flavors_logged: 5,
            shops_visited: 2,
            badges_earned: 1,
          },
          {
            id: "usr_5",
            full_name: "Alex Rodriguez",
            email: "alex.rodriguez@example.com",
            role: "admin",
            created_at: "2023-03-10T08:30:00Z",
            last_sign_in_at: "2023-09-28T16:00:00Z",
            status: "active",
            flavors_logged: 42,
            shops_visited: 18,
            badges_earned: 12,
          },
          {
            id: "usr_6",
            full_name: "Jessica Lee",
            email: "jessica.lee@example.com",
            role: "explorer",
            created_at: "2023-08-05T11:10:00Z",
            last_sign_in_at: "2023-09-20T14:25:00Z",
            status: "inactive",
            flavors_logged: 8,
            shops_visited: 4,
            badges_earned: 2,
          },
          {
            id: "usr_7",
            full_name: "David Kim",
            email: "david@scoopsdelight.com",
            role: "shop_owner",
            created_at: "2023-05-30T13:45:00Z",
            last_sign_in_at: "2023-09-26T09:50:00Z",
            status: "active",
            flavors_logged: 15,
            shops_visited: 5,
            badges_earned: 3,
          },
          {
            id: "usr_8",
            full_name: "Olivia Martinez",
            email: "olivia.martinez@example.com",
            role: "explorer",
            created_at: "2023-07-14T10:20:00Z",
            last_sign_in_at: "2023-09-15T11:30:00Z",
            status: "inactive",
            flavors_logged: 19,
            shops_visited: 7,
            badges_earned: 4,
          },
        ]

        setUsers(mockUsers)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("Failed to load users. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filter users based on search query and active tab
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "explorers") return matchesSearch && user.role === "explorer"
    if (activeTab === "shop_owners") return matchesSearch && user.role === "shop_owner"
    if (activeTab === "admins") return matchesSearch && user.role === "admin"
    if (activeTab === "inactive") return matchesSearch && user.status === "inactive"

    return matchesSearch
  })

  const handleViewUser = (userId: string) => {
    router.push(`/dashboard/admin/users/${userId}`)
  }

  const handleEditUser = (userId: string) => {
    router.push(`/dashboard/admin/users/${userId}/edit`)
  }

  const handleDeleteUser = (userId: string) => {
    // In a real app, we'd call an API to delete the user
    alert(`Delete user ${userId} (This would be a confirmation modal in the real app)`)
  }

  if (isLoading) {
    return <UsersPageSkeleton />
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Users</h2>
        <p className="text-red-700">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage and monitor user accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button className="w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="sm:ml-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="explorers">Explorers</TabsTrigger>
          <TabsTrigger value="shop_owners">Shop Owners</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <UsersTable
            users={filteredUsers}
            onView={handleViewUser}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        </TabsContent>

        <TabsContent value="explorers" className="mt-6">
          <UsersTable
            users={filteredUsers}
            onView={handleViewUser}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        </TabsContent>

        <TabsContent value="shop_owners" className="mt-6">
          <UsersTable
            users={filteredUsers}
            onView={handleViewUser}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        </TabsContent>

        <TabsContent value="admins" className="mt-6">
          <UsersTable
            users={filteredUsers}
            onView={handleViewUser}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        </TabsContent>

        <TabsContent value="inactive" className="mt-6">
          <UsersTable
            users={filteredUsers}
            onView={handleViewUser}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        </TabsContent>
      </Tabs>

      <div className="text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  )
}

function UsersTable({
  users,
  onView,
  onEdit,
  onDelete,
}: {
  users: any[]
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                <div className="flex items-center gap-1">
                  Name
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(user.id)}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.full_name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.status} />
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(user.last_sign_in_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onView(user.id)
                          }}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(user.id)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit user
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(user.id)
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete user
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case "admin":
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Admin</Badge>
    case "shop_owner":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Shop Owner</Badge>
    case "explorer":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Explorer</Badge>
    default:
      return <Badge variant="outline">{role}</Badge>
  }
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    case "inactive":
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Inactive</Badge>
    case "suspended":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Suspended</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function UsersPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 w-full sm:w-64" />
        <Skeleton className="h-10 w-32 sm:ml-auto" />
      </div>

      <Skeleton className="h-10 w-full" />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-12" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Skeleton className="h-4 w-48" />
    </div>
  )
}
