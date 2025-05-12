"use client"

import { useState } from "react"
import Link from "next/link"
import { Pencil, Trash2, Shield, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { deleteRole } from "@/app/actions/admin/permission-actions"

interface Role {
  id: string
  name: string
  description: string | null
  is_system: boolean
  created_at: string
  updated_at: string
}

export function RolesList({ roles }: { roles: Role[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDelete = async (id: string, name: string) => {
    setIsDeleting(id)

    try {
      const { success, error } = await deleteRole(id)

      if (success) {
        toast({
          title: "Role deleted",
          description: `${name} has been deleted successfully.`,
        })
        // Refresh the page to update the list
        window.location.reload()
      } else {
        toast({
          title: "Error deleting role",
          description: error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting role:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  if (roles.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-muted/20">
        <p className="text-muted-foreground">No roles have been created yet.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/dashboard/admin/roles/new">Create Your First Role</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <div key={role.id} className="border rounded-md p-4 hover:bg-muted/20 transition-colors">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{role.name}</h3>
                {role.is_system && (
                  <Badge variant="secondary" className="text-xs">
                    System Role
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{role.description || "No description provided"}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/dashboard/admin/roles/${role.id}`}>
                  <Shield className="h-4 w-4" />
                </Link>
              </Button>

              <Button variant="ghost" size="icon" asChild>
                <Link href={`/dashboard/admin/roles/${role.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>

              {!role.is_system && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Role</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the role "{role.name}"? This will remove it from all users who
                        have been assigned this role.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleDelete(role.id, role.name)}
                        disabled={isDeleting === role.id}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {role.is_system && (
            <div className="mt-4 flex items-center gap-2 p-2 bg-amber-50 text-amber-800 rounded-md text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>System roles cannot be deleted and have predefined permissions.</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
