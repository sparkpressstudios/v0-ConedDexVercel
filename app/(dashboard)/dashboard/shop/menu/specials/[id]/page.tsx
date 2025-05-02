"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tag, Loader2, Search, Plus, Trash2, IceCream, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
import { useToast } from "@/components/ui/use-toast"

export default function SpecialFlavorsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const { toast } = useToast()
  const specialId = params.id

  const [isLoading, setIsLoading] = useState(true)
  const [shop, setShop] = useState<any | null>(null)
  const [special, setSpecial] = useState<any | null>(null)
  const [allFlavors, setAllFlavors] = useState<any[]>([])
  const [specialFlavors, setSpecialFlavors] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [deleteFlavorId, setDeleteFlavorId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Get the shop
        const { data: shopData, error: shopError } = await supabase
          .from("shops")
          .select("*")
          .eq("owner_id", user.id)
          .single()

        if (shopError) {
          if (shopError.code === "PGRST116") {
            // No shop found, redirect to claim page
            router.push("/dashboard/shop/claim")
            return
          }
          throw shopError
        }

        setShop(shopData)

        // Get the special
        const { data: specialData, error: specialError } = await supabase
          .from("menu_specials")
          .select("*")
          .eq("id", specialId)
          .eq("shop_id", shopData.id)
          .single()

        if (specialError) {
          if (specialError.code === "PGRST116") {
            // Special not found or doesn't belong to this shop
            router.push("/dashboard/shop/menu")
            return
          }
          throw specialError
        }

        setSpecial(specialData)

        // Get all flavors for this shop
        const { data: flavorsData, error: flavorsError } = await supabase
          .from("flavors")
          .select("*")
          .eq("shop_id", shopData.id)
          .eq("is_available", true)
          .order("name")

        if (flavorsError) throw flavorsError
        setAllFlavors(flavorsData || [])

        // Get flavors already in this special
        const { data: specialFlavorsData, error: specialFlavorsError } = await supabase
          .from("special_flavors")
          .select(`
            flavor_id,
            flavor:flavors(*)
          `)
          .eq("special_id", specialId)

        if (specialFlavorsError) throw specialFlavorsError

        const formattedSpecialFlavors = specialFlavorsData?.map((item) => item.flavor) || []
        setSpecialFlavors(formattedSpecialFlavors)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, supabase, router, specialId, toast])

  // Filter flavors based on search
  const filteredFlavors = allFlavors.filter((flavor) => {
    const matchesSearch =
      flavor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (flavor.description && flavor.description.toLowerCase().includes(searchQuery.toLowerCase()))

    // Exclude flavors that are already in the special
    const isAlreadyInSpecial = specialFlavors.some((sf) => sf.id === flavor.id)

    return matchesSearch && !isAlreadyInSpecial
  })

  // Handle adding flavors to the special
  const handleAddFlavors = async () => {
    if (selectedFlavors.length === 0) {
      toast({
        title: "No Flavors Selected",
        description: "Please select at least one flavor to add to the special.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)

      // Prepare the data for insertion
      const specialFlavorsToAdd = selectedFlavors.map((flavorId) => ({
        special_id: specialId,
        flavor_id: flavorId,
      }))

      // Insert the new special flavors
      const { error } = await supabase.from("special_flavors").insert(specialFlavorsToAdd)

      if (error) throw error

      // Get the newly added flavors
      const { data: newFlavorsData, error: newFlavorsError } = await supabase
        .from("flavors")
        .select("*")
        .in("id", selectedFlavors)

      if (newFlavorsError) throw newFlavorsError

      // Update the UI
      setSpecialFlavors([...specialFlavors, ...(newFlavorsData || [])])
      setSelectedFlavors([])

      toast({
        title: "Success",
        description: `Added ${selectedFlavors.length} flavor${selectedFlavors.length === 1 ? "" : "s"} to the special.`,
      })
    } catch (error) {
      console.error("Error adding flavors to special:", error)
      toast({
        title: "Error",
        description: "Failed to add flavors to the special.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle removing a flavor from the special
  const handleRemoveFlavor = async (flavorId: string) => {
    try {
      setIsProcessing(true)

      const { error } = await supabase
        .from("special_flavors")
        .delete()
        .eq("special_id", specialId)
        .eq("flavor_id", flavorId)

      if (error) throw error

      // Update the UI
      setSpecialFlavors(specialFlavors.filter((flavor) => flavor.id !== flavorId))

      toast({
        title: "Success",
        description: "Flavor removed from special.",
      })
    } catch (error) {
      console.error("Error removing flavor from special:", error)
      toast({
        title: "Error",
        description: "Failed to remove flavor from the special.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setDeleteFlavorId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!shop || !special) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Not Found</CardTitle>
            <CardDescription>The requested special was not found.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please return to the menu management page and try again.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard/shop/menu")} className="w-full">
              Back to Menu Management
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{special.name}</h1>
          <p className="text-muted-foreground">Manage flavors for this special offer</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/shop/menu")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Special Details</CardTitle>
              <CardDescription>Information about this special offer</CardDescription>
            </div>
            <Badge variant={special.is_active ? "default" : "outline"}>
              {special.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {special.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p>{special.description}</p>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {special.discount_percentage && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Discount</h3>
                  <p>{special.discount_percentage}% off</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
                <p>
                  {special.start_date ? new Date(special.start_date).toLocaleDateString() : "Any time"} -{" "}
                  {special.end_date ? new Date(special.end_date).toLocaleDateString() : "Ongoing"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Special Flavors */}
        <Card>
          <CardHeader>
            <CardTitle>Flavors in this Special</CardTitle>
            <CardDescription>
              {specialFlavors.length === 0
                ? "No flavors added to this special yet"
                : `${specialFlavors.length} flavor${specialFlavors.length === 1 ? "" : "s"} included in this special`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {specialFlavors.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <Tag className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No flavors in this special</p>
                <p className="text-sm text-muted-foreground">Add flavors from the right panel</p>
              </div>
            ) : (
              <div className="space-y-4">
                {specialFlavors.map((flavor) => (
                  <div key={flavor.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      {flavor.image_url ? (
                        <div className="h-12 w-12 overflow-hidden rounded-md">
                          <img
                            src={flavor.image_url || "/placeholder.svg"}
                            alt={flavor.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                          <IceCream className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{flavor.name}</p>
                        <p className="text-sm text-muted-foreground">{flavor.base_type || "Ice Cream"}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteFlavorId(flavor.id)}
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Flavors to Special */}
        <Card>
          <CardHeader>
            <CardTitle>Add Flavors</CardTitle>
            <CardDescription>Select flavors to add to this special</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search flavors..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredFlavors.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <IceCream className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No flavors found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try a different search term" : "All available flavors are already in this special"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFlavors.map((flavor) => (
                  <div key={flavor.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`flavor-${flavor.id}`}
                        checked={selectedFlavors.includes(flavor.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedFlavors([...selectedFlavors, flavor.id])
                          } else {
                            setSelectedFlavors(selectedFlavors.filter((id) => id !== flavor.id))
                          }
                        }}
                      />
                      {flavor.image_url ? (
                        <div className="h-12 w-12 overflow-hidden rounded-md">
                          <img
                            src={flavor.image_url || "/placeholder.svg"}
                            alt={flavor.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                          <IceCream className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <label htmlFor={`flavor-${flavor.id}`} className="font-medium">
                          {flavor.name}
                        </label>
                        <p className="text-sm text-muted-foreground">{flavor.base_type || "Ice Cream"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t p-4">
            <Button
              onClick={handleAddFlavors}
              disabled={isProcessing || selectedFlavors.length === 0}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Selected Flavors ({selectedFlavors.length})
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Delete Flavor Confirmation Dialog */}
      <AlertDialog open={!!deleteFlavorId} onOpenChange={(open) => !open && setDeleteFlavorId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Flavor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this flavor from the special? This action can be undone by adding the
              flavor again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFlavorId && handleRemoveFlavor(deleteFlavorId)}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
