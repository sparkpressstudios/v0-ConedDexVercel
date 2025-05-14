"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { MapPin, X, Loader2, Camera, Upload, AlertTriangle, CheckCircle2 } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { getUserLocation, getNearbyShops, calculateDistance, getShopDetails } from "@/lib/services/location-service"
import { categorizeFlavor, checkForDuplicates, moderateContent } from "@/lib/services/ai-service"
import { flavorLogFormSchema, validateForm } from "@/lib/utils/form-validation"
import { updateLeaderboardOnFlavorLog } from "@/lib/utils/leaderboard-utils"

interface LogFlavorModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LogFlavorModal({ isOpen, onClose }: LogFlavorModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Modal state
  const [step, setStep] = useState<"location" | "shop" | "details" | "submitting">("location")

  // Location state
  const [isCheckingLocation, setIsCheckingLocation] = useState(false)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [nearbyShops, setNearbyShops] = useState<any[]>([])
  const [locationError, setLocationError] = useState<string | null>(null)
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean | null>(null)

  // Shop selection state
  const [selectedShop, setSelectedShop] = useState<string | null>(null)
  const [selectedShopDetails, setSelectedShopDetails] = useState<any | null>(null)
  const [distanceToShop, setDistanceToShop] = useState<number | null>(null)
  const [isWithinRange, setIsWithinRange] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [rating, setRating] = useState(5)
  const [notes, setNotes] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUsingCamera, setIsUsingCamera] = useState(false)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitProgress, setSubmitProgress] = useState(0)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [videoStream])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      resetState()
    }
  }, [isOpen])

  // Reset all state
  const resetState = () => {
    setStep("location")
    setIsCheckingLocation(false)
    setUserLocation(null)
    setNearbyShops([])
    setLocationError(null)
    setLocationPermissionGranted(null)
    setSelectedShop(null)
    setSelectedShopDetails(null)
    setDistanceToShop(null)
    setIsWithinRange(false)
    setName("")
    setDescription("")
    setRating(5)
    setNotes("")
    setImageFile(null)
    setImagePreview(null)
    setIsUsingCamera(false)
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop())
      setVideoStream(null)
    }
    setFormErrors({})
    setIsSubmitting(false)
    setSubmitError(null)
    setSubmitProgress(0)
  }

  // Check for location permission
  const checkLocationPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: "geolocation" as PermissionName })
      setLocationPermissionGranted(result.state === "granted" || result.state === "prompt")
      return result.state === "granted" || result.state === "prompt"
    } catch (error) {
      console.error("Error checking location permission:", error)
      // Fall back to trying geolocation directly
      return true
    }
  }

  // Check user's location and find nearby shops
  const checkLocation = async () => {
    setIsCheckingLocation(true)
    setLocationError(null)

    try {
      // First check if we have permission
      const hasPermission = await checkLocationPermission()
      if (!hasPermission) {
        setLocationError("Location permission denied. Please enable location services in your browser settings.")
        setIsCheckingLocation(false)
        return
      }

      // Get user's location
      const position = await getUserLocation()
      const { latitude, longitude } = position.coords
      setUserLocation({ latitude, longitude })

      // Find nearby shops
      const shops = await getNearbyShops(latitude, longitude, 100) // 100 meters radius to find shops

      if (shops.length === 0) {
        setLocationError("No ice cream shops found nearby. You must be within 100 feet of a shop to log a flavor.")
        setIsCheckingLocation(false)
        return
      }

      setNearbyShops(shops)
      setStep("shop")

      toast({
        title: "Location verified!",
        description: `Found ${shops.length} ice cream ${shops.length === 1 ? "shop" : "shops"} nearby.`,
      })
    } catch (error: any) {
      console.error("Error getting location:", error)
      setLocationError(
        error.message || "Unable to verify your location. Please ensure location services are enabled and try again.",
      )
    } finally {
      setIsCheckingLocation(false)
    }
  }

  // When a shop is selected, check if user is within range
  const handleShopSelect = async (shopId: string) => {
    setSelectedShop(shopId)

    if (!userLocation) {
      setLocationError("User location is not available. Please try again.")
      return
    }

    try {
      // Get shop details
      const shopDetails = await getShopDetails(shopId)
      setSelectedShopDetails(shopDetails)

      if (!shopDetails || !shopDetails.geometry || !shopDetails.geometry.location) {
        setLocationError("Shop location information is not available.")
        return
      }

      // Calculate distance to shop
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        shopDetails.geometry.location.lat,
        shopDetails.geometry.location.lng,
      )

      setDistanceToShop(distance)

      // Check if within 100 feet (approx 30.48 meters)
      const withinRange = distance <= 30.48
      setIsWithinRange(withinRange)

      if (!withinRange) {
        toast({
          title: "Too far from shop",
          description: `You are approximately ${Math.round(distance)} meters away. You need to be within 100 feet (30.48 meters) to log a flavor.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error checking shop proximity:", error)
      setLocationError("Failed to verify proximity to the selected shop.")
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
        )
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

    if (!validateFormData()) {
      return
    }

    if (!isWithinRange) {
      toast({
        title: "Cannot submit",
        description: "You must be within 100 feet of the selected shop to log a flavor.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setStep("submitting")
    setSubmitProgress(10)

    try {
      // Verify location again to prevent spoofing
      const position = await getUserLocation()
      const { latitude, longitude } = position.coords

      if (!selectedShopDetails || !selectedShopDetails.geometry || !selectedShopDetails.geometry.location) {
        throw new Error("Shop location information is not available.")
      }

      // Calculate distance to shop again
      const distance = calculateDistance(
        latitude,
        longitude,
        selectedShopDetails.geometry.location.lat,
        selectedShopDetails.geometry.location.lng,
      )

      // Check if still within 100 feet (approx 30.48 meters)
      if (distance > 30.48) {
        throw new Error(
          `You are now ${Math.round(distance)} meters away from the shop. You must be within 100 feet to log a flavor.`,
        )
      }

      setSubmitProgress(20)

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
          throw new Error(`Error uploading image: ${uploadError.message}`)
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("flavor-images").getPublicUrl(filePath)

        imageUrl = publicUrl
      }

      setSubmitProgress(40)

      // Use AI to analyze the flavor
      const categoryData = await categorizeFlavor(name, description)
      setSubmitProgress(60)

      const duplicateCheck = await checkForDuplicates(name, description)
      setSubmitProgress(70)

      const moderationResult = await moderateContent(name, description)
      setSubmitProgress(80)

      // Handle potential issues
      if (moderationResult.flagged) {
        throw new Error("Your flavor submission was rejected: Inappropriate Content")
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
        category: categoryData.mainCategory,
        duplicate: duplicateCheck.isDuplicate,
        latitude: latitude,
        longitude: longitude,
        distance_to_shop: distance,
      }

      setSubmitProgress(90)

      const { data, error: insertError } = await supabase.from("flavor_logs").insert([flavorData]).select().single()

      if (insertError) {
        throw insertError
      }

      if (user) {
        await updateLeaderboardOnFlavorLog(user.id)
      }

      setSubmitProgress(100)

      // Success! Redirect or show success message
      toast({
        title: "Flavor logged successfully!",
        description: "Your flavor has been added to your ConeDex.",
      })

      // Close modal and redirect
      onClose()
      router.push(`/dashboard/flavors/${data.id}`)
    } catch (error: any) {
      console.error("Error logging flavor:", error)
      setSubmitError(error.message || "An error occurred while logging your flavor. Please try again.")
      setStep("details") // Go back to details step

      toast({
        title: "Error Logging Flavor",
        description: error.message || "There was an error logging your flavor. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Proceed to details step
  const proceedToDetails = () => {
    if (!selectedShop) {
      toast({
        title: "Shop required",
        description: "Please select a shop before proceeding.",
        variant: "destructive",
      })
      return
    }

    setStep("details")
  }

  // Render location check step
  const renderLocationStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Log a New Flavor</DialogTitle>
        <DialogDescription>
          First, we need to verify your location. You must be within 100 feet of an ice cream shop to log a flavor.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col space-y-4 py-4">
        {locationPermissionGranted === false && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Location Permission Required</AlertTitle>
            <AlertDescription>
              You must enable location services in your browser settings to use this feature.
            </AlertDescription>
          </Alert>
        )}

        {locationError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Location Error</AlertTitle>
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center">
          <MapPin className="h-16 w-16 text-primary" />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          We'll use your device's location to verify you're at an ice cream shop. Your location data is only used for
          verification and is not stored permanently.
        </p>
      </div>

      <DialogFooter>
        <Button onClick={onClose} variant="outline">
          Cancel
        </Button>
        <Button onClick={checkLocation} disabled={isCheckingLocation}>
          {isCheckingLocation ? (
            <>
              Checking Location <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            </>
          ) : (
            "Check My Location"
          )}
        </Button>
      </DialogFooter>
    </>
  )

  // Render shop selection step
  const renderShopStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Select a Shop</DialogTitle>
        <DialogDescription>Choose the ice cream shop you're currently visiting.</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col space-y-4 py-4">
        <div className="grid w-full gap-2">
          <Label htmlFor="shop">Nearby Shops</Label>
          <Select value={selectedShop || ""} onValueChange={handleShopSelect}>
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
        </div>

        {selectedShop && (
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">{selectedShopDetails?.name}</h3>
            <p className="text-sm text-muted-foreground">
              {selectedShopDetails?.vicinity || selectedShopDetails?.formatted_address}
            </p>

            {distanceToShop !== null && (
              <div className="mt-2 flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                <span className="text-sm">{Math.round(distanceToShop)} meters away</span>
              </div>
            )}

            {distanceToShop !== null && (
              <div className="mt-2">
                {isWithinRange ? (
                  <Alert variant="success" className="bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-600">Within Range</AlertTitle>
                    <AlertDescription className="text-green-600">
                      You're within 100 feet of this shop. You can proceed to log a flavor.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Too Far</AlertTitle>
                    <AlertDescription>
                      You need to be within 100 feet (30.48 meters) of this shop to log a flavor.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button onClick={() => setStep("location")} variant="outline">
          Back
        </Button>
        <Button onClick={proceedToDetails} disabled={!selectedShop || !isWithinRange}>
          Continue
        </Button>
      </DialogFooter>
    </>
  )

  // Render flavor details form
  const renderDetailsStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Log a New Flavor</DialogTitle>
        <DialogDescription>Tell us about the flavor you're trying at {selectedShopDetails?.name}.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
            <div className="relative aspect-square w-full overflow-hidden rounded-md">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Flavor Preview"
                className="h-full w-full object-cover"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 bg-background/50 hover:bg-background/80"
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
                <div className="relative aspect-square w-full overflow-hidden rounded-md">
                  <video ref={videoRef} autoPlay className="h-full w-full object-cover"></video>
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

        {submitError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button type="button" onClick={() => setStep("shop")} variant="outline">
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                Submitting <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  )

  // Render submitting step
  const renderSubmittingStep = () => (
    <>
      <DialogHeader>
        <DialogTitle>Logging Your Flavor</DialogTitle>
        <DialogDescription>Please wait while we process your submission.</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <Progress value={submitProgress} className="w-full" />
        <p className="text-sm text-muted-foreground">
          {submitProgress < 20 && "Verifying location..."}
          {submitProgress >= 20 && submitProgress < 40 && "Uploading image..."}
          {submitProgress >= 40 && submitProgress < 60 && "Analyzing flavor..."}
          {submitProgress >= 60 && submitProgress < 80 && "Checking for duplicates..."}
          {submitProgress >= 80 && submitProgress < 100 && "Saving to your ConeDex..."}
          {submitProgress >= 100 && "Complete!"}
        </p>
      </div>
    </>
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        {step === "location" && renderLocationStep()}
        {step === "shop" && renderShopStep()}
        {step === "details" && renderDetailsStep()}
        {step === "submitting" && renderSubmittingStep()}
      </DialogContent>
    </Dialog>
  )
}
