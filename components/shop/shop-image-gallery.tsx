"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ImageIcon, X } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ShopImageGalleryProps {
  mainImage?: string | null
  additionalImages?: string[] | null
  shopName: string
  className?: string
}

export function ShopImageGallery({ mainImage, additionalImages = [], shopName, className }: ShopImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Combine main image with additional images
  const allImages = [...(mainImage ? [mainImage] : []), ...(additionalImages?.filter(Boolean) || [])]

  // If no images, show placeholder
  if (allImages.length === 0) {
    return (
      <div className={cn("relative flex items-center justify-center bg-muted rounded-md overflow-hidden", className)}>
        <ImageIcon className="h-12 w-12 text-muted-foreground" />
        <span className="text-sm text-muted-foreground mt-2">No images available</span>
      </div>
    )
  }

  // Navigate to previous image
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  // Navigate to next image
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className={cn("relative rounded-md overflow-hidden", className)}>
      {/* Main gallery view */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <div className="relative cursor-pointer group">
            <img
              src={allImages[0] || "/placeholder.svg"}
              alt={`${shopName} main image`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/colorful-ice-cream-shop.png"
              }}
            />
            {allImages.length > 1 && (
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-medium">View {allImages.length} Photos</span>
              </div>
            )}
          </div>
        </DialogTrigger>

        {/* Fullscreen gallery dialog */}
        <DialogContent className="max-w-4xl w-full p-0 bg-black/95 border-none">
          <div className="relative h-[80vh] flex flex-col">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
              onClick={() => setIsDialogOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Main image container */}
            <div className="flex-1 flex items-center justify-center p-4">
              <img
                src={allImages[currentImageIndex] || "/placeholder.svg"}
                alt={`${shopName} image ${currentImageIndex + 1}`}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/colorful-ice-cream-shop.png"
                }}
              />
            </div>

            {/* Navigation buttons */}
            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="h-20 bg-black/80 flex items-center gap-2 p-2 overflow-x-auto">
                {allImages.map((image, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-16 w-16 flex-shrink-0 rounded overflow-hidden border-2",
                      currentImageIndex === index ? "border-white" : "border-transparent",
                    )}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${shopName} thumbnail ${index + 1}`}
                      className="h-full w-full object-cover cursor-pointer"
                      onError={(e) => {
                        e.currentTarget.src = "/colorful-ice-cream-cones.png"
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
