import Link from "next/link"
import { ArrowLeft, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"

interface UserDetailPageProps {
  params: {
    id: string
  }
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = params

  // In a real app, we would fetch the user data from the database
  // For now, we'll use mock data
  const user = {
    id,
    name: "John Smith",
    username: "john_smith",
    email: "john.smith@example.com",
    role: "explorer",
    status: "active",
    joined: "2023-05-12",
    lastActive: "2023-09-28",
    bio: "Ice cream enthusiast on a mission to try every flavor in existence. Currently at 87 flavors and counting!",
    location: "San Francisco, CA",
    avatar_url: null,
    favorite_flavor: "Mint Chocolate Chip",
    badges: 12,
    flavors_logged: 87,
    shops_visited: 24,
    reviews: 18,
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/admin/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">User Details</h1>
        </div>
        <div>
          <Button asChild>
            <Link href={`/dashboard/admin/users/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col items-center text-center">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url || "/placeholder.svg"}
                  alt={`${user.name}'s avatar`}
                  className="w-24 h-24 rounded-full mb-4"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-4">
                  {getInitials(user.name)}
                </div>
              )}
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-gray-500">@{user.username}</p>
              <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </div>
              <div className="mt-4 w-full">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Status</span>
                  <span className={user.status === "active" ? "text-green-600" : "text-red-600"}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Joined</span>
                  <span>{formatDate(user.joined)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Last Active</span>
                  <span>{formatDate(user.lastActive)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Email</h4>
                <p>{user.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Location</h4>
                <p>{user.location}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Bio</h4>
                <p>{user.bio}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Favorite Flavor</h4>
                <p>{user.favorite_flavor}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Activity Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{user.badges}</p>
                <p className="text-sm text-gray-600">Badges</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{user.flavors_logged}</p>
                <p className="text-sm text-gray-600">Flavors Logged</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">{user.shops_visited}</p>
                <p className="text-sm text-gray-600">Shops Visited</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600">{user.reviews}</p>
                <p className="text-sm text-gray-600">Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
