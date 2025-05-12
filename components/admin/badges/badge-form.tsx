"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Award, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createServerClient } from "@/lib/supabase/server"
import { toast } from "@/components/ui/use-toast"
import { Card } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"

const badgeFormSchema = z.object({
  name: z.string().min(2, {
    message: "Badge name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Badge description must be at least 10 characters.",
  }),
  requirements: z.string().min(5, {
    message: "Requirements must be at least 5 characters.",
  }),
  imageUrl: z
    .string()
    .url({
      message: "Please enter a valid URL for the badge image.",
    })
    .optional()
    .or(z.literal("")),
  availableFrom: z.date().optional(),
  availableUntil: z.date().optional(),
  points: z.coerce
    .number()
    .int()
    .positive({
      message: "Points must be a positive number.",
    })
    .optional(),
})

type BadgeFormValues = z.infer<typeof badgeFormSchema>

const defaultValues: Partial<BadgeFormValues> = {
  name: "",
  description: "",
  requirements: "",
  imageUrl: "",
  points: 10,
}

interface BadgeFormProps {
  initialData?: BadgeFormValues & { id: string }
}

export function BadgeForm({ initialData }: BadgeFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<BadgeFormValues>({
    resolver: zodResolver(badgeFormSchema),
    defaultValues: initialData || defaultValues,
  })

  async function onSubmit(data: BadgeFormValues) {
    setIsLoading(true)
    try {
      const supabase = createServerClient()

      if (initialData?.id) {
        // Update existing badge
        const { error } = await supabase
          .from("badges")
          .update({
            name: data.name,
            description: data.description,
            requirements: data.requirements,
            image_url: data.imageUrl || null,
            available_from: data.availableFrom || null,
            available_until: data.availableUntil || null,
            points: data.points || 0,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id)

        if (error) throw error

        toast({
          title: "Badge updated",
          description: "The badge has been updated successfully.",
        })
      } else {
        // Create new badge
        const { error } = await supabase.from("badges").insert({
          name: data.name,
          description: data.description,
          requirements: data.requirements,
          image_url: data.imageUrl || null,
          available_from: data.availableFrom || null,
          available_until: data.availableUntil || null,
          points: data.points || 0,
        })

        if (error) throw error

        toast({
          title: "Badge created",
          description: "The new badge has been created successfully.",
        })
      }

      router.push("/dashboard/admin/badges")
      router.refresh()
    } catch (error) {
      console.error("Error saving badge:", error)
      toast({
        title: "Error",
        description: "There was an error saving the badge. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Badge Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Ice Cream Explorer" {...field} />
                  </FormControl>
                  <FormDescription>The name of the badge as it will appear to users.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="This badge is awarded to users who have tried 10 different flavors."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>A brief description of what the badge represents.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Try 10 different ice cream flavors and log them in your ConeDex."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>The specific requirements users need to meet to earn this badge.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Badge Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/badge-image.png" {...field} />
                  </FormControl>
                  <FormDescription>A URL to the image that represents this badge.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="availableFrom"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Available From</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormDescription>When this badge becomes available.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availableUntil"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Available Until</FormLabel>
                    <DatePicker date={field.value} setDate={field.onChange} />
                    <FormDescription>When this badge expires (optional).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Points Value</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>The number of points awarded for earning this badge.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Badge Preview */}
            <Card className="p-4 border border-dashed">
              <div className="text-center">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Badge Preview</h3>
                <div className="flex justify-center mb-2">
                  {form.watch("imageUrl") ? (
                    <img
                      src={form.watch("imageUrl") || "/placeholder.svg"}
                      alt="Badge Preview"
                      className="h-24 w-24 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/fruit-ice-cream-badge.png"
                      }}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                      <Award className="h-12 w-12 text-primary" />
                    </div>
                  )}
                </div>
                <h4 className="font-medium">{form.watch("name") || "Badge Name"}</h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {form.watch("description") || "Badge description will appear here"}
                </p>
              </div>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/admin/badges")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update Badge" : "Create Badge"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
