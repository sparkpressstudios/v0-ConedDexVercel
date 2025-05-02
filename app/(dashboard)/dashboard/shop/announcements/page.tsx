"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Plus, Edit, Trash2, AlertCircle, Megaphone, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function ShopAnnouncementsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const { toast } = useToast()

  const [shop, setShop] = useState<any>(null)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchShopData()
  }, [])

  const fetchShopData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Get user's shop
      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .select("id, name")
        .eq("owner_id", user.id)
        .single()

      if (shopError) {
        if (shopError.code === "PGRST116") {
          // No shop found
          toast({
            title: "No shop found",
            description: "You need to claim or create a shop first",
            variant: "destructive",
          })
          return
        }
        throw shopError
      }

      setShop(shopData)

      // Get shop announcements
      const { data: announcementsData, error: announcementsError } = await supabase
        .from("shop_announcements")
        .select("*")
        .eq("shop_id", shopData.id)
        .order("created_at", { ascending: false })

      if (announcementsError) throw announcementsError

      setAnnouncements(announcementsData || [])
    } catch (error) {
      console.error("Error fetching shop data:", error)
      toast({
        title: "Error",
        description: "Failed to load shop data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      setIsDeleting(true)

      // Delete announcement
      const { error } = await supabase.from("shop_announcements").delete().eq("id", deleteId)

      if (error) throw error

      // Update local state
      setAnnouncements((prev) => prev.filter((a) => a.id !== deleteId))

      toast({
        title: "Announcement deleted",
        description: "The announcement has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting announcement:", error)
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  if (loading && !shop) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Shop Announcements</h1>
          <p className="text-muted-foreground">Create and manage announcements for your followers</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/shop/announcements/new">
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No announcements yet</h3>
            <p className="text-muted-foreground text-center max-w-md mt-1 mb-4">
              Create your first announcement to share news, promotions, or updates with your followers
            </p>
            <Button asChild>
              <Link href="/dashboard/shop/announcements/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Announcement
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className={!announcement.is_active ? "opacity-70" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{announcement.title}</CardTitle>
                    <CardDescription>
                      Created {format(new Date(announcement.created_at), "MMM dd, yyyy")}
                      {announcement.publish_date &&
                        ` • Published ${format(new Date(announcement.publish_date), "MMM dd, yyyy")}`}
                      {announcement.expiry_date &&
                        ` • Expires ${format(new Date(announcement.expiry_date), "MMM dd, yyyy")}`}
                    </CardDescription>
                  </div>
                  <Badge variant={announcement.is_active ? "default" : "outline"}>
                    {announcement.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{announcement.content}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/shop/announcements/${announcement.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setDeleteId(announcement.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
