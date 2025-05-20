"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Shop {
  id: string
  name: string
  [key: string]: any
}

interface AddFlavorModalProps {
  isOpen: boolean
  onClose: () => void
  shop: Shop
}

export function AddFlavorModal({ isOpen, onClose, shop }: AddFlavorModalProps) {
  const [flavorName, setFlavorName] = useState("")
  const [description, setDescription] = useState("")
  const [baseType, setBaseType] = useState("dairy")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!flavorName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a flavor name",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Upload the flavor to the database
      const { data, error } = await supabase
        .from("flavors")
        .insert({
          name: flavorName,
          description: description || null,
          base_type: baseType,
          shop_id: shop.id,
          is_active: true,
          is_approved: false, // Requires moderation
          submitted_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()

      if (error) throw error

      toast({
        title: "Flavor added!",
        description: `${flavorName} has been added to ${shop.name} and is pending approval.`,
      })

      // Reset form and close modal
      setFlavorName("")
      setDescription("")
      setBaseType("dairy")
      onClose()

      // Refresh the page to show the new flavor (it will be pending approval)
      router.refresh()
    } catch (error) {
      console.error("Error adding flavor:", error)
      toast({
        title: "Failed to add flavor",
        description: "There was an error adding the flavor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Flavor</DialogTitle>
          <DialogDescription>
            Add a new flavor you discovered at {shop.name}. Your submission will be reviewed before being published.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="flavor-name">Flavor Name</Label>
            <Input
              id="flavor-name"
              value={flavorName}
              onChange={(e) => setFlavorName(e.target.value)}
              placeholder="e.g., Vanilla Bean"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="base-type">Base Type</Label>
            <Select value={baseType} onValueChange={setBaseType}>
              <SelectTrigger>
                <SelectValue placeholder="Select base type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dairy">Dairy</SelectItem>
                <SelectItem value="sorbet">Sorbet</SelectItem>
                <SelectItem value="gelato">Gelato</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="frozen-yogurt">Frozen Yogurt</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the flavor, ingredients, etc."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Add Flavor"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
