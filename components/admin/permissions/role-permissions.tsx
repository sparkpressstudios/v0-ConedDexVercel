"use client"

import { useState } from "react"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { updateRolePermissions } from "@/app/actions/admin/permission-actions"

interface Permission {
  id: string
  name: string
  key: string
  description: string | null
  category: string | null
  granted: boolean
}

export function RolePermissions({
  roleId,
  permissions,
  isSystemRole,
}: {
  roleId: string
  permissions: Permission[]
  isSystemRole: boolean
}) {
  const [permissionState, setPermissionState] = useState<Permission[]>(permissions)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const { toast } = useToast()

  const handlePermissionToggle = (id: string, granted: boolean) => {
    if (isSystemRole) {
      toast({
        title: "Cannot modify system role",
        description: "System roles have predefined permissions that cannot be changed.",
        variant: "destructive",
      })
      return
    }

    setPermissionState((prev) =>
      prev.map((permission) => (permission.id === id ? { ...permission, granted } : permission)),
    )
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Format the permissions for the API
      const permissionUpdates = permissionState.map((permission) => ({
        permissionId: permission.id,
        granted: permission.granted,
      }))

      const { success, error } = await updateRolePermissions({
        roleId,
        permissions: permissionUpdates,
      })

      if (success) {
        toast({
          title: "Permissions updated",
          description: "Role permissions have been updated successfully.",
        })
        setHasChanges(false)
      } else {
        toast({
          title: "Error updating permissions",
          description: error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving permissions:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Group permissions by category
  const permissionsByCategory: Record<string, Permission[]> = {}
  permissionState.forEach((permission) => {
    const category = permission.category || "Uncategorized"
    if (!permissionsByCategory[category]) {
      permissionsByCategory[category] = []
    }
    permissionsByCategory[category].push(permission)
  })

  if (permissionState.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
        </div>

        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <div className="border rounded-md divide-y">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="p-4 flex items-center justify-between">
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Role Permissions</h2>
        <div className="flex items-center space-x-2">
          {hasChanges && <Badge variant="secondary">Unsaved Changes</Badge>}
          <Button variant="primary" onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {Object.entries(permissionsByCategory).map(([category, permissions]) => (
        <div key={category} className="space-y-2">
          <h3 className="text-md font-semibold">{category}</h3>
          <div className="border rounded-md divide-y">
            {permissions.map((permission) => (
              <div key={permission.id} className="p-4 flex items-center justify-between">
                <div className="space-y-2 w-full">
                  <div className="flex items-center justify-between">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {permission.name}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{permission.description || "No description provided."}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Switch
                      id={permission.id}
                      checked={permission.granted}
                      onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{permission.key}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
