import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export const dynamic = "force-dynamic"

export default async function ModerationPage() {
  try {
    const supabase = createClient()

    // Fetch pending flavors that need manual review
    const { data: pendingFlavors, error: pendingError } = await supabase
      .from("flavors")
      .select(`
        *,
        shops:shop_id(name, id),
        users:user_id(full_name, email, id)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    // Fetch flavors that need more info
    const { data: infoRequestedFlavors, error: infoError } = await supabase
      .from("flavors")
      .select(`
        *,
        shops:shop_id(name, id),
        users:user_id(full_name, email, id)
      `)
      .eq("status", "info_requested")
      .order("created_at", { ascending: false })

    // Fetch recently auto-approved flavors
    const { data: autoApprovedFlavors, error: autoError } = await supabase
      .from("flavors")
      .select(`
        *,
        shops:shop_id(name, id),
        users:user_id(full_name, email, id)
      `)
      .eq("status", "approved")
      .ilike("moderation_notes", "%Auto-approved%")
      .order("moderated_at", { ascending: false })
      .limit(10)

    // Fetch recently manually moderated flavors
    const { data: manuallyModeratedFlavors, error: manualError } = await supabase
      .from("flavors")
      .select(`
        *,
        shops:shop_id(name, id),
        users:user_id(full_name, email, id)
      `)
      .in("status", ["approved", "rejected"])
      .not("moderation_notes", "ilike", "%Auto-approved%")
      .order("moderated_at", { ascending: false })
      .limit(10)

    // Fetch content reports
    const { data: contentReports, error: reportsError } = await supabase
      .from("content_reports")
      .select(`
        *,
        reporter:reporter_id(full_name, email),
        flavor:flavor_id(name, description, image_url, status)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (pendingError || infoError || autoError || manualError || reportsError) {
      console.error("Error fetching moderation data:", {
        pendingError,
        infoError,
        autoError,
        manualError,
        reportsError,
      })
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

    // Use real data if available, otherwise use mock data
    const shopData = mockShopVerifications
    const userData = []

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Content Moderation</h1>
          <p className="text-muted-foreground">
            Only content flagged by AI requires manual review. Safe content is auto-approved.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                <span>Needs Review</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingFlavors?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Flagged by AI for manual review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                <span>Info Requested</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{infoRequestedFlavors?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Awaiting additional information</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                <span>Auto-Approved</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{autoApprovedFlavors?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Recently approved by AI</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-purple-500" />
                <span>Content Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{contentReports?.length || 0}</div>
              <p className="text-sm text-muted-foreground">User-reported content</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pending">
              Needs Review
              {pendingFlavors?.length ? (
                <Badge variant="secondary" className="ml-2">
                  {pendingFlavors.length}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="info_requested">
              Info Requested
              {infoRequestedFlavors?.length ? (
                <Badge variant="secondary" className="ml-2">
                  {infoRequestedFlavors.length}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="auto_approved">Auto-Approved</TabsTrigger>
            <TabsTrigger value="manually_reviewed">Manually Reviewed</TabsTrigger>
            <TabsTrigger value="reports">
              Reports
              {contentReports?.length ? (
                <Badge variant="secondary" className="ml-2">
                  {contentReports.length}
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6 mt-6">
            {pendingFlavors?.length ? (
              pendingFlavors.map((flavor) => <FlavorModerationCard key={flavor.id} flavor={flavor} />)
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No content needs review. AI is handling everything!
              </div>
            )}
          </TabsContent>

          <TabsContent value="info_requested" className="space-y-6 mt-6">
            {infoRequestedFlavors?.length ? (
              infoRequestedFlavors.map((flavor) => <FlavorModerationCard key={flavor.id} flavor={flavor} />)
            ) : (
              <div className="text-center py-12 text-muted-foreground">No flavors with requested information</div>
            )}
          </TabsContent>

          <TabsContent value="auto_approved" className="space-y-6 mt-6">
            {autoApprovedFlavors?.length ? (
              autoApprovedFlavors.map((flavor) => <FlavorModerationCard key={flavor.id} flavor={flavor} readOnly />)
            ) : (
              <div className="text-center py-12 text-muted-foreground">No auto-approved flavors yet</div>
            )}
          </TabsContent>

          <TabsContent value="manually_reviewed" className="space-y-6 mt-6">
            {manuallyModeratedFlavors?.length ? (
              manuallyModeratedFlavors.map((flavor) => (
                <FlavorModerationCard key={flavor.id} flavor={flavor} readOnly />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">No manually reviewed flavors yet</div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6 mt-6">
            {contentReports?.length ? (
              contentReports.map((report) => <ReportCard key={report.id} report={report} />)
            ) : (
              <div className="text-center py-12 text-muted-foreground">No content reports to review</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    console.error("Error in moderation page:", error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Moderation Page</h2>
        <p className="text-red-700">There was an error loading the moderation data. Please try again later.</p>
      </div>
    )
  }
}

function FlavorModerationCard({ flavor, readOnly = false }) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    info_requested: "bg-blue-100 text-blue-800",
  }

  // Extract AI flags for display
  const aiFlags = flavor.ai_moderation_flags || []
  const hasDuplicateFlag = flavor.ai_duplicate_score > 0.8
  const hasContentFlags = aiFlags.length > 0

  // Format the AI rarity for display
  const rarityColors = {
    Common: "bg-gray-100 text-gray-800",
    Uncommon: "bg-green-100 text-green-800",
    Rare: "bg-blue-100 text-blue-800",
    "Ultra Rare": "bg-purple-100 text-purple-800",
    Legendary: "bg-amber-100 text-amber-800",
  }

  // Format dates
  const createdAt = flavor.created_at
    ? formatDistanceToNow(new Date(flavor.created_at), { addSuffix: true })
    : "Unknown"
  const moderatedAt = flavor.moderated_at
    ? formatDistanceToNow(new Date(flavor.moderated_at), { addSuffix: true })
    : null

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              {flavor.name}
              {flavor.ai_rarity && (
                <Badge className={`ml-2 ${rarityColors[flavor.ai_rarity] || "bg-gray-100"}`}>{flavor.ai_rarity}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Submitted by {flavor.users?.full_name || "Unknown"}
              {flavor.shops ? ` for ${flavor.shops.name}` : ""}
              {" • "}
              {createdAt}
            </CardDescription>
          </div>
          <Badge className={statusColors[flavor.status] || "bg-gray-100"}>
            {flavor.status?.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm">{flavor.description || "No description provided"}</p>

            {flavor.ingredients && flavor.ingredients.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Ingredients</h3>
                <div className="flex flex-wrap gap-1">
                  {flavor.ingredients.map((ingredient, i) => (
                    <Badge key={i} variant="outline">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {flavor.image_url && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Image</h3>
                <img
                  src={flavor.image_url || "/placeholder.svg"}
                  alt={flavor.name}
                  className="rounded-md max-h-48 object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">AI Analysis</h3>

            {/* AI Categories */}
            {flavor.ai_categories && flavor.ai_categories.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Categories</h4>
                <div className="flex flex-wrap gap-1">
                  {flavor.ai_categories.map((category, i) => (
                    <Badge key={i} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Flagged Issues */}
            {hasContentFlags && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <h4 className="text-sm font-medium text-red-800 mb-1">Content Issues</h4>
                <ul className="list-disc list-inside text-sm text-red-700">
                  {aiFlags.map((flag, i) => (
                    <li key={i}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Duplicate Warning */}
            {hasDuplicateFlag && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <h4 className="text-sm font-medium text-amber-800 mb-1">Potential Duplicate</h4>
                <p className="text-sm text-amber-700">Similar to: {flavor.ai_similar_flavors?.[0] || "Unknown"}</p>
                <p className="text-sm text-amber-700">
                  Confidence: {Math.round((flavor.ai_duplicate_score || 0) * 100)}%
                </p>
              </div>
            )}

            {/* Moderation Notes */}
            {flavor.moderation_notes && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <h4 className="text-sm font-medium mb-1">Moderation Notes</h4>
                <p className="text-sm whitespace-pre-line">{flavor.moderation_notes}</p>
                {moderatedAt && <p className="text-xs text-muted-foreground mt-2">Moderated {moderatedAt}</p>}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {!readOnly && (
        <CardFooter className="flex justify-between bg-muted/50 gap-2">
          <form className="flex-1">
            <Button type="submit" className="w-full" variant="default">
              Approve
            </Button>
          </form>

          <form className="flex-1">
            <Button type="submit" className="w-full" variant="outline">
              Request Info
            </Button>
          </form>

          <form className="flex-1">
            <Button type="submit" className="w-full" variant="destructive">
              Reject
            </Button>
          </form>
        </CardFooter>
      )}
    </Card>
  )
}

function ReportCard({ report }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              Report #{report.id.substring(0, 8)}
              <Badge className="ml-2 bg-red-100 text-red-800">{report.report_type || "Content Report"}</Badge>
            </CardTitle>
            <CardDescription>
              Reported by {report.reporter?.full_name || "Anonymous"}
              {" • "}
              {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
            </CardDescription>
          </div>
          <Badge className="bg-yellow-100 text-yellow-800">{report.status?.toUpperCase() || "PENDING"}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Report Reason</h3>
            <p className="text-sm">{report.reason || "No reason provided"}</p>

            <div className="mt-4">
              <h3 className="font-medium mb-2">Additional Comments</h3>
              <p className="text-sm">{report.comments || "No additional comments"}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Reported Content</h3>

            {report.flavor && (
              <div className="p-4 border rounded-md">
                <h4 className="font-medium">{report.flavor.name}</h4>
                <p className="text-sm mt-1">{report.flavor.description}</p>

                {report.flavor.image_url && (
                  <div className="mt-2">
                    <img
                      src={report.flavor.image_url || "/placeholder.svg"}
                      alt={report.flavor.name}
                      className="h-32 w-auto object-cover rounded-md"
                    />
                  </div>
                )}

                <div className="mt-2">
                  <Badge
                    className={
                      report.flavor.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : report.flavor.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {report.flavor.status?.toUpperCase() || "PENDING"}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between bg-muted/50 gap-2">
        <Button className="flex-1" variant="default">
          Dismiss Report
        </Button>

        <Button className="flex-1" variant="outline">
          Contact Reporter
        </Button>

        <Button className="flex-1" variant="destructive">
          Remove Content
        </Button>
      </CardFooter>
    </Card>
  )
}
