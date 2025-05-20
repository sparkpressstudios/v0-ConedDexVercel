"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IceCream, Star, Camera, MapPin, Search, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileFlavorLoggerProps {
  userId: string
  onSuccess?: () => void
}

export function MobileFlavorLogger({ userId, onSuccess }: MobileFlavorLoggerProps) {
  const [step, setStep] = useState<"shop" | "flavor" | "rating" | "photo" | "review">("shop")
  const [selectedShop, setSelectedShop] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [flavorName, setFlavorName] = useState("")
  const [flavorDescription, setFlavorDescription] = useState("")
  const [rating, setRating] = useState(4)
  const [review, setReview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Mock shops data
  const mockShops = [
    {
      id: "1",
      name: "Creamy Delights",
      address: "123 Main St",
      image_url: null,
    },
    {
      id: "2",
      name: "Frosty Scoops",
      address: "456 Elm St",
      image_url: null,
    },
    {
      id: "3",
      name: "Sweet Treats Ice Cream",
      address: "789 Oak St",
      image_url: null,
    },
  ]

  // Filter shops based on search query
  const filteredShops = mockShops.filter(
    (shop) =>
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.address.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedShop) {
      toast({
        title: "Shop required",
        description: "Please select a shop first",
        variant: "destructive",
      })
      return
    }

    if (!flavorName) {
      toast({
        title: "Flavor name required",
        description: "Please enter a flavor name",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real implementation, you would save the flavor log to the database
      // This is a placeholder that simulates saving data

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Flavor logged!",
        description: `You've successfully logged ${flavorName} from ${selectedShop.name}`,
      })

      // Reset form
      setSelectedShop(null)
      setFlavorName("")
      setFlavorDescription("")
      setRating(4)
      setReview("")
      setPhotoPreview(null)

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }

      // Navigate to the flavor details page
      // In a real implementation, you would navigate to the actual flavor page
      router.push("/dashboard/my-conedex")
    } catch (error) {
      console.error("Error logging flavor:", error)
      toast({
        title: "Error",
        description: "Failed to log flavor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case "shop":
        return (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for a shop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredShops.length > 0 ? (
                filteredShops.map((shop) => (
                  <div
                    key={shop.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedShop?.id === shop.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-neutral-200 hover:border-primary-200 hover:bg-neutral-50",
                    )}
                    onClick={() => setSelectedShop(shop)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={shop.image_url || `https://avatar.vercel.sh/${shop.name}.png`}
                        alt={shop.name}
                      />
                      <AvatarFallback>{shop.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">{shop.name}</h3>
                      <p className="text-xs text-muted-foreground">{shop.address}</p>
                    </div>
                    {selectedShop?.id === shop.id && (
                      <div className="h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No shops found</p>
                </div>
              )}
            </div>
          </div>
        )

      case "flavor":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="flavor-name">Flavor Name</Label>
              <Input
                id="flavor-name"
                placeholder="e.g., Vanilla Bean"
                value={flavorName}
                onChange={(e) => setFlavorName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="flavor-description">Description (Optional)</Label>
              <Textarea
                id="flavor-description"
                placeholder="Describe the flavor..."
                value={flavorDescription}
                onChange={(e) => setFlavorDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )

      case "rating":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{rating}</div>
              <div className="flex justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-8 w-8 cursor-pointer",
                      star <= rating ? "text-yellow-500 fill-yellow-500" : "text-neutral-300",
                    )}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>1</span>
                <span>5</span>
              </div>
              <Slider value={[rating]} min={1} max={5} step={1} onValueChange={(value) => setRating(value[0])} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="review">Review (Optional)</Label>
              <Textarea
                id="review"
                placeholder="Write your thoughts about this flavor..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )

      case "photo":
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview || "/placeholder.svg"}
                    alt="Flavor preview"
                    className="mx-auto max-h-[200px] rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={() => setPhotoPreview(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Camera className="h-12 w-12 mx-auto text-neutral-400 mb-2" />
                  <p className="text-muted-foreground mb-4">Take a photo of your ice cream</p>
                  <Label
                    htmlFor="photo-upload"
                    className="bg-primary-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-primary-600 transition-colors"
                  >
                    Upload Photo
                  </Label>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </>
              )}
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Adding a photo is optional but helps others see what the flavor looks like
            </p>
          </div>
        )

      case "review":
        return (
          <div className="space-y-4">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={selectedShop?.image_url || `https://avatar.vercel.sh/${selectedShop?.name}.png`}
                    alt={selectedShop?.name}
                  />
                  <AvatarFallback>{selectedShop?.name?.substring(0, 2).toUpperCase() || "S"}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedShop?.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedShop?.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <IceCream className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-medium">{flavorName}</h3>
                  {flavorDescription && <p className="text-xs text-muted-foreground">{flavorDescription}</p>}
                </div>
              </div>

              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn("h-4 w-4", star <= rating ? "text-yellow-500 fill-yellow-500" : "text-neutral-300")}
                  />
                ))}
                <span className="ml-2 text-sm font-medium">{rating}/5</span>
              </div>

              {review && (
                <div className="bg-white p-3 rounded-lg border border-neutral-200">
                  <p className="text-sm">{review}</p>
                </div>
              )}

              {photoPreview && (
                <div className="mt-4">
                  <img
                    src={photoPreview || "/placeholder.svg"}
                    alt="Flavor preview"
                    className="max-h-[150px] rounded-lg mx-auto"
                  />
                </div>
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Log a Flavor</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={step} onValueChange={(value) => setStep(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="shop" disabled={isSubmitting}>
              <MapPin className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Shop</span>
            </TabsTrigger>
            <TabsTrigger value="flavor" disabled={!selectedShop || isSubmitting}>
              <IceCream className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Flavor</span>
            </TabsTrigger>
            <TabsTrigger value="rating" disabled={!flavorName || isSubmitting}>
              <Star className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Rating</span>
            </TabsTrigger>
            <TabsTrigger value="photo" disabled={!flavorName || isSubmitting}>
              <Camera className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Photo</span>
            </TabsTrigger>
            <TabsTrigger value="review" disabled={!flavorName || isSubmitting}>
              <Check className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Review</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">{renderStepContent()}</div>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            const steps = ["shop", "flavor", "rating", "photo", "review"]
            const currentIndex = steps.indexOf(step)
            if (currentIndex > 0) {
              setStep(steps[currentIndex - 1] as any)
            }
          }}
          disabled={step === "shop" || isSubmitting}
        >
          Back
        </Button>

        {step === "review" ? (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        ) : (
          <Button
            onClick={() => {
              const steps = ["shop", "flavor", "rating", "photo", "review"]
              const currentIndex = steps.indexOf(step)
              if (currentIndex < steps.length - 1) {
                setStep(steps[currentIndex + 1] as any)
              }
            }}
            disabled={(step === "shop" && !selectedShop) || (step === "flavor" && !flavorName) || isSubmitting}
          >
            Next
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
