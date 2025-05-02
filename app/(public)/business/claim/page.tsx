import Link from "next/link"
import { ArrowRight, Search, Store, Upload, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BusinessClaimPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">Claim Your Ice Cream Shop</h1>
          <p className="text-lg text-gray-600">
            Take control of your shop's presence on ConeDex and connect with ice cream enthusiasts
          </p>
        </div>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Search for your shop</TabsTrigger>
            <TabsTrigger value="create">Add a new shop</TabsTrigger>
          </TabsList>
          <TabsContent value="search" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Find your shop</CardTitle>
                <CardDescription>
                  Search for your ice cream shop by name or address to claim your business listing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="flex-1">
                      <Input placeholder="Shop name" className="w-full" />
                    </div>
                    <div className="flex-1">
                      <Input placeholder="City or ZIP code" className="w-full" />
                    </div>
                  </div>
                  <Button className="w-full sm:w-auto bg-mint-600 hover:bg-mint-700">
                    <Search className="mr-2 h-4 w-4" /> Search
                  </Button>
                </div>

                <div className="mt-8">
                  <h3 className="mb-4 text-lg font-medium">Search Results</h3>
                  <div className="space-y-4">
                    <ShopResultCard name="Sweet Dreams Ice Cream" address="123 Main St, Anytown, USA" claimed={false} />
                    <ShopResultCard name="Frosty Delights" address="456 Oak Ave, Somewhere, USA" claimed={true} />
                    <ShopResultCard name="Scoop Haven" address="789 Pine Rd, Elsewhere, USA" claimed={false} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="create" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Add your shop</CardTitle>
                <CardDescription>
                  Can't find your shop? Add it to ConeDex and claim ownership in one step
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="shop-name" className="mb-2 block text-sm font-medium">
                      Shop Name
                    </label>
                    <Input id="shop-name" placeholder="Your ice cream shop's name" />
                  </div>
                  <div>
                    <label htmlFor="shop-address" className="mb-2 block text-sm font-medium">
                      Street Address
                    </label>
                    <Input id="shop-address" placeholder="123 Main St" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="shop-city" className="mb-2 block text-sm font-medium">
                        City
                      </label>
                      <Input id="shop-city" placeholder="City" />
                    </div>
                    <div>
                      <label htmlFor="shop-zip" className="mb-2 block text-sm font-medium">
                        ZIP Code
                      </label>
                      <Input id="shop-zip" placeholder="ZIP Code" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="shop-phone" className="mb-2 block text-sm font-medium">
                      Phone Number
                    </label>
                    <Input id="shop-phone" placeholder="(555) 123-4567" />
                  </div>
                  <div>
                    <label htmlFor="shop-website" className="mb-2 block text-sm font-medium">
                      Website (Optional)
                    </label>
                    <Input id="shop-website" placeholder="https://yourshop.com" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Shop Logo (Optional)</label>
                    <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md bg-white font-medium text-blueberry-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blueberry-500 focus-within:ring-offset-2 hover:text-blueberry-500"
                          >
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-mint-600 hover:bg-mint-700">Add and Claim Shop</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-12 rounded-lg bg-gray-50 p-6">
          <h2 className="mb-4 text-xl font-semibold">How Verification Works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <VerificationStep
              icon={<Search className="h-10 w-10 text-blueberry-600" />}
              title="1. Find or Add Your Shop"
              description="Search for your shop in our database or add it if it's not listed yet."
            />
            <VerificationStep
              icon={<Store className="h-10 w-10 text-mint-600" />}
              title="2. Submit Verification"
              description="Provide documentation that proves you're the owner or authorized manager."
            />
            <VerificationStep
              icon={<CheckCircle className="h-10 w-10 text-strawberry-600" />}
              title="3. Get Verified"
              description="Once approved, you'll have full access to manage your shop's profile."
            />
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="mb-4 text-gray-600">Already have a ConeDex account?</p>
          <Button asChild variant="outline">
            <Link href="/login">
              Log in to claim your shop <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function ShopResultCard({ name, address, claimed }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium">{name}</h4>
          <p className="text-sm text-gray-600">{address}</p>
        </div>
        {claimed ? (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">Already Claimed</span>
        ) : (
          <Button size="sm" className="bg-mint-600 hover:bg-mint-700">
            Claim
          </Button>
        )}
      </div>
    </div>
  )
}

function VerificationStep({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 font-medium">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
