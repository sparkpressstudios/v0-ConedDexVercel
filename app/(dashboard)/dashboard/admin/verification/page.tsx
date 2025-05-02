"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle, XCircle, Eye, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function VerificationRequestsPage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState("")

  useEffect(() => {
    fetchVerificationRequests()
  }, [])

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from("shop_verification")
        .select(`
          *,
          shop:shop_id (
            id,
            name,
            address,
            city,
            state
          ),
          user:user_id (
            id,
            email,
            full_name
          )
        `)
        .order("submitted_at", { ascending: false })

      if (error) throw error

      setRequests(data || [])
    } catch (error) {
      console.error("Error fetching verification requests:", error)
      toast({
        title: "Error",
        description: "Failed to load verification requests",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    try {
      setProcessingId(requestId)

      // Update verification request
      const { error: updateError } = await supabase
        .from("shop_verification")
        .update({
          status: "approved",
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)

      if (updateError) throw updateError

      // Get shop ID from request
      const request = requests.find((r) => r.id === requestId)
      if (!request) throw new Error("Request not found")

      // Update shop verification status
      const { error: shopError } = await supabase
        .from("shops")
        .update({
          is_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", request.shop_id)

      if (shopError) throw shopError

      // Create notification for shop owner
      const { error: notificationError } = await supabase.from("notifications").insert({
        user_id: request.user_id,
        shop_id: request.shop_id,
        type: "verification_approved",
        title: "Shop Verification Approved",
        message: "Congratulations! Your shop has been verified.",
        data: { request_id: requestId },
      })

      if (notificationError) throw notificationError

      toast({
        title: "Verification approved",
        description: "The shop has been successfully verified",
      })

      // Refresh requests
      fetchVerificationRequests()
    } catch (error) {
      console.error("Error approving verification:", error)
      toast({
        title: "Error",
        description: "Failed to approve verification",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
      setAdminNotes("")
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      setProcessingId(requestId)

      // Update verification request
      const { error: updateError } = await supabase
        .from("shop_verification")
        .update({
          status: "rejected",
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)

      if (updateError) throw updateError

      // Get shop ID from request
      const request = requests.find((r) => r.id === requestId)
      if (!request) throw new Error("Request not found")

      // Create notification for shop owner
      const { error: notificationError } = await supabase.from("notifications").insert({
        user_id: request.user_id,
        shop_id: request.shop_id,
        type: "verification_rejected",
        title: "Shop Verification Rejected",
        message: "Your shop verification request has been rejected. Please see admin notes for details.",
        data: { request_id: requestId },
      })

      if (notificationError) throw notificationError

      toast({
        title: "Verification rejected",
        description: "The verification request has been rejected",
      })

      // Refresh requests
      fetchVerificationRequests()
    } catch (error) {
      console.error("Error rejecting verification:", error)
      toast({
        title: "Error",
        description: "Failed to reject verification",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
      setAdminNotes("")
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const approvedRequests = requests.filter((r) => r.status === "approved")
  const rejectedRequests = requests.filter((r) => r.status === "rejected")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Shop Verification Requests</h1>
          <p className="text-muted-foreground">Review and manage shop verification requests</p>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-center">
              <div>
                <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-lg font-semibold">No pending requests</h3>
                <p className="text-muted-foreground">All verification requests have been processed</p>
              </div>
            </div>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{request.shop.name}</CardTitle>
                      <CardDescription>
                        {request.shop.address}, {request.shop.city}, {request.shop.state}
                      </CardDescription>
                    </div>
                    <Badge>Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold mb-2">Request Details</h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Submitted by:</span> {request.user.full_name} (
                          {request.user.email})
                        </p>
                        <p>
                          <span className="font-medium">Date:</span> {new Date(request.submitted_at).toLocaleString()}
                        </p>
                        <p>
                          <span className="font-medium">Type:</span>{" "}
                          {request.verification_type.charAt(0).toUpperCase() + request.verification_type.slice(1)}
                        </p>
                        {request.verification_data?.document_type && (
                          <p>
                            <span className="font-medium">Document:</span>{" "}
                            {request.verification_data.document_type.replace("_", " ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Additional Information</h3>
                      <p className="text-sm">
                        {request.verification_data?.additional_info || "No additional information provided"}
                      </p>
                      {request.verification_data?.document_url && (
                        <Button variant="outline" size="sm" className="mt-2" asChild>
                          <a href={request.verification_data.document_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-1" />
                            View Document
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Admin Notes</h3>
                    <Textarea
                      placeholder="Add notes about this verification request"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(request.id)}
                    disabled={processingId === request.id}
                  >
                    {processingId === request.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-1" />
                    )}
                    Reject
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => handleApprove(request.id)}
                    disabled={processingId === request.id}
                  >
                    {processingId === request.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    Approve
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : approvedRequests.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-center">
              <div>
                <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-lg font-semibold">No approved requests</h3>
                <p className="text-muted-foreground">No verification requests have been approved yet</p>
              </div>
            </div>
          ) : (
            approvedRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{request.shop.name}</CardTitle>
                      <CardDescription>
                        {request.shop.address}, {request.shop.city}, {request.shop.state}
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold mb-2">Request Details</h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Submitted by:</span> {request.user.full_name} (
                          {request.user.email})
                        </p>
                        <p>
                          <span className="font-medium">Date:</span> {new Date(request.submitted_at).toLocaleString()}
                        </p>
                        <p>
                          <span className="font-medium">Approved:</span> {new Date(request.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Admin Notes</h3>
                      <p className="text-sm">{request.admin_notes || "No admin notes provided"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : rejectedRequests.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-center">
              <div>
                <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-lg font-semibold">No rejected requests</h3>
                <p className="text-muted-foreground">No verification requests have been rejected</p>
              </div>
            </div>
          ) : (
            rejectedRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{request.shop.name}</CardTitle>
                      <CardDescription>
                        {request.shop.address}, {request.shop.city}, {request.shop.state}
                      </CardDescription>
                    </div>
                    <Badge variant="destructive">Rejected</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold mb-2">Request Details</h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Submitted by:</span> {request.user.full_name} (
                          {request.user.email})
                        </p>
                        <p>
                          <span className="font-medium">Date:</span> {new Date(request.submitted_at).toLocaleString()}
                        </p>
                        <p>
                          <span className="font-medium">Rejected:</span> {new Date(request.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Rejection Reason</h3>
                      <p className="text-sm">{request.admin_notes || "No reason provided"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
