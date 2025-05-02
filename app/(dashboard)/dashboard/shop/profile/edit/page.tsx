"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, Upload, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function EditShopProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const { toast } = useToast()

  const [shop, setShop] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("")
  const [email, setEmail] = useState("")
  const [foundedYear, setFoundedYear] = useState<number | "">("")
  const [specialties, setSpecialties] = useState("")
  const [tags, setTags] = useState("")

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  const [facebook, setFacebook] = useState("")
  const [instagram, setInstagram] = useState("")
  const [twitter, setTwitter] = useState("")
  const [tiktok, setTiktok] = useState("")

  useEffect(() => {
    const fetchShopData = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Get user's shop
        const { data, error } = await supabase.from("shops").select("*").eq("owner_id", user.id).single()

        if (error) {
          if (error.code === "PGRST116") {
            // No shop found
            router.push("/dashboard/shop/claim")
            return
          }
          throw error
        }

        setShop(data)

        // Set form values
        setName(data.name || "")
        setDescription(data.description || "")
        setShortDescription(data.short_description || "")
        setAddress(data.address || "")
        setCity(data.city || "")
        setState(data.state || "")
        setZipCode(data.zip_code || "")
        setPhone(data.phone || "")
        setWebsite(data.website || "")
        setEmail(data.email || "")
        setFoundedYear(data.founded_year || "")
        setSpecialties(data.specialties ? data.specialties.join(", ") : "")
        setTags(data.tags ? data.tags.join(", ") : "")

        // Set social links
        if (data.social_links) {
          setFacebook(data.social_links.facebook || "")
          setInstagram(data.social_links.instagram || "")
          setTwitter(data.social_links.twitter || "")
          setTiktok(data.social_links.tiktok || "")
        }

        // Set image previews
        if (data.logo_url) {
          setLogoPreview(data.logo_url)
        }
        if (data.banner_image_url) {
          setBannerPreview(data.banner_image_url)
        }
      } catch (error) {
        console.error("Error fetching shop data:", error)
        toast({
          title: "Error",
          description: "Failed to load shop data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchShopData()
  }, [user, supabase, router, toast])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setBannerFile(file)
      setBannerPreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
  }

  const handleRemoveBanner = () => {
    setBannerFile(null)
    setBannerPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!shop) return

    try {
      setSaving(true)

      let logoUrl = shop.logo_url
      let bannerUrl = shop.banner_image_url

      // Upload logo if changed
      if (logoFile) {
        const fileExt = logoFile.name.split(".").pop()
        const fileName = `${shop.id}-logo-${Date.now()}.${fileExt}`
        const filePath = `shop_images/${fileName}`

        const { error: uploadError } = await supabase.storage.from("shops").upload(filePath, logoFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from("shops").getPublicUrl(filePath)

        logoUrl = urlData.publicUrl
      }

      // Upload banner if changed
      if (bannerFile) {
        const fileExt = bannerFile.name.split(".").pop()
        const fileName = `${shop.id}-banner-${Date.now()}.${fileExt}`
        const filePath = `shop_images/${fileName}`

        const { error: uploadError } = await supabase.storage.from("shops").upload(filePath, bannerFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from("shops").getPublicUrl(filePath)

        bannerUrl = urlData.publicUrl
      }

      // Remove logo if deleted
      if (logoPreview === null && shop.logo_url) {
        logoUrl = null
      }

      // Remove banner if deleted
      if (bannerPreview === null && shop.banner_image_url) {
        bannerUrl = null
      }

      // Prepare social links
      const socialLinks = {
        facebook: facebook || null,
        instagram: instagram || null,
        twitter: twitter || null,
        tiktok: tiktok || null,
      }

      // Prepare specialties and tags arrays
      const specialtiesArray = specialties
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0)

      const tagsArray = tags
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0)

      // Update shop data
      const { error } = await supabase
        .from("shops")
        .update({
          name,
          description,
          short_description: shortDescription,
          address,
          city,
          state,
          zip_code: zipCode,
          phone,
          website,
          email,
          founded_year: foundedYear || null,
          specialties: specialtiesArray,
          tags: tagsArray,
          logo_url: logoUrl,
          banner_image_url: bannerUrl,
          social_links: socialLinks,
          updated_at: new Date().toISOString(),
        })
        .eq("id", shop.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your shop profile has been updated successfully",
      })

      router.push("/dashboard/shop/profile")
    } catch (error) {
      console.error("Error updating shop profile:", error)
      toast({
        title: "Error",
        description: "Failed to update shop profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/dashboard/shop/profile">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Shop Profile</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your shop's basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Shop Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="founded-year">Founded Year</Label>
                  <Input
                    id="founded-year"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={foundedYear}
                    onChange={(e) => setFoundedYear(e.target.value ? Number.parseInt(e.target.value) : "")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short-description">Short Description</Label>
                <Input
                  id="short-description"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  maxLength={255}
                  placeholder="A brief tagline for your shop (max 255 characters)"
                />
                <p className="text-xs text-muted-foreground text-right">{shortDescription.length}/255</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Tell customers about your shop, history, and what makes your ice cream special"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialties">Specialties</Label>
                <Input
                  id="specialties"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  placeholder="Comma-separated list of specialties (e.g. Gelato, Dairy-free, Organic)"
                />
                <p className="text-xs text-muted-foreground">Separate each specialty with a comma</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Comma-separated list of tags (e.g. family-owned, vegan-options, artisanal)"
                />
                <p className="text-xs text-muted-foreground">Separate each tag with a comma</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Update your shop's contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip-code">ZIP Code</Label>
                  <Input id="zip-code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Connect your shop's social media accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/yourshop"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/yourshop"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://twitter.com/yourshop"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    placeholder="https://tiktok.com/@yourshop"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shop Images</CardTitle>
              <CardDescription>Upload your shop logo and banner image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-2 block">Logo</Label>
                <div className="flex items-start gap-4">
                  <div className="relative h-24 w-24 overflow-hidden rounded-md border">
                    {logoPreview ? (
                      <img
                        src={logoPreview || "/placeholder.svg"}
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <p className="text-xs text-muted-foreground">No logo</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="logo-upload"
                      className="cursor-pointer inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </Label>
                    {logoPreview && (
                      <Button type="button" variant="outline" size="sm" onClick={handleRemoveLogo}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground">Recommended: Square image, 500x500px</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="mb-2 block">Banner Image</Label>
                <div className="space-y-4">
                  <div className="relative aspect-[3/1] w-full overflow-hidden rounded-md border">
                    {bannerPreview ? (
                      <img
                        src={bannerPreview || "/placeholder.svg"}
                        alt="Banner preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <p className="text-muted-foreground">No banner image</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Label
                      htmlFor="banner-upload"
                      className="cursor-pointer inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Banner
                      <input
                        id="banner-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBannerChange}
                      />
                    </Label>
                    {bannerPreview && (
                      <Button type="button" variant="outline" size="sm" onClick={handleRemoveBanner}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Recommended: 1200x400px, landscape orientation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/shop/profile")}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
