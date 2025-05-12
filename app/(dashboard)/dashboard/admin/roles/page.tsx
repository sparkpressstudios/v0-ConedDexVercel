import Link from "next/link"
import { Plus, Users, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRoles } from "@/app/actions/admin/permission-actions"
import { RolesList } from "@/components/admin/permissions/roles-list"

export const dynamic = "force-dynamic"

export default async function AdminRolesPage() {
  const { roles, success, error } = await getRoles()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Roles</h1>
          <p className="text-muted-foreground">Manage administrative roles and permissions</p>
        </div>

        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/admin/roles/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>Create and manage administrative roles</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <RolesList roles={roles || []} />
            ) : (
              <div className="py-8 text-center">
                <p className="text-red-500">Error loading roles: {error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About Admin Roles</CardTitle>
            <CardDescription>Understanding role-based access control</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-primary/10 p-2 rounded-full">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Role-Based Access Control</h3>
                <p className="text-sm text-muted-foreground">
                  Roles define what actions administrators can perform in the system. Each role has a specific set of
                  permissions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 bg-primary/10 p-2 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Assigning Roles</h3>
                <p className="text-sm text-muted-foreground">
                  Assign roles to users from the user management page. Users can have multiple roles, and their
                  permissions are combined.
                </p>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">System Roles</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="font-medium">Super Admin:</span>
                  <span className="text-muted-foreground">Full access to all administrative functions</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-medium">Content Manager:</span>
                  <span className="text-muted-foreground">Can manage content but not system settings</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-medium">Analyst:</span>
                  <span className="text-muted-foreground">Can view analytics and reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-medium">Moderator:</span>
                  <span className="text-muted-foreground">Can moderate user content</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
