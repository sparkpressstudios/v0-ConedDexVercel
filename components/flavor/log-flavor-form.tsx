"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Camera, Upload, X, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { getUserLocation, getNearbyShops } from "@/lib/services/location-service"
import { categorizeFlavor, checkForDuplicates, moderateContent } from "@/lib/services/ai-service"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { flavorLogFormSchema, validateForm } from "@/lib/utils/form-validation"
import { updateLeaderboardOnFlavorLog } from "@/lib/utils/leaderboard-utils"

export default function LogFlavorForm() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [rating, setRating] = useState(5)
  const [notes, setNotes] = useState("")
  const [selectedShop, setSelectedShop] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUsingCamera, setIsUsingCamera] = useState(false)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Location state
  const [isCheckingLocation, setIsCheckingLocation] = useState(false)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [nearbyShops, setNearbyShops] = useState<any[]>([])
  const [locationVerified, setLocationVerified] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<"location" | "details" | "review">("location")
  const [error, setError] = useState<string | null>(null)

  // Clean up video stream when component unmounts
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [videoStream])

  // Check for nearby shops based on user's location
  const checkLocation = async () => {
    setIsCheckingLocation(true)
    setLocationError(null)

    try {
      const position = await getUserLocation()
      const { latitude, longitude } = position.coords
      setUserLocation({ latitude, longitude })

      const shops = await getNearbyShops(latitude, longitude, 30) // 30 meters ≈ 100 feet
      setNearbyShops(shops)

      if (shops.length === 0) {
        setLocationError("No ice cream shops found nearby. You must be within 100 feet of a shop to log a flavor.")
        setLocationVerified(false)
      } else {
        setLocationVerified(true)
        toast({
          title: "Location verified!",
          description: `Found ${shops.length} ice cream ${shops.length === 1 ? "shop" : "shops"} nearby.`,
        })
        setStep("details")
      }
    } catch (error: any) {
      console.error("Error getting location:", error)
      setLocationError(
        error.message || "Unable to verify your location. Please ensure location services are enabled and try again.",
      )
      setLocationVerified(false)
    } finally {
      setIsCheckingLocation(false)
    }
  }

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        })
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        })
        return
      }

      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  // Handle camera capture
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      setVideoStream(stream)
      setIsUsingCamera(true)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error: any) {
      console.error("Error accessing camera:", error)
      toast({
        title: "Camera Error",
        description: error.message || "Unable to access your camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], "flavor-photo.jpg", { type: "image/jpeg" })
              setImageFile(file)
              setImagePreview(URL.createObjectURL(blob))
              stopCamera()
            }
          },
          "image/jpeg",
          0.8,
        ) // 0.8 quality to reduce file size
      }
    }
  }

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop())
      setVideoStream(null)
    }
    setIsUsingCamera(false)
  }

  // Validate form data
  const validateFormData = () => {
    if (!selectedShop) {
      setFormErrors({ shopId: "Please select a shop" })
      return false
    }

    const formData = {
      name,
      description,
      rating,
      notes,
      shopId: selectedShop,
    }

    const result = validateForm(flavorLogFormSchema, formData)

    if (!result.success) {
      setFormErrors(result.errors || {})
      return false
    }

    setFormErrors({})
    return true
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Get user's current location
      const location = await getUserLocation()
      if (!location) {
        setError("Unable to get your location. You must be at an ice cream shop to log a flavor.")
        setIsSubmitting(false)
        return
      }

      // Check if user is near an ice cream shop
      const nearbyShops = await getNearbyShops(location.coords.latitude, location.coords.longitude, 30)
      if (nearbyShops.length === 0) {
        setError("No ice cream shops found near your location. You must be at an ice cream shop to log a flavor.")
        setIsSubmitting(false)
        return
      }

      const formData = {
        name,
        description,
        rating,
        notes,
      }

      // Upload image if provided
      let imageUrl = null
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `flavor-photos/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("flavor-images")
          .upload(filePath, imageFile)

        if (uploadError) {
          setError(`Error uploading image: ${uploadError.message}`)
          setIsSubmitting(false)
          return
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("flavor-images").getPublicUrl(filePath)
        imageUrl = publicUrl
      }

      // Get existing flavors for duplicate checking
      const { data: existingFlavors } = await supabase.from("flavor_logs").select("name, description").limit(50)

      // Use AI to analyze the flavor
      const categoryData = await categorizeFlavor(name, description)
      const duplicateCheck = await checkForDuplicates(name, description)
      const moderationResult = await moderateContent(name, description)

      // Handle potential issues
      if (moderationResult.recommendation === "reject") {
        setError(`Your flavor submission was rejected: Inappropriate Content`)
        setIsSubmitting(false)
        return
      }

      // If it's a potential duplicate, warn the user but allow them to continue
      if (duplicateCheck.isDuplicate) {
        toast({
          title: "Possible Duplicate",
          description: "This flavor might be similar to one already logged.",
        })
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      const flavorData = {
        name,
        description,
        rating,
        notes,
        shop_id: selectedShop,
        image_url: imageUrl,
        category: categoryData.category,
        duplicate: duplicateCheck.isDuplicate,
      }

      const { data, error: insertError } = await supabase.from("flavor_logs").insert([flavorData]).select().single()

      if (insertError) {
        throw insertError
      }

      if (user) {
        await updateLeaderboardOnFlavorLog(user.id)
      }

      // Success! Redirect or show success message
      toast({
        title: "Flavor logged successfully!",
        description: "Your flavor has been added to your ConeDex.",
      })

      router.push(`/flavors/${data.id}`)
    } catch (error: any) {
      console.error("Error logging flavor:", error)
      setError(error.message || "An error occurred while logging your flavor. Please try again.")
      toast({
        title: "Error Logging Flavor",
        description: error.message || "There was an error logging your flavor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ErrorBoundary fallback={<p>Something went wrong.</p>}>
      <Card className="w-[500px] max-w-[calc(100vw-2rem)]">
        <CardHeader>
          <CardTitle>Log a New Flavor</CardTitle>
        </CardHeader>
        <CardContent>
          {step === "location" && (
            <div className="flex flex-col space-y-4">
              <p>To log a flavor, you must be within 100 feet of an ice cream shop.</p>
              {locationError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{locationError}</AlertDescription>
                </Alert>
              )}
              <Button onClick={checkLocation} disabled={isCheckingLocation}>
                {isCheckingLocation ? (
                  <>
                    Checking Location <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Check Location"
                )}
              </Button>
            </div>
          )}

          {step === "details" && (
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <div className="grid w-full gap-2">
                <Label htmlFor="shop">Shop</Label>
                <Select value={selectedShop || ""} onValueChange={(value) => setSelectedShop(value)}>
                  <SelectTrigger id="shop">
                    <SelectValue placeholder="Select a shop" />
                  </SelectTrigger>
                  <SelectContent>
                    {nearbyShops.map((shop: any) => (
                      <SelectItem key={shop.place_id} value={shop.place_id}>
                        {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.shopId && <p className="text-sm text-red-500">{formErrors.shopId}</p>}
              </div>
              <div className="grid w-full gap-2">
                <Label htmlFor="name">Flavor Name</Label>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chocolate Fudge Brownie"
                />
                {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
              </div>
              <div className="grid w-full gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the flavor"
                />
                {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
              </div>
              <div className="grid w-full gap-2">
                <Label htmlFor="rating">Rating</Label>
                <Slider
                  id="rating"
                  defaultValue={[rating]}
                  max={10}
                  min={1}
                  step={1}
                  onValueChange={(value) => setRating(value[0])}
                />
                <p className="text-sm text-muted-foreground">Rating: {rating}</p>
              </div>
              <div className="grid w-full gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes?"
                />
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="image">Image</Label>
                {imagePreview ? (
                  <div className="relative w-full aspect-square rounded-md overflow-hidden">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Flavor Preview"
                      className="object-cover w-full h-full"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-background/50 hover:bg-background/80"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove image</span>
                    </Button>
                  </div>
                ) : (
                  <>
                    {isUsingCamera ? (
                      <div className="relative w-full aspect-square rounded-md overflow-hidden">
                        <video ref={videoRef} autoPlay className="object-cover w-full h-full"></video>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
                          <Button variant="secondary" size="sm" onClick={capturePhoto}>
                            Capture
                          </Button>
                          <Button variant="ghost" size="sm" onClick={stopCamera}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </Button>
                        <Button variant="outline" size="sm" onClick={startCamera}>
                          <Camera className="mr-2 h-4 w-4" />
                          Take Photo
                        </Button>
                      </div>
                    )}
                    <Input
                      type="file"
                      id="image"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    Submitting <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  )
}
