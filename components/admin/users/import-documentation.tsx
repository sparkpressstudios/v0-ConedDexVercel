import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Info } from "lucide-react"

export function ImportDocumentation() {
  return (
    <div className="space-y-6 py-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>CSV Import Guidelines</AlertTitle>
        <AlertDescription>Follow these guidelines to ensure a successful import of explorer accounts.</AlertDescription>
      </Alert>

      <div>
        <h3 className="text-lg font-medium mb-2">Required Format</h3>
        <p className="text-sm text-gray-600 mb-4">
          Your CSV file must include the following headers in the first row. Required fields are marked with an asterisk
          (*).
        </p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">email</TableCell>
              <TableCell>Yes*</TableCell>
              <TableCell>User's email address (must be unique)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">full_name</TableCell>
              <TableCell>Yes*</TableCell>
              <TableCell>User's full name</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">username</TableCell>
              <TableCell>No</TableCell>
              <TableCell>Preferred username (will be generated if not provided)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">avatar_url</TableCell>
              <TableCell>No</TableCell>
              <TableCell>URL to user's profile image</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">bio</TableCell>
              <TableCell>No</TableCell>
              <TableCell>Short biography or description</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">location</TableCell>
              <TableCell>No</TableCell>
              <TableCell>User's location</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">role</TableCell>
              <TableCell>No</TableCell>
              <TableCell>User role (defaults to "explorer")</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">update_if_exists</TableCell>
              <TableCell>No</TableCell>
              <TableCell>Set to "true" to update existing users (defaults to "false")</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Example CSV</h3>
        <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-x-auto">
          email,full_name,username,avatar_url,bio,location,role,update_if_exists
          <br />
          john@example.com,John Doe,johndoe,https://example.com/avatar.jpg,"Ice cream enthusiast",New
          York,explorer,false
          <br />
          jane@example.com,Jane Smith,janesmith,,,Boston,explorer,true
        </pre>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Notes</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
          <li>
            <strong>Existing Users:</strong> By default, the import will skip users with email addresses that already
            exist in the system. Set <code>update_if_exists</code> to "true" to update existing users instead.
          </li>
          <li>
            <strong>Passwords:</strong> Temporary passwords will be generated for new users. Users will receive an email
            to set their password on first login.
          </li>
          <li>
            <strong>Quotes:</strong> Use double quotes around fields that contain commas or line breaks.
          </li>
          <li>
            <strong>File Size:</strong> Maximum file size is 5MB.
          </li>
          <li>
            <strong>Batch Processing:</strong> For large imports (1000+ users), consider splitting your CSV into
            multiple files.
          </li>
        </ul>
      </div>
    </div>
  )
}
