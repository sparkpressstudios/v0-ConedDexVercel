import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CreateUserForm from "./create-user-form"

export default function CreateUserPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create New User</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add User</CardTitle>
          <CardDescription>Create a new user account with specific role and permissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateUserForm />
        </CardContent>
      </Card>
    </div>
  )
}
