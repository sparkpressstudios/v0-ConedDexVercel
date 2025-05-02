"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { analyzeNewFlavor } from "@/app/actions/flavor-moderation"

export default function AddFlavorPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [sendNotification, setSendNotification] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_type: "Ice Cream",
    is_available: true,
    ingredients: "",
    allergens: "",
    nutrition_info: "",
  })

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
        description: "You must be logged in to add a flavor",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Get the shop
      const { data: shop, error: shopError } = await supabase
        .from("shops")
        .select("id, name")
        .eq("owner_id", user.id)
        .single()

      if (shopError) throw shopError

      let imageUrl = null

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

      // Insert flavor with pending moderation status
      const { data: flavor, error: insertError } = await supabase
        .from("flavors")
        .insert([
          {
            name: formData.name,
            description: formData.description,
            base_type: formData.base_type,
            is_available: formData.is_available,
            ingredients: formData.ingredients,
            allergens: formData.allergens,
            nutrition_info: formData.nutrition_info,
            shop_id: shop.id,
            image_url: imageUrl,
            moderation_status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (insertError) throw insertError

      // Trigger AI analysis in the background
      analyzeNewFlavor(flavor.id).catch((error) => {
        console.error("Background AI analysis failed:", error)
        // We don't need to handle this error in the UI since it's a background process
      })

      // Send notification to followers if enabled
      if (sendNotification) {
        try {
          await fetch("/api/push/new-flavor", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              shopId: shop.id,
              shopName: shop.name,
              flavorId: flavor.id,
              flavorName: flavor.name,
              flavorImage: flavor.image_url,
              flavorDescription: flavor.description,
            }),
          })
        } catch (notificationError) {
          console.error("Error sending push notifications:", notificationError)
          // Don't fail the whole operation if notifications fail
        }
      }

      toast({
        title: "Success",
        description: "Flavor added successfully and is pending moderation",
      })

      router.push("/dashboard/shop/flavors")
    } catch (error) {
      console.error("Error adding flavor:", error)
      toast({
        title: "Error",
        description: "Failed to add flavor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Flavor</h1>
          <p className="text-muted-foreground">Create a new flavor for your shop</p>
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

            <div className="flex items-center space-x-2">
              <Switch id="send-notification" checked={sendNotification} onCheckedChange={setSendNotification} />
              <Label htmlFor="send-notification">Notify followers about this new flavor</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Add Flavor"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
