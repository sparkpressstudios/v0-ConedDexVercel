import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createServerClient } from "@/lib/supabase/server"
import { formatDistanceToNow } from "date-fns"
import { Check, X, Clock, Building, User } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function VerificationPage() {
  const supabase = await createServerClient()

  // Fetch pending shop verifications
  const { data: shopVerifications, error: shopError } = await supabase
    .from("shop_verification_requests")
    .select(`
      *,
      shop:shop_id(id, name, address, city, state),
      user:user_id(id, full_name, email)
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  // Fetch pending user verifications
  const { data: userVerifications, error: userError } = await supabase
    .from("user_verification_requests")
    .select(`
      *,
      user:user_id(id, full_name, email)
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  // Handle errors
  if (shopError || userError) {
    console.error("Error fetching verification data:", { shopError, userError })
  }

  // Mock data if no real data is available
  const mockShopVerifications = [
    {
      id: "ver_1",
      status: "pending",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      shop: {
        id: "shop_1",
        name: "Creamy Delights",
        address: "123 Main St",
        city: "New York",
        state: "NY",
      },
      user: {
        id: "user_1",
        full_name: "John Smith",
        email: "john@example.com",
      },
      verification_type: "ownership",
      verification_documents: ["business_license.pdf", "id_card.jpg"],
      notes: "Owner claims to have purchased the shop 3 months ago",
    },
    {
      id: "ver_2",
      status: "pending",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      shop: {
        id: "shop_2",
        name: "Frosty Scoops",
        address: "456 Elm St",
        city: "Chicago",
        state: "IL",
      },
      user: {
        id: "user_2",
        full_name: "Sarah Johnson",
        email: "sarah@frostyscoops.com",
      },
      verification_type: "ownership",
      verification_documents: ["business_registration.pdf"],
      notes: "Family-owned business for 15 years",
    },
  ]

  const mockUserVerifications = [
    {
      id: "uver_1",
      status: "pending",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      user: {
        id: "user_3",
        full_name: "Michael Chen",
        email: "michael@example.com",
      },
      verification_type: "identity",
      verification_documents: ["id_card.jpg"],
      notes: "Professional ice cream reviewer",
    },
    {
      id: "uver_2",
      status: "pending",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      user: {
        id: "user_4",
        full_name: "Emma Wilson",
        email: "emma@example.com",
      },
      verification_type: "professional",
      verification_documents: ["certification.pdf", "business_card.jpg"],
      notes: "Ice cream chef with 10 years experience",
    },
  ]

  // Use real data if available, otherwise use mock data
  const shopData = shopVerifications?.length ? shopVerifications : mockShopVerifications
  const userData = userVerifications?.length ? userVerifications : mockUserVerifications

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Verification Requests</h1>
        <p className="text-muted-foreground">Manage verification requests for shops and users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-amber-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shopData.length + userData.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-4 w-4 text-blue-500" />
              Shop Verifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shopData.length}</div>
            <p className="text-xs text-muted-foreground">Ownership claims</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <User className="mr-2 h-4 w-4 text-purple-500" />
              User Verifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.length}</div>
            <p className="text-xs text-muted-foreground">Identity & professional</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="shops">
        <TabsList>
          <TabsTrigger value="shops">Shop Verifications</TabsTrigger>
          <TabsTrigger value="users">User Verifications</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="shops" className="mt-6 space-y-6">
          {shopData.map((verification) => (
            <VerificationCard
              key={verification.id}
              id={verification.id}
              title={verification.shop.name}
              subtitle={`${verification.shop.address}, ${verification.shop.city}, ${verification.shop.state}`}
              requester={verification.user.full_name}
              requesterEmail={verification.user.email}
              type={verification.verification_type}
              documents={verification.verification_documents}
              notes={verification.notes}
              createdAt={verification.created_at}
              status={verification.status}
            />
          ))}
        </TabsContent>

        <TabsContent value="users" className="mt-6 space-y-6">
          {userData.map((verification) => (
            <VerificationCard
              key={verification.id}
              id={verification.id}
              title={verification.user.full_name}
              subtitle={verification.user.email}
              requester={verification.user.full_name}
              requesterEmail={verification.user.email}
              type={verification.verification_type}
              documents={verification.verification_documents}
              notes={verification.notes}
              createdAt={verification.created_at}
              status={verification.status}
            />
          ))}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Check className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium">No recently approved verifications</h3>
                <p className="text-sm text-muted-foreground mt-2">Approved verifications will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <X className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium">No recently rejected verifications</h3>
                <p className="text-sm text-muted-foreground mt-2">Rejected verifications will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface VerificationCardProps {
  id: string
  title: string
  subtitle: string
  requester: string
  requesterEmail: string
  type: string
  documents: string[]
  notes?: string
  createdAt: string
  status: string
}

function VerificationCard({
  id,
  title,
  subtitle,
  requester,
  requesterEmail,
  type,
  documents,
  notes,
  createdAt,
  status,
}: VerificationCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </div>
          <Badge variant={status === "pending" ? "outline" : status === "approved" ? "default" : "destructive"}>
            {status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Request Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requester:</span>
                <span>{requester}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{requesterEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="capitalize">{type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted:</span>
                <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Verification Documents</h3>
            <div className="space-y-2">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{doc}</span>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>

            {notes && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Notes</h3>
                <p className="text-sm">{notes}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <div className="flex justify-end gap-2 p-6 pt-0">
        <Button variant="outline">Request More Info</Button>
        <Button variant="destructive">Reject</Button>
        <Button>Approve</Button>
      </div>
    </Card>
  )
}
