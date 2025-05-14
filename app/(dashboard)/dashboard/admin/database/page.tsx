"use client"

import { useState } from "react"
import { Database, Play, Save, Download, Upload, RefreshCw, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function DatabasePage() {
  const [isExecuting, setIsExecuting] = useState(false)
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM users LIMIT 10;")
  const [queryResults, setQueryResults] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExecuteQuery = () => {
    setIsExecuting(true)
    setError(null)

    // Simulate API call
    setTimeout(() => {
      try {
        setIsExecuting(false)
        // Mock results
        setQueryResults([
          {
            id: "usr_1",
            username: "john_smith",
            email: "john.smith@example.com",
            role: "explorer",
            created_at: "2023-05-12",
          },
          {
            id: "usr_2",
            username: "sarah_j",
            email: "sarah@icecreamheaven.com",
            role: "shop_owner",
            created_at: "2023-06-03",
          },
          {
            id: "usr_3",
            username: "michael_c",
            email: "michael.chen@example.com",
            role: "explorer",
            created_at: "2023-04-18",
          },
          {
            id: "usr_4",
            username: "emma_w",
            email: "emma@frostybites.com",
            role: "shop_owner",
            created_at: "2023-07-22",
          },
          {
            id: "usr_5",
            username: "alex_r",
            email: "alex.rodriguez@example.com",
            role: "admin",
            created_at: "2023-03-10",
          },
        ])
        toast({
          title: "Query executed",
          description: "SQL query executed successfully.",
        })
      } catch (err) {
        setError("Failed to execute query. Please check your syntax and try again.")
        console.error("Query execution error:", err)
      }
    }, 1000)
  }

  const handleCopyQuery = () => {
    try {
      navigator.clipboard.writeText(sqlQuery)
      toast({
        title: "Copied to clipboard",
        description: "SQL query copied to clipboard.",
      })
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Database Tools</h1>
          <p className="text-muted-foreground">Manage database operations and run SQL queries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
        </div>
      </div>

      <Tabs defaultValue="query">
        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="query">SQL Query</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="query" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>SQL Query Editor</CardTitle>
              <CardDescription>Run SQL queries directly against the database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Query</h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={handleCopyQuery}>
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setSqlQuery("SELECT * FROM users LIMIT 10;")}>
                      <RefreshCw className="h-4 w-4" />
                      <span className="sr-only">Reset</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Save className="h-4 w-4" />
                      <span className="sr-only">Save</span>
                    </Button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-md border">
                  <div className="bg-muted px-4 py-2 flex justify-between items-center">
                    <span className="text-sm font-medium">SQL</span>
                    <Button size="sm" onClick={handleExecuteQuery} disabled={isExecuting} className="h-7 gap-1 text-xs">
                      {isExecuting ? "Executing..." : "Execute"}
                      {!isExecuting && <Play className="h-3 w-3" />}
                    </Button>
                  </div>
                  <Textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    className="font-mono text-sm min-h-[150px] border-0 focus-visible:ring-0 resize-none p-4"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">{error}</div>
                )}

                {queryResults && (
                  <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys(queryResults[0]).map((key) => (
                              <TableHead key={key}>{key}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {queryResults.map((row, i) => (
                            <TableRow key={i}>
                              {Object.values(row).map((value: any, j) => (
                                <TableCell key={j}>{value}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Backup</CardTitle>
              <CardDescription>Manage database backups and restoration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Scheduled Backups</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Backup Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Daily Backup</TableCell>
                        <TableCell>Sep 28, 2023</TableCell>
                        <TableCell>24.5 MB</TableCell>
                        <TableCell>Completed</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Weekly Backup</TableCell>
                        <TableCell>Sep 25, 2023</TableCell>
                        <TableCell>23.8 MB</TableCell>
                        <TableCell>Completed</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Monthly Backup</TableCell>
                        <TableCell>Sep 1, 2023</TableCell>
                        <TableCell>22.1 MB</TableCell>
                        <TableCell>Completed</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="w-full sm:w-auto">
                  <Database className="mr-2 h-4 w-4" />
                  Create Manual Backup
                </Button>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Upload className="mr-2 h-4 w-4" />
                  Restore from Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Tables</CardTitle>
              <CardDescription>View and manage database tables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Table Name</TableHead>
                      <TableHead>Rows</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>users</TableCell>
                      <TableCell>243</TableCell>
                      <TableCell>1.2 MB</TableCell>
                      <TableCell>Sep 28, 2023</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>shops</TableCell>
                      <TableCell>87</TableCell>
                      <TableCell>3.5 MB</TableCell>
                      <TableCell>Sep 27, 2023</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>flavors</TableCell>
                      <TableCell>412</TableCell>
                      <TableCell>2.8 MB</TableCell>
                      <TableCell>Sep 28, 2023</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>flavor_logs</TableCell>
                      <TableCell>1,856</TableCell>
                      <TableCell>5.4 MB</TableCell>
                      <TableCell>Sep 28, 2023</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>badges</TableCell>
                      <TableCell>24</TableCell>
                      <TableCell>0.8 MB</TableCell>
                      <TableCell>Sep 15, 2023</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Logs</CardTitle>
              <CardDescription>View database operation logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="bg-muted px-4 py-2 flex justify-between items-center">
                  <span className="text-sm font-medium">Recent Logs</span>
                  <Button variant="ghost" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>
                <div className="p-4 font-mono text-xs space-y-2 max-h-[400px] overflow-y-auto">
                  <p className="text-green-600">[2023-09-28 14:32:15] INFO: Backup completed successfully</p>
                  <p className="text-blue-600">[2023-09-28 14:30:01] INFO: Starting scheduled backup</p>
                  <p className="text-amber-600">[2023-09-28 13:45:22] WARN: Slow query detected (query_id: 12345)</p>
                  <p className="text-green-600">[2023-09-28 12:15:33] INFO: Table 'flavors' optimized</p>
                  <p className="text-red-600">[2023-09-28 10:22:18] ERROR: Connection timeout (retry: 1/3)</p>
                  <p className="text-green-600">[2023-09-28 10:22:45] INFO: Connection re-established</p>
                  <p className="text-blue-600">[2023-09-28 09:00:01] INFO: Daily maintenance started</p>
                  <p className="text-green-600">[2023-09-28 09:15:22] INFO: Daily maintenance completed</p>
                  <p className="text-blue-600">[2023-09-27 23:59:59] INFO: Daily statistics generated</p>
                  <p className="text-green-600">[2023-09-27 22:30:15] INFO: Backup completed successfully</p>
                  <p className="text-blue-600">[2023-09-27 22:28:01] INFO: Starting scheduled backup</p>
                  <p className="text-amber-600">[2023-09-27 18:12:44] WARN: High CPU usage detected</p>
                  <p className="text-green-600">[2023-09-27 18:20:33] INFO: CPU usage returned to normal</p>
                  <p className="text-blue-600">[2023-09-27 15:45:12] INFO: Index rebuild started</p>
                  <p className="text-green-600">[2023-09-27 15:52:08] INFO: Index rebuild completed</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Full Logs
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
