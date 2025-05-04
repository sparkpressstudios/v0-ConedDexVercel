import type { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export const metadata: Metadata = {
  title: "ConeDex API - For Business Partners",
  description: "Access the ConeDex API to integrate ice cream data into your applications and services.",
}

export default function BusinessApiPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">ConeDex API</h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Integrate ice cream data into your applications and services with our comprehensive API.
        </p>
      </div>

      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <h2 className="mb-6 text-2xl font-bold">Why Use Our API?</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <svg
                className="mr-3 mt-1 h-5 w-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>
                <strong className="font-medium">Comprehensive Data:</strong> Access information on thousands of ice
                cream shops and flavors worldwide.
              </span>
            </li>
            <li className="flex items-start">
              <svg
                className="mr-3 mt-1 h-5 w-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>
                <strong className="font-medium">Real-time Updates:</strong> Get the latest information on new shops,
                flavors, and user ratings.
              </span>
            </li>
            <li className="flex items-start">
              <svg
                className="mr-3 mt-1 h-5 w-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>
                <strong className="font-medium">Flexible Integration:</strong> RESTful API with JSON responses for easy
                integration with any platform.
              </span>
            </li>
            <li className="flex items-start">
              <svg
                className="mr-3 mt-1 h-5 w-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>
                <strong className="font-medium">Robust Documentation:</strong> Detailed guides and examples to get you
                started quickly.
              </span>
            </li>
          </ul>

          <div className="mt-8">
            <h2 className="mb-6 text-2xl font-bold">Use Cases</h2>
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-2 font-semibold">Food Delivery Apps</h3>
                <p className="text-gray-600">
                  Integrate ice cream shop data to expand your delivery options and provide detailed flavor information.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-2 font-semibold">Travel & Tourism Applications</h3>
                <p className="text-gray-600">
                  Enhance your travel guides with local ice cream recommendations and popular flavors by region.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-2 font-semibold">Food Blogs & Recipe Sites</h3>
                <p className="text-gray-600">
                  Pull flavor trends and popularity data to inform content creation and recipe development.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>Explore our endpoints and get started with integration</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="endpoints">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                  <TabsTrigger value="authentication">Authentication</TabsTrigger>
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                </TabsList>
                <div className="mt-6 rounded-md border p-4">
                  <TabsContent value="endpoints">
                    <h3 className="mb-4 font-semibold">Available Endpoints</h3>
                    <div className="space-y-3">
                      <div>
                        <code className="rounded bg-gray-100 px-2 py-1 text-sm">/api/v1/shops</code>
                        <p className="mt-1 text-sm text-gray-600">
                          Get a list of ice cream shops with filtering options
                        </p>
                      </div>
                      <div>
                        <code className="rounded bg-gray-100 px-2 py-1 text-sm">/api/v1/shops/{"{id}"}</code>
                        <p className="mt-1 text-sm text-gray-600">Get detailed information about a specific shop</p>
                      </div>
                      <div>
                        <code className="rounded bg-gray-100 px-2 py-1 text-sm">/api/v1/flavors</code>
                        <p className="mt-1 text-sm text-gray-600">
                          Get a list of ice cream flavors with filtering options
                        </p>
                      </div>
                      <div>
                        <code className="rounded bg-gray-100 px-2 py-1 text-sm">/api/v1/flavors/{"{id}"}</code>
                        <p className="mt-1 text-sm text-gray-600">Get detailed information about a specific flavor</p>
                      </div>
                      <div>
                        <code className="rounded bg-gray-100 px-2 py-1 text-sm">/api/v1/search</code>
                        <p className="mt-1 text-sm text-gray-600">Search across shops and flavors</p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="authentication">
                    <h3 className="mb-4 font-semibold">API Authentication</h3>
                    <p className="mb-4">
                      All API requests require an API key that should be included in the header of each request:
                    </p>
                    <pre className="mb-4 overflow-x-auto rounded bg-gray-100 p-3 text-sm">
                      <code>{`Authorization: Bearer YOUR_API_KEY`}</code>
                    </pre>
                    <p>
                      To obtain an API key, please{" "}
                      <Link href="/contact" className="text-pink-600 hover:underline">
                        contact our team
                      </Link>{" "}
                      or sign up for a{" "}
                      <Link href="/business/pricing" className="text-pink-600 hover:underline">
                        business account
                      </Link>
                      .
                    </p>
                  </TabsContent>
                  <TabsContent value="examples">
                    <h3 className="mb-4 font-semibold">Example Request</h3>
                    <pre className="mb-4 overflow-x-auto rounded bg-gray-100 p-3 text-sm">
                      <code>
                        {`curl -X GET "https://api.conedex.com/v1/shops?location=chicago&radius=5" \\
-H "Authorization: Bearer YOUR_API_KEY"`}
                      </code>
                    </pre>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
