import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { adminNavigationAudit } from "@/lib/admin/navigation-audit"
import Link from "next/link"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"

export default function NavigationAuditPage() {
  // Count issues by status
  const counts = adminNavigationAudit.reduce(
    (acc, link) => {
      acc[link.status]++
      return acc
    },
    { functional: 0, broken: 0, missing: 0, incomplete: 0 },
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Navigation Audit</h1>
        <p className="text-muted-foreground">Audit results for the admin navigation menu links</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Functional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.functional}</div>
            <p className="text-xs text-muted-foreground">Working links</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
              Broken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.broken}</div>
            <p className="text-xs text-muted-foreground">Non-functional links</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
              Missing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.missing}</div>
            <p className="text-xs text-muted-foreground">Pages that don't exist</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Info className="mr-2 h-4 w-4 text-blue-500" />
              Incomplete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.incomplete}</div>
            <p className="text-xs text-muted-foreground">Partially implemented</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Navigation Links</CardTitle>
          <CardDescription>Status of all admin navigation links</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Solution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminNavigationAudit.map((link) => (
                <TableRow key={link.href}>
                  <TableCell className="font-medium">{link.label}</TableCell>
                  <TableCell>
                    <Link href={link.href} className="text-blue-600 hover:underline">
                      {link.href}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        link.status === "functional"
                          ? "default"
                          : link.status === "broken"
                            ? "destructive"
                            : link.status === "missing"
                              ? "outline"
                              : "secondary"
                      }
                    >
                      {link.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{link.issue || "—"}</TableCell>
                  <TableCell>{link.solution || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
