"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Upload, Trash2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditFlavorPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_type: "Ice Cream",
    is_available: true,
    ingredients: "",
    allergens: "",
    nutrition_info: "",
    image_url: "",
    shop_id: "",
  })
  const [shop, setShop] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFlavorData = async () => {
      if (!user) return

      setLoading(true)
      try {
        // Get the shop
        const { data: shopData, error: shopError } = await supabase
          .from("shops")
          .select("*")
          .eq("owner_id", user.id)
          .single()

        if (shopError) throw shopError

        setShop(shopData)

        // Get the flavor
        const { data: flavorData, error: flavorError } = await supabase
          .from("flavors")
          .select("*")
          .eq("id", params.id)
          .single()

        if (flavorError) throw flavorError

        // Check if flavor belongs to the shop
        if (flavorData.shop_id !== shopData.id) {
          setError("You don't have permission to edit this flavor")
          return
        }

        setFormData({
          name: flavorData.name || "",
          description: flavorData.description || "",
          base_type: flavorData.base_type || "Ice Cream",
          is_available: flavorData.is_available || false,
          ingredients: flavorData.ingredients || "",
          allergens: flavorData.allergens || "",
          nutrition_info: flavorData.nutrition_info || "",
          image_url: flavorData.image_url || "",
          shop_id: flavorData.shop_id,
        })

        if (flavorData.image_url) {
          setImagePreview(flavorData.image_url)
        }
      } catch (error) {
        console.error("Error fetching flavor data:", error)
        setError("Failed to load flavor data")
      } finally {
        setLoading(false)
      }
    }

    fetchFlavorData()
  }, [user, supabase, params.id])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update a flavor",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      let imageUrl = formData.image_url

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `flavors/${fileName}`

        const { error: uploadError } = await supabase.storage.from("images").upload(filePath, imageFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from("images").getPublicUrl(filePath)
        imageUrl = urlData.publicUrl
      }

      // Update flavor
      const { error: updateError } = await supabase
        .from("flavors")
        .update({
          name: formData.name,
          description: formData.description,
          base_type: formData.base_type,
          is_available: formData.is_available,
          ingredients: formData.ingredients,
          allergens: formData.allergens,
          nutrition_info: formData.nutrition_info,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)

      if (updateError) throw updateError

      toast({
        title: "Success",
        description: "Flavor updated successfully",
      })

      router.push("/dashboard/shop/flavors")
    } catch (error) {
      console.error("Error updating flavor:", error)
      toast({
        title: "Error",
        description: "Failed to update flavor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to delete a flavor",
        variant: "destructive",
      })
      return
    }

    setDeleting(true)

    try {
      const { error } = await supabase.from("flavors").delete().eq("id", params.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Flavor deleted successfully",
      })

      router.push("/dashboard/shop/flavors")
    } catch (error) {
      console.error("Error deleting flavor:", error)
      toast({
        title: "Error",
        description: "Failed to delete flavor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-1 h-4 w-64" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-3xl font-bold">Edit Flavor</h1>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Button onClick={() => router.push("/dashboard/shop/flavors")}>Back to Flavors</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Flavor</h1>
          <p className="text-muted-foreground">{formData.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Flavor Information</CardTitle>
            <CardDescription>Basic details about your flavor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Flavor Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Vanilla Bean"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your flavor..."
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="base_type">Base Type</Label>
                <Select value={formData.base_type} onValueChange={(value) => handleSelectChange("base_type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select base type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ice Cream">Ice Cream</SelectItem>
                    <SelectItem value="Gelato">Gelato</SelectItem>
                    <SelectItem value="Sorbet">Sorbet</SelectItem>
                    <SelectItem value="Frozen Yogurt">Frozen Yogurt</SelectItem>
                    <SelectItem value="Dairy-Free">Dairy-Free</SelectItem>
                    <SelectItem value="Vegan">Vegan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end space-y-2">
                <div className="flex flex-1 items-center space-x-2">
                  <Switch
                    id="is_available"
                    checked={formData.is_available}
                    onCheckedChange={(checked) => handleSwitchChange("is_available", checked)}
                  />
                  <Label htmlFor="is_available">Available</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flavor Image</CardTitle>
            <CardDescription>Upload an image of your flavor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                {imagePreview ? (
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
                    <Upload className="mb-2 h-8 w-8" />
                    <p className="text-xs">No image selected</p>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="image">Upload Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">Recommended size: 800x600 pixels. Max file size: 5MB.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
            <CardDescription>Optional information about your flavor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredients</Label>
              <Textarea
                id="ingredients"
                name="ingredients"
                placeholder="List the ingredients..."
                value={formData.ingredients}
                onChange={handleInputChange}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergens">Allergens</Label>
              <Input
                id="allergens"
                name="allergens"
                placeholder="e.g. Milk, Nuts, Eggs"
                value={formData.allergens}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nutrition_info">Nutrition Information</Label>
              <Textarea
                id="nutrition_info"
                name="nutrition_info"
                placeholder="Nutritional details..."
                value={formData.nutrition_info}
                onChange={handleInputChange}
                rows={2}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" type="button">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Flavor
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the flavor from your shop.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
