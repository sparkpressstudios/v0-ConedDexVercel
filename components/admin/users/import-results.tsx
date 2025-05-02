"use client"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import type { ImportResult } from "@/app/actions/admin/import-users"

interface ImportResultsProps {
  result: ImportResult
  onReset: () => void
}

export function ImportResults({ result, onReset }: ImportResultsProps) {
  const totalProcessed = result.created + result.updated + result.failed

  return (
    <div className="space-y-6 py-4">
      <Alert variant={result.failed === 0 ? "default" : "destructive"}>
        {result.failed === 0 ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
        <AlertTitle>
          {result.failed === 0 ? "Import Completed Successfully" : "Import Completed with Errors"}
        </AlertTitle>
        <AlertDescription>
          Processed {totalProcessed} users: {result.created} created, {result.updated} updated, {result.failed} failed.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="created" disabled={result.created === 0}>
            Created ({result.created})
          </TabsTrigger>
          <TabsTrigger value="errors" disabled={result.failed === 0}>
            Errors ({result.failed})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">{result.created}</div>
              <div className="text-sm text-green-700">Created</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">{result.updated}</div>
              <div className="text-sm text-blue-700">Updated</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-red-600">{result.failed}</div>
              <div className="text-sm text-red-700">Failed</div>
            </div>
          </div>

          <div className="text-center pt-4">
            <Button onClick={onReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Import Another File
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="created">
          {result.details.created.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.details.created.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">No users were created</div>
          )}
        </TabsContent>

        <TabsContent value="errors">
          {result.details.failed.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.details.failed.map((error, index) => (
                  <TableRow key={index}>
                    <TableCell>{error.email}</TableCell>
                    <TableCell className="text-red-600">{error.error}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">No errors occurred</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
