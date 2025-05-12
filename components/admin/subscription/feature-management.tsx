"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  getFeatures,
  createFeature,
  updateFeature,
  deleteFeature,
} from "@/app/actions/admin/subscription-feature-actions"

interface Feature {
  id: string
  name: string
  key: string
  description: string | null
  category: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export function FeatureManagement() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
    category: "",
    isActive: true,
  })

  const { toast } = useToast()

  // Load features on mount
  useEffect(() => {
    loadFeatures()
  }, [])

  const loadFeatures = async () => {
    setIsLoading(true)

    try {
      const { features, success, error } = await getFeatures()

      if (success && features) {
        setFeatures(features)
      } else {
        toast({
          title: "Error loading features",
          description: error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading features:", error)
      toast({
        title: "Error loading features",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingFeature) {
        // Update existing feature
        const { success, error } = await updateFeature({
          id: editingFeature.id,
          name: formData.name,
          key: formData.key,
          description: formData.description || null,
          category: formData.category || null,
          isActive: formData.isActive,
        })

        if (success) {
          toast({
            title: "Feature updated",
            description: `${formData.name} has been updated successfully.`,
          })
          loadFeatures()
          setIsDialogOpen(false)
        } else {
          toast({
            title: "Error updating feature",
            description: error,
            variant: "destructive",
          })
        }
      } else {
        // Create new feature
        const { success, error } = await createFeature({
          name: formData.name,
          key: formData.key,
          description: formData.description || null,
          category: formData.category || null,
          isActive: formData.isActive,
        })

        if (success) {
          toast({
            title: "Feature created",
            description: `${formData.name} has been created successfully.`,
          })
          loadFeatures()
          setIsDialogOpen(false)
        } else {
          toast({
            title: "Error creating feature",
            description: error,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error submitting feature:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (feature: Feature) => {
    setEditingFeature(feature)
    setFormData({
      name: feature.name,
      key: feature.key,
      description: feature.description || "",
      category: feature.category || "",
      isActive: feature.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    try {
      const { success, error } = await deleteFeature(id)

      if (success) {
        toast({
          title: "Feature deleted",
          description: `${name} has been deleted successfully.`,
        })
        loadFeatures()
      } else {
        toast({
          title: "Error deleting feature",
          description: error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting feature:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      key: "",
      description: "",
      category: "",
      isActive: true,
    })
    setEditingFeature(null)
  }

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  // Group features by category
  const featuresByCategory: Record<string, Feature[]> = {}
  features.forEach((feature) => {
    const category = feature.category || "Uncategorized"
    if (!featuresByCategory[category]) {
      featuresByCategory[category] = []
    }
    featuresByCategory[category].push(feature)
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Available Features</h3>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingFeature ? "Edit Feature" : "Add New Feature"}</DialogTitle>
              <DialogDescription>
                {editingFeature
                  ? "Update the details of this feature"
                  : "Create a new feature that can be assigned to subscription tiers"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Feature Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Advanced Analytics"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="key">Feature Key</Label>
                <Input
                  id="key"
                  name="key"
                  value={formData.key}
                  onChange={handleInputChange}
                  placeholder="e.g. advanced_analytics"
                  required
                />
                <p className="text-xs text-muted-foreground">Unique identifier used in code. Use snake_case.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what this feature provides"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={handleSelectChange}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Shop Management">Shop Management</SelectItem>
                    <SelectItem value="Analytics">Analytics</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Customization">Customization</SelectItem>
                    <SelectItem value="Integration">Integration</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="CRM">CRM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
                <Label htmlFor="isActive">Feature is active</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingFeature ? "Update Feature" : "Create Feature"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : features.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">No features have been created yet.</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Feature
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(featuresByCategory).map(([category, categoryFeatures]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
              <div className="border rounded-md divide-y">
                {categoryFeatures.map((feature) => (
                  <div key={feature.id} className="p-4 flex items-center justify-between hover:bg-muted/20">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium">{feature.name}</h5>
                        {!feature.is_active && (
                          <Badge variant="outline" className="text-muted-foreground">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {feature.description || "No description provided"}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground">Key: {feature.key}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(feature)}>
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Feature</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the feature "{feature.name}"? This will remove it from all
                              subscription tiers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(feature.id, feature.name)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
