import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { approveFlavor, rejectFlavor, requestMoreInfo, updateModerationQueue } from "@/app/actions/flavor-moderation"
import { AlertTriangle, CheckCircle, Clock, Info } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ModerationPage() {
  const supabase = createClient()

  // Get pending flavors that need manual review
  const { data: pendingFlavors } = await supabase
    .from("flavors")
    .select(`
      *,
      shops:shop_id(name, id),
      users:user_id(full_name, email, id)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  // Get flavors that need more info
  const { data: infoRequestedFlavors } = await supabase
    .from("flavors")
    .select(`
      *,
      shops:shop_id(name, id),
      users:user_id(full_name, email, id)
    `)
    .eq("status", "info_requested")
    .order("created_at", { ascending: false })

  // Get recently auto-approved flavors
  const { data: autoApprovedFlavors } = await supabase
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

  // Get recently manually moderated flavors
  const { data: manuallyModeratedFlavors } = await supabase
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

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Moderation</h1>
          <p className="text-muted-foreground mt-1">
            Only content flagged by AI requires manual review. Safe content is auto-approved.
          </p>
        </div>
        <form action={updateModerationQueue}>
          <Button type="submit">Refresh Queue</Button>
        </form>
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
              <Info className="h-5 w-5 mr-2 text-blue-500" />
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
              <span>Manually Reviewed</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{manuallyModeratedFlavors?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Recently reviewed by admins</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
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
            manuallyModeratedFlavors.map((flavor) => <FlavorModerationCard key={flavor.id} flavor={flavor} readOnly />)
          ) : (
            <div className="text-center py-12 text-muted-foreground">No manually reviewed flavors yet</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
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
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {!readOnly && (
        <CardFooter className="flex justify-between bg-muted/50 gap-2">
          <form action={approveFlavor.bind(null, flavor.id)} className="flex-1">
            <Button type="submit" className="w-full" variant="default">
              Approve
            </Button>
          </form>

          <form action={requestMoreInfo.bind(null, flavor.id, "Please provide more information")} className="flex-1">
            <Button type="submit" className="w-full" variant="outline">
              Request Info
            </Button>
          </form>

          <form action={rejectFlavor.bind(null, flavor.id, "Content does not meet guidelines")} className="flex-1">
            <Button type="submit" className="w-full" variant="destructive">
              Reject
            </Button>
          </form>
        </CardFooter>
      )}
    </Card>
  )
}
