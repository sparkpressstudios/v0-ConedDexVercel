"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Edit,
  Trash2,
  Menu,
  Tag,
  Calendar,
  Loader2,
  MoveUp,
  MoveDown,
  Search,
  Filter,
  RefreshCw,
  IceCream,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"

// Types for our data
interface MenuCategory {
  id: string
  name: string
  description: string | null
  shop_id: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  flavor_count?: number
}

interface MenuSpecial {
  id: string
  name: string
  description: string | null
  shop_id: string
  start_date: string | null
  end_date: string | null
  is_active: boolean
  discount_percentage: number | null
  discount_amount: number | null
  created_at: string
  updated_at: string
  flavors?: any[]
}

export default function ShopMenuPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const { toast } = useToast()

  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [specials, setSpecials] = useState<MenuSpecial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [shop, setShop] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")

  // Dialog states
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isAddSpecialOpen, setIsAddSpecialOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: "", description: "", is_active: true })
  const [newSpecial, setNewSpecial] = useState({
    name: "",
    description: "",
    is_active: true,
    start_date: "",
    end_date: "",
    discount_percentage: 0,
  })
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null)
  const [editingSpecial, setEditingSpecial] = useState<MenuSpecial | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteType, setDeleteType] = useState<"category" | "special">("category")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const fetchShopData = async () => {
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

        // Get menu categories with flavor count
        const { data: categoryData, error: categoryError } = await supabase
          .from("menu_categories")
          .select(`
            *,
            flavor_count:flavors(count)
          `)
          .eq("shop_id", shopData.id)
          .order("display_order", { ascending: true })

        if (categoryError) throw categoryError

        // Format the data to get the count
        const formattedCategories = categoryData.map((category: any) => ({
          ...category,
          flavor_count: category.flavor_count[0]?.count || 0,
        }))

        setCategories(formattedCategories || [])

        // Get menu specials
        const { data: specialData, error: specialError } = await supabase
          .from("menu_specials")
          .select(`
            *,
            flavors:special_flavors(
              flavor_id,
              flavor:flavors(id, name, image_url)
            )
          `)
          .eq("shop_id", shopData.id)
          .order("created_at", { ascending: false })

        if (specialError) throw specialError
        setSpecials(specialData || [])
      } catch (error) {
        console.error("Error fetching shop menu data:", error)
        toast({
          title: "Error",
          description: "Failed to load menu data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchShopData()
  }, [user, supabase, router, toast])

  // Filter categories based on search and active filter
  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))

    if (activeFilter === "all") return matchesSearch
    if (activeFilter === "active") return matchesSearch && category.is_active
    if (activeFilter === "inactive") return matchesSearch && !category.is_active

    return matchesSearch
  })

  // Filter specials based on search and active filter
  const filteredSpecials = specials.filter((special) => {
    const matchesSearch =
      special.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (special.description && special.description.toLowerCase().includes(searchQuery.toLowerCase()))

    if (activeFilter === "all") return matchesSearch
    if (activeFilter === "active") return matchesSearch && special.is_active
    if (activeFilter === "inactive") return matchesSearch && special.is_active
    if (activeFilter === "current") {
      const now = new Date()
      const startDate = special.start_date ? new Date(special.start_date) : null
      const endDate = special.end_date ? new Date(special.end_date) : null

      return matchesSearch && special.is_active && (!startDate || startDate <= now) && (!endDate || endDate >= now)
    }

    return matchesSearch
  })

  // Handle category reordering
  const handleMoveCategory = async (categoryId: string, direction: "up" | "down") => {
    const categoryIndex = categories.findIndex((c) => c.id === categoryId)
    if (categoryIndex === -1) return

    // Can't move up if already at the top
    if (direction === "up" && categoryIndex === 0) return

    // Can't move down if already at the bottom
    if (direction === "down" && categoryIndex === categories.length - 1) return

    const newCategories = [...categories]
    const swapIndex = direction === "up" ? categoryIndex - 1 : categoryIndex + 1

    // Swap display_order values
    const tempOrder = newCategories[categoryIndex].display_order
    newCategories[categoryIndex].display_order = newCategories[swapIndex].display_order
    newCategories[swapIndex].display_order = tempOrder[
      // Swap positions in array
      (newCategories[categoryIndex], newCategories[swapIndex])
    ] = [newCategories[swapIndex], newCategories[categoryIndex]]

    setCategories(newCategories)

    // Update in database
    try {
      setIsProcessing(true)
      const updates = [
        { id: newCategories[categoryIndex].id, display_order: newCategories[categoryIndex].display_order },
        { id: newCategories[swapIndex].id, display_order: newCategories[swapIndex].display_order },
      ]

      const { error } = await supabase.from("menu_categories").upsert(updates)

      if (error) throw error

      toast({
        title: "Success",
        description: "Category order updated successfully",
      })
    } catch (error) {
      console.error("Error updating category order:", error)
      toast({
        title: "Error",
        description: "Failed to update category order",
        variant: "destructive",
      })

      // Revert changes on error
      const { data } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("shop_id", shop.id)
        .order("display_order", { ascending: true })

      setCategories(data || [])
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle adding a new category
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)

      // Get the highest display_order
      const maxOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.display_order)) : 0

      const { data, error } = await supabase
        .from("menu_categories")
        .insert({
          name: newCategory.name,
          description: newCategory.description || null,
          shop_id: shop.id,
          display_order: maxOrder + 1,
          is_active: newCategory.is_active,
        })
        .select()

      if (error) throw error

      // Add the new category to the list
      setCategories([...categories, { ...data[0], flavor_count: 0 }])

      // Reset form and close dialog
      setNewCategory({ name: "", description: "", is_active: true })
      setIsAddCategoryOpen(false)

      toast({
        title: "Success",
        description: "Category added successfully",
      })
    } catch (error) {
      console.error("Error adding category:", error)
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle updating a category
  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)

      const { error } = await supabase
        .from("menu_categories")
        .update({
          name: editingCategory.name,
          description: editingCategory.description || null,
          is_active: editingCategory.is_active,
        })
        .eq("id", editingCategory.id)

      if (error) throw error

      // Update the category in the list
      setCategories(categories.map((c) => (c.id === editingCategory.id ? editingCategory : c)))

      // Reset form and close dialog
      setEditingCategory(null)

      toast({
        title: "Success",
        description: "Category updated successfully",
      })
    } catch (error) {
      console.error("Error updating category:", error)
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle deleting a category
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setIsProcessing(true)

      // Check if category has flavors
      const category = categories.find((c) => c.id === categoryId)
      if (category && category.flavor_count && category.flavor_count > 0) {
        toast({
          title: "Cannot Delete",
          description: `This category contains ${category.flavor_count} flavors. Please remove or reassign them first.`,
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("menu_categories").delete().eq("id", categoryId)

      if (error) throw error

      // Remove the category from the list
      setCategories(categories.filter((c) => c.id !== categoryId))

      toast({
        title: "Success",
        description: "Category deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setDeleteConfirmId(null)
    }
  }

  // Handle adding a new special
  const handleAddSpecial = async () => {
    if (!newSpecial.name.trim()) {
      toast({
        title: "Error",
        description: "Special name is required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)

      const { data, error } = await supabase
        .from("menu_specials")
        .insert({
          name: newSpecial.name,
          description: newSpecial.description || null,
          shop_id: shop.id,
          start_date: newSpecial.start_date || null,
          end_date: newSpecial.end_date || null,
          is_active: newSpecial.is_active,
          discount_percentage: newSpecial.discount_percentage || null,
        })
        .select()

      if (error) throw error

      // Add the new special to the list
      setSpecials([{ ...data[0], flavors: [] }, ...specials])

      // Reset form and close dialog
      setNewSpecial({
        name: "",
        description: "",
        is_active: true,
        start_date: "",
        end_date: "",
        discount_percentage: 0,
      })
      setIsAddSpecialOpen(false)

      toast({
        title: "Success",
        description: "Special added successfully",
      })
    } catch (error) {
      console.error("Error adding special:", error)
      toast({
        title: "Error",
        description: "Failed to add special",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle updating a special
  const handleUpdateSpecial = async () => {
    if (!editingSpecial || !editingSpecial.name.trim()) {
      toast({
        title: "Error",
        description: "Special name is required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)

      const { error } = await supabase
        .from("menu_specials")
        .update({
          name: editingSpecial.name,
          description: editingSpecial.description || null,
          start_date: editingSpecial.start_date || null,
          end_date: editingSpecial.end_date || null,
          is_active: editingSpecial.is_active,
          discount_percentage: editingSpecial.discount_percentage || null,
        })
        .eq("id", editingSpecial.id)

      if (error) throw error

      // Update the special in the list
      setSpecials(specials.map((s) => (s.id === editingSpecial.id ? { ...editingSpecial, flavors: s.flavors } : s)))

      // Reset form and close dialog
      setEditingSpecial(null)

      toast({
        title: "Success",
        description: "Special updated successfully",
      })
    } catch (error) {
      console.error("Error updating special:", error)
      toast({
        title: "Error",
        description: "Failed to update special",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle deleting a special
  const handleDeleteSpecial = async (specialId: string) => {
    try {
      setIsProcessing(true)

      // First delete any flavor associations
      const { error: assocError } = await supabase.from("special_flavors").delete().eq("special_id", specialId)

      if (assocError) throw assocError

      // Then delete the special
      const { error } = await supabase.from("menu_specials").delete().eq("id", specialId)

      if (error) throw error

      // Remove the special from the list
      setSpecials(specials.filter((s) => s.id !== specialId))

      toast({
        title: "Success",
        description: "Special deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting special:", error)
      toast({
        title: "Error",
        description: "Failed to delete special",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setDeleteConfirmId(null)
    }
  }

  // Handle toggling category active status
  const handleToggleCategoryActive = async (category: MenuCategory) => {
    try {
      setIsProcessing(true)

      const { error } = await supabase
        .from("menu_categories")
        .update({ is_active: !category.is_active })
        .eq("id", category.id)

      if (error) throw error

      // Update the category in the list
      setCategories(categories.map((c) => (c.id === category.id ? { ...c, is_active: !c.is_active } : c)))

      toast({
        title: "Success",
        description: `Category ${!category.is_active ? "activated" : "deactivated"} successfully`,
      })
    } catch (error) {
      console.error("Error toggling category status:", error)
      toast({
        title: "Error",
        description: "Failed to update category status",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle toggling special active status
  const handleToggleSpecialActive = async (special: MenuSpecial) => {
    try {
      setIsProcessing(true)

      const { error } = await supabase
        .from("menu_specials")
        .update({ is_active: !special.is_active })
        .eq("id", special.id)

      if (error) throw error

      // Update the special in the list
      setSpecials(specials.map((s) => (s.id === special.id ? { ...s, is_active: !s.is_active } : s)))

      toast({
        title: "Success",
        description: `Special ${!special.is_active ? "activated" : "deactivated"} successfully`,
      })
    } catch (error) {
      console.error("Error toggling special status:", error)
      toast({
        title: "Error",
        description: "Failed to update special status",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Shop Found</CardTitle>
            <CardDescription>You haven't claimed or created a shop yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Claim your existing business or create a new listing to get started.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard/shop/claim")} className="w-full">
              Claim or Create Shop
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
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">Organize your flavors and create special offers</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => router.push("/dashboard/shop")}>Back to Shop</Button>
        </div>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Menu className="h-4 w-4" />
            <span>Categories</span>
          </TabsTrigger>
          <TabsTrigger value="specials" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span>Specials</span>
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search categories..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter Categories</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveFilter("all")}>All Categories</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveFilter("active")}>Active Only</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveFilter("inactive")}>Inactive Only</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => setIsAddCategoryOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          </div>

          {filteredCategories.length === 0 ? (
            <Card>
              <CardContent className="flex h-40 flex-col items-center justify-center p-6 text-center">
                <Menu className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No categories found</p>
                <Button variant="link" onClick={() => setIsAddCategoryOpen(true)}>
                  Add your first category
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCategories.map((category) => (
                <Card key={category.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{category.name}</CardTitle>
                        <Badge variant={category.is_active ? "default" : "outline"}>
                          {category.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleMoveCategory(category.id, "up")}
                          disabled={isProcessing || categories.indexOf(category) === 0}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleMoveCategory(category.id, "down")}
                          disabled={isProcessing || categories.indexOf(category) === categories.length - 1}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Menu className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setEditingCategory(category)} disabled={isProcessing}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleCategoryActive(category)}
                              disabled={isProcessing}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              {category.is_active ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setDeleteConfirmId(category.id)
                                setDeleteType("category")
                              }}
                              disabled={isProcessing}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {category.description && <p className="text-sm text-muted-foreground">{category.description}</p>}
                    <div className="mt-2 flex items-center gap-2">
                      <IceCream className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {category.flavor_count} flavor{category.flavor_count === 1 ? "" : "s"}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end border-t p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/shop/flavors?category=${category.id}`)}
                    >
                      View Flavors
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Specials Tab */}
        <TabsContent value="specials" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search specials..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter Specials</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveFilter("all")}>All Specials</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveFilter("active")}>Active Only</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveFilter("inactive")}>Inactive Only</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveFilter("current")}>Currently Running</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => setIsAddSpecialOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Special
              </Button>
            </div>
          </div>

          {filteredSpecials.length === 0 ? (
            <Card>
              <CardContent className="flex h-40 flex-col items-center justify-center p-6 text-center">
                <Tag className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No specials found</p>
                <Button variant="link" onClick={() => setIsAddSpecialOpen(true)}>
                  Add your first special
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSpecials.map((special) => (
                <Card key={special.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{special.name}</CardTitle>
                        <Badge variant={special.is_active ? "default" : "outline"}>
                          {special.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Menu className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setEditingSpecial(special)} disabled={isProcessing}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Special
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleSpecialActive(special)}
                              disabled={isProcessing}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              {special.is_active ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/dashboard/shop/menu/specials/${special.id}`)}
                              disabled={isProcessing}
                            >
                              <IceCream className="mr-2 h-4 w-4" />
                              Manage Flavors
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setDeleteConfirmId(special.id)
                                setDeleteType("special")
                              }}
                              disabled={isProcessing}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Special
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {special.description && <p className="text-sm text-muted-foreground">{special.description}</p>}
                    <div className="mt-2 space-y-2">
                      {special.discount_percentage && (
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{special.discount_percentage}% discount</span>
                        </div>
                      )}
                      {(special.start_date || special.end_date) && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {special.start_date ? new Date(special.start_date).toLocaleDateString() : "Any time"} -{" "}
                            {special.end_date ? new Date(special.end_date).toLocaleDateString() : "Ongoing"}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <IceCream className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {special.flavors?.length || 0} flavor{special.flavors?.length === 1 ? "" : "s"} included
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end border-t p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/shop/menu/specials/${special.id}`)}
                    >
                      Manage Flavors
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Create a new category to organize your flavors</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                placeholder="e.g., Seasonal Flavors"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe this category..."
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is-active"
                checked={newCategory.is_active}
                onCheckedChange={(checked) => setNewCategory({ ...newCategory, is_active: checked })}
              />
              <Label htmlFor="is-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category details</DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Category Name</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Seasonal Flavors"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Describe this category..."
                  value={editingCategory.description || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is-active"
                  checked={editingCategory.is_active}
                  onCheckedChange={(checked) => setEditingCategory({ ...editingCategory, is_active: checked })}
                />
                <Label htmlFor="edit-is-active">Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Special Dialog */}
      <Dialog open={isAddSpecialOpen} onOpenChange={setIsAddSpecialOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Special</DialogTitle>
            <DialogDescription>Create a new special offer or promotion</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="special-name">Special Name</Label>
              <Input
                id="special-name"
                placeholder="e.g., Summer Sale"
                value={newSpecial.name}
                onChange={(e) => setNewSpecial({ ...newSpecial, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="special-description">Description (Optional)</Label>
              <Textarea
                id="special-description"
                placeholder="Describe this special..."
                value={newSpecial.description}
                onChange={(e) => setNewSpecial({ ...newSpecial, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date (Optional)</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newSpecial.start_date}
                  onChange={(e) => setNewSpecial({ ...newSpecial, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date (Optional)</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newSpecial.end_date}
                  onChange={(e) => setNewSpecial({ ...newSpecial, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount Percentage</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                placeholder="e.g., 10"
                value={newSpecial.discount_percentage || ""}
                onChange={(e) =>
                  setNewSpecial({ ...newSpecial, discount_percentage: Number.parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="special-is-active"
                checked={newSpecial.is_active}
                onCheckedChange={(checked) => setNewSpecial({ ...newSpecial, is_active: checked })}
              />
              <Label htmlFor="special-is-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSpecialOpen(false)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleAddSpecial} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Special"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Special Dialog */}
      <Dialog open={!!editingSpecial} onOpenChange={(open) => !open && setEditingSpecial(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Special</DialogTitle>
            <DialogDescription>Update special offer details</DialogDescription>
          </DialogHeader>
          {editingSpecial && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-special-name">Special Name</Label>
                <Input
                  id="edit-special-name"
                  placeholder="e.g., Summer Sale"
                  value={editingSpecial.name}
                  onChange={(e) => setEditingSpecial({ ...editingSpecial, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-special-description">Description (Optional)</Label>
                <Textarea
                  id="edit-special-description"
                  placeholder="Describe this special..."
                  value={editingSpecial.description || ""}
                  onChange={(e) => setEditingSpecial({ ...editingSpecial, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-start-date">Start Date (Optional)</Label>
                  <Input
                    id="edit-start-date"
                    type="date"
                    value={
                      editingSpecial.start_date ? new Date(editingSpecial.start_date).toISOString().split("T")[0] : ""
                    }
                    onChange={(e) => setEditingSpecial({ ...editingSpecial, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-end-date">End Date (Optional)</Label>
                  <Input
                    id="edit-end-date"
                    type="date"
                    value={editingSpecial.end_date ? new Date(editingSpecial.end_date).toISOString().split("T")[0] : ""}
                    onChange={(e) => setEditingSpecial({ ...editingSpecial, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-discount">Discount Percentage</Label>
                <Input
                  id="edit-discount"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g., 10"
                  value={editingSpecial.discount_percentage || ""}
                  onChange={(e) =>
                    setEditingSpecial({ ...editingSpecial, discount_percentage: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-special-is-active"
                  checked={editingSpecial.is_active}
                  onCheckedChange={(checked) => setEditingSpecial({ ...editingSpecial, is_active: checked })}
                />
                <Label htmlFor="edit-special-is-active">Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSpecial(null)} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSpecial} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Special"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {deleteType}.
              {deleteType === "category" && " Any flavors in this category will need to be reassigned."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteType === "category") {
                  handleDeleteCategory(deleteConfirmId!)
                } else {
                  handleDeleteSpecial(deleteConfirmId!)
                }
              }}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
