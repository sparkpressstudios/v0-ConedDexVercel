"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, XCircle, AlertCircle, User, Calendar, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function ShopClaimsManager() {
  const [claims, setClaims] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")

  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchClaims()
  }, [activeTab])

  const fetchClaims = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("shop_claims")
        .select(`
          *,
          shops:shop_id(id, name, address, phone, website, mainImage),
          users:user_id(id, email)
        `)
        .eq("status", activeTab)
        .order("submitted_at", { ascending: false })

      if (error) throw error
      setClaims(data || [])
    } catch (error) {
      console.error("Error fetching claims:", error)
      toast({
        title: "Error fetching claims",
        description: "There was a problem loading the shop claims.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveClaim = async (claimId: string, shopId: string, userId: string) => {
    setIsProcessing(true)
    try {
      // Update the claim status
      const { error: claimError } = await supabase
        .from("shop_claims")
        .update({
          status: "approved",
          processed_at: new Date().toISOString(),
        })
        .eq("id", claimId)

      if (claimError) throw claimError

      // Update the shop to assign the owner
      const { error: shopError } = await supabase
        .from("shops")
        .update({
          owner_id: userId,
          has_claim_request: false,
          is_claimed: true,
          verification_status: "verified",
          last_updated: new Date().toISOString(),
        })
        .eq("id", shopId)

      if (shopError) throw shopError

      // Refresh the claims list
      fetchClaims()

      toast({
        title: "Claim approved",
        description: "The shop has been assigned to the user.",
      })
    } catch (error) {
      console.error("Error approving claim:", error)
      toast({
        title: "Error approving claim",
        description: "There was a problem approving the claim.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectClaim = async () => {
    if (!selectedClaim) return

    setIsProcessing(true)
    try {
      // Update the claim status
      const { error: claimError } = await supabase
        .from("shop_claims")
        .update({
          status: "rejected",
          processed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq("id", selectedClaim.id)

      if (claimError) throw claimError

      // Update the shop to remove the claim request flag
      const { error: shopError } = await supabase
        .from("shops")
        .update({
          has_claim_request: false,
          last_updated: new Date().toISOString(),
        })
        .eq("id", selectedClaim.shop_id)

      if (shopError) throw shopError

      // Refresh the claims list
      fetchClaims()
      setSelectedClaim(null)
      setRejectionReason("")

      toast({
        title: "Claim rejected",
        description: "The claim has been rejected.",
      })
    } catch (error) {
      console.error("Error rejecting claim:", error)
      toast({
        title: "Error rejecting claim",
        description: "There was a problem rejecting the claim.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shop Claim Requests</CardTitle>
        <CardDescription>Manage and review shop ownership claims</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : claims.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No {activeTab} claims found</div>
            ) : (
              <div className="space-y-4">
                {claims.map((claim) => (
                  <Card key={claim.id} className="overflow-hidden">
                    <div className="grid md:grid-cols-[1fr_auto] border-b">
                      <div className="p-4 md:p-6">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold">{claim.shops?.name}</h3>
                          {getStatusBadge(claim.status)}
                        </div>

                        <div className="grid gap-1 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            <span>
                              Claimed by <span className="font-medium">{claim.owner_name}</span> ({claim.owner_position}
                              )
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>
                              Submitted {claim.submitted_at ? format(new Date(claim.submitted_at), "PPP") : "N/A"}
                            </span>
                          </div>
                          {claim.processed_at && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>Processed {format(new Date(claim.processed_at), "PPP")}</span>
                            </div>
                          )}
                        </div>

                        {claim.verification_notes && (
                          <div className="mb-4">
                            <div className="flex items-center mb-1">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              <span className="font-medium text-sm">Verification Notes</span>
                            </div>
                            <p className="text-sm bg-muted p-2 rounded">{claim.verification_notes}</p>
                          </div>
                        )}

                        {claim.rejection_reason && (
                          <div>
                            <div className="flex items-center mb-1">
                              <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                              <span className="font-medium text-sm">Rejection Reason</span>
                            </div>
                            <p className="text-sm bg-red-50 text-red-800 p-2 rounded">{claim.rejection_reason}</p>
                          </div>
                        )}
                      </div>

                      {claim.status === "pending" && (
                        <div className="flex flex-col justify-center gap-2 p-4 bg-muted/20">
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full"
                            onClick={() => handleApproveClaim(claim.id, claim.shop_id, claim.user_id)}
                            disabled={isProcessing}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => setSelectedClaim(claim)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Claim Request</DialogTitle>
                                <DialogDescription>
                                  Please provide a reason for rejecting this claim. This will be shared with the user.
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="rejectionReason">Rejection Reason</Label>
                                  <Textarea
                                    id="rejectionReason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Please explain why this claim is being rejected..."
                                    rows={4}
                                    required
                                  />
                                </div>
                              </div>

                              <DialogFooter>
                                <Button
                                  variant="destructive"
                                  onClick={handleRejectClaim}
                                  disabled={!rejectionReason.trim() || isProcessing}
                                >
                                  {isProcessing ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    "Reject Claim"
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
