"use client"

import Link from "next/link"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface AddFlavorFormProps {
  shopId: string
  shopName: string
  userId: string
}

export function AddFlavorForm({ shopId, shopName, userId }: AddFlavorFormProps) {
  const [flavorName, setFlavorName] = useState("")
  const [description, setDescription] = useState("")
  const [baseType, setBaseType] = useState("dairy")
  const [ingredients, setIngredients] = useState("")
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
        .from("shop_flavors")
        .insert({
          name: flavorName,
          description: description || null,
          base_type: baseType,
          ingredients: ingredients || null,
          shop_id: shopId,
          is_active: true,
          is_approved: false, // Requires moderation
          submitted_by: userId,
        })
        .select()

      if (error) throw error

      toast({
        title: "Flavor added!",
        description: `${flavorName} has been added to ${shopName} and is pending approval.`,
      })

      // Redirect back to the shop page
      router.push(`/dashboard/shops/${shopId}`)
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="flavor-name">Flavor Name *</Label>
        <Input
          id="flavor-name"
          value={flavorName}
          onChange={(e) => setFlavorName(e.target.value)}
          placeholder="e.g., Vanilla Bean"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="base-type">Base Type *</Label>
        <Select value={baseType} onValueChange={setBaseType} required>
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
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the flavor, taste profile, etc."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ingredients">Ingredients (Optional)</Label>
        <Textarea
          id="ingredients"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="List the ingredients if known"
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" asChild>
          <Link href={`/dashboard/shops/${shopId}`}>Cancel</Link>
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
      </div>
    </form>
  )
}
