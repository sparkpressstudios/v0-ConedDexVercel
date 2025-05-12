import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRoleWithPermissions } from "@/app/actions/admin/permission-actions"
import { RolePermissions } from "@/components/admin/permissions/role-permissions"

export const dynamic = "force-dynamic"

export default async function RolePermissionsPage({ params }: { params: { id: string } }) {
  const { role, permissions, success, error } = await getRoleWithPermissions(params.id)

  if (!success || !role) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/admin/roles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{role.name}</h1>
            <p className="text-muted-foreground">{role.description || "No description provided"}</p>
          </div>
        </div>

        {!role.is_system && (
          <Button variant="outline" asChild>
            <Link href={`/dashboard/admin/roles/${params.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Role
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>Manage the permissions for this role</CardDescription>
        </CardHeader>
        <CardContent>
          <RolePermissions roleId={params.id} permissions={permissions || []} isSystemRole={role.is_system} />
        </CardContent>
      </Card>
    </div>
  )
}
