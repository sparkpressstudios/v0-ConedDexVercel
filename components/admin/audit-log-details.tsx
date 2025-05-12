"use client"

import { useState } from "react"
import { Info, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AuditLog {
  id: string
  admin_id: string
  admin_name: string
  admin_email: string
  action_type: string
  entity_type: string
  entity_id: string
  previous_state: any
  new_state: any
  ip_address: string
  user_agent: string
  created_at: string
  details: any
}

export function AuditLogDetails({ log }: { log: AuditLog }) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Extract a summary from the log details
  const getSummary = () => {
    if (log.details) {
      if (typeof log.details === "string") {
        try {
          const parsed = JSON.parse(log.details)
          return parsed.summary || parsed.message || "View details"
        } catch (e) {
          return log.details.substring(0, 50) + (log.details.length > 50 ? "..." : "")
        }
      } else if (log.details.summary || log.details.message) {
        return log.details.summary || log.details.message
      }
    }

    // If no details, create a summary based on action and entity
    return `${log.action_type.charAt(0).toUpperCase() + log.action_type.slice(1)} ${log.entity_type}`
  }

  // Format JSON for display
  const formatJson = (json: any) => {
    if (!json) return "No data"

    if (typeof json === "string") {
      try {
        return JSON.stringify(JSON.parse(json), null, 2)
      } catch (e) {
        return json
      }
    }

    return JSON.stringify(json, null, 2)
  }

  // Check if we have state changes to display
  const hasStateChanges = log.previous_state || log.new_state

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-sm truncate max-w-[200px]">{getSummary()}</span>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Info className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Audit Log Details</DialogTitle>
              <DialogDescription>Complete information about this administrative action</DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Admin</h4>
                  <p>{log.admin_name || log.admin_email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Timestamp</h4>
                  <p>{new Date(log.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Action</h4>
                  <p className="capitalize">{log.action_type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Entity</h4>
                  <p className="capitalize">
                    {log.entity_type} {log.entity_id && `(${log.entity_id.substring(0, 8)}...)`}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">IP Address</h4>
                  <p>{log.ip_address}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">User Agent</h4>
                  <p className="truncate">{log.user_agent}</p>
                </div>
              </div>

              {hasStateChanges && (
                <div>
                  <h4 className="text-sm font-medium mb-2">State Changes</h4>
                  <Tabs defaultValue="diff">
                    <TabsList>
                      <TabsTrigger value="diff">Changes</TabsTrigger>
                      <TabsTrigger value="before">Before</TabsTrigger>
                      <TabsTrigger value="after">After</TabsTrigger>
                    </TabsList>
                    <TabsContent value="diff" className="mt-2">
                      <ScrollArea className="h-[300px] rounded-md border p-4">
                        <pre className="text-xs">
                          {/* Here you would implement a diff view between previous and new state */}
                          {log.previous_state && log.new_state
                            ? "State changes detected"
                            : "No state changes available"}
                        </pre>
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="before" className="mt-2">
                      <ScrollArea className="h-[300px] rounded-md border p-4">
                        <pre className="text-xs">{formatJson(log.previous_state)}</pre>
                      </ScrollArea>
                    </TabsContent>
                    <TabsContent value="after" className="mt-2">
                      <ScrollArea className="h-[300px] rounded-md border p-4">
                        <pre className="text-xs">{formatJson(log.new_state)}</pre>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {log.details && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Additional Details</h4>
                  <ScrollArea className="h-[200px] rounded-md border p-4">
                    <pre className="text-xs">{formatJson(log.details)}</pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-2 text-xs text-muted-foreground">
          {log.details && <pre className="whitespace-pre-wrap">{formatJson(log.details).substring(0, 200)}</pre>}
          {!log.details && hasStateChanges && (
            <div>
              <p>State changes detected. Click the info icon to view details.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
