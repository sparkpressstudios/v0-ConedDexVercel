import Link from "next/link"
import { ArrowUpDown, ChevronDown, MoreHorizontal, UserPlus, Download, Search, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ImportUsersButton } from "@/components/admin/users/import-users-button"
import { createServerClient } from "@/lib/supabase/server"
import { formatDistanceToNow } from "date-fns"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage() {
  const supabase = await createServerClient()

  // Fetch users from the database
  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, user_id, full_name, email, avatar_url, role, created_at, last_sign_in_at, is_active")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("Error fetching users:", error)
  }

  // Format the user data
  const formattedUsers =
    users?.map((user) => ({
      id: user.user_id,
      name: user.full_name || "Unnamed User",
      email: user.email || "No email",
      role: user.role || "User",
      status: user.is_active ? "Active" : "Inactive",
      lastActive: user.last_sign_in_at
        ? formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true })
        : "Never",
      joined: user.created_at ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) : "Unknown",
      avatar: user.avatar_url,
    })) || []

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search users..." className="w-full sm:w-[300px] pl-8" />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
          <ImportUsersButton />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/api/admin/users/template">
                  <FileDown className="mr-2 h-4 w-4" />
                  Download CSV Template
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user accounts and permissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      User
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Active</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formattedUsers.length > 0 ? (
                  formattedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id.substring(0, 8)}...</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={
                                user.avatar ||
                                `/placeholder.svg?height=32&width=32&query=${encodeURIComponent(user.name)}`
                              }
                              alt={user.name}
                            />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground hidden sm:inline">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={user.role === "Admin" ? "default" : "outline"}>{user.role}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant={user.status === "Active" ? "success" : "secondary"}>{user.status}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">{user.lastActive}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">{user.joined}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/admin/users/${user.id}`}>View Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/admin/users/${user.id}/edit`}>Edit User</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Reset Password</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete User</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {error ? (
                        <div className="flex flex-col items-center justify-center text-red-500">
                          <p>Error loading users</p>
                          <p className="text-xs">{error.message}</p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No users found.</p>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <strong>{formattedUsers.length}</strong> of <strong>{formattedUsers.length}</strong> users
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={formattedUsers.length < 100}>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
