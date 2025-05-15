"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Star } from "lucide-react"

const formSchema = z.object({
  flavorName: z.string().min(2, {
    message: "Flavor name must be at least 2 characters.",
  }),
  shopName: z.string().min(2, {
    message: "Shop name must be at least 2 characters.",
  }),
  rating: z.number().min(1).max(5),
  notes: z.string().optional(),
  category: z.string().optional(),
})

interface LogFlavorFormProps {
  onSuccess?: () => void
}

// Named export
export function LogFlavorForm({ onSuccess }: LogFlavorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      flavorName: "",
      shopName: "",
      rating: 5,
      notes: "",
      category: "classic",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to log a flavor.",
          variant: "destructive",
        })
        return
      }

      // First, check if the shop exists or create it
      let shopId: string | null = null
      const { data: existingShops } = await supabase.from("shops").select("id").eq("name", values.shopName).limit(1)

      if (existingShops && existingShops.length > 0) {
        shopId = existingShops[0].id
      } else {
        // Create a new shop
        const { data: newShop, error: shopError } = await supabase
          .from("shops")
          .insert({
            name: values.shopName,
            created_by: user.id,
          })
          .select("id")
          .single()

        if (shopError) {
          throw new Error(`Error creating shop: ${shopError.message}`)
        }

        shopId = newShop.id
      }

      // Check if the flavor exists or create it
      let flavorId: string | null = null
      const { data: existingFlavors } = await supabase
        .from("flavors")
        .select("id")
        .eq("name", values.flavorName)
        .limit(1)

      if (existingFlavors && existingFlavors.length > 0) {
        flavorId = existingFlavors[0].id
      } else {
        // Create a new flavor
        const { data: newFlavor, error: flavorError } = await supabase
          .from("flavors")
          .insert({
            name: values.flavorName,
            category: values.category || "classic",
            created_by: user.id,
          })
          .select("id")
          .single()

        if (flavorError) {
          throw new Error(`Error creating flavor: ${flavorError.message}`)
        }

        flavorId = newFlavor.id
      }

      // Log the flavor
      const { error: logError } = await supabase.from("flavor_logs").insert({
        user_id: user.id,
        flavor_id: flavorId,
        shop_id: shopId,
        rating: values.rating,
        notes: values.notes,
      })

      if (logError) {
        throw new Error(`Error logging flavor: ${logError.message}`)
      }

      toast({
        title: "Flavor Logged!",
        description: `You've added ${values.flavorName} from ${values.shopName} to your ConeDex.`,
      })

      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error("Error logging flavor:", error)
      toast({
        title: "Error",
        description: "There was a problem logging your flavor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="flavorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Flavor Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Vanilla Bean" {...field} />
              </FormControl>
              <FormDescription>Enter the name of the ice cream flavor you tried.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shopName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shop Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Sweet Scoops" {...field} />
              </FormControl>
              <FormDescription>Where did you try this flavor?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="chocolate">Chocolate</SelectItem>
                  <SelectItem value="fruit">Fruit</SelectItem>
                  <SelectItem value="nut">Nut</SelectItem>
                  <SelectItem value="specialty">Specialty</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Select a category for this flavor.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <div className="flex items-center gap-4">
                <FormControl>
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="w-full"
                  />
                </FormControl>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span className="ml-1 font-medium">{field.value}</span>
                </div>
              </div>
              <FormDescription>How would you rate this flavor?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What did you think about this flavor? Any special ingredients or characteristics?"
                  {...field}
                />
              </FormControl>
              <FormDescription>Optional: Add your thoughts about this flavor.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging...
            </>
          ) : (
            "Log Flavor"
          )}
        </Button>
      </form>
    </Form>
  )
}

// Default export
export default LogFlavorForm
