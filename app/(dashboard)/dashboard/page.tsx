import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  IceCream,
  Trash2,
  Music,
  ImageIcon,
  ChevronRight,
  ChevronLeft,
  BarChart,
  Activity,
  Zap,
  Shield,
  RefreshCw,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = createServerClient()

  let user = null
  let profile = null

  try {
    // Get the current user
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    user = currentUser

    if (user) {
      // Get the user's profile
      const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      profile = userProfile
    }
  } catch (error) {
    console.error("Error fetching user data:", error)
  }

  // Get current date
  const today = new Date()
  const currentMonth = today.toLocaleString("default", { month: "long" })
  const currentDay = today.getDate()
  const currentYear = today.getFullYear()

  // Create week dates
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const currentDayOfWeek = today.getDay() // 0 is Sunday, 1 is Monday, etc.
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - ((currentDayOfWeek || 7) - 1)) // Adjust to Monday

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    return {
      day: weekDays[i],
      date: date.getDate(),
      isToday:
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear(),
    }
  })

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-medium text-gray-700">
            {currentMonth} {currentDay}-{currentDay + 6}
          </h2>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button variant="outline" className="text-sm">
          Month
        </Button>
      </div>

      {/* Week Calendar */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {weekDates.map((item) => (
          <div key={item.day} className="flex flex-col items-center">
            <span className="text-sm text-gray-500">{item.day}</span>
            <div
              className={cn(
                "mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm",
                item.isToday ? "bg-coral-500 text-white" : "text-gray-700",
              )}
            >
              {item.date}
            </div>
            <div className="mt-1 h-1 w-1 rounded-full bg-orange-500"></div>
          </div>
        ))}
      </div>

      {/* Weekly Reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Weekly Reports</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="text-sm text-gray-500">
              Today
            </Button>
            <Button variant="ghost" size="sm" className="text-sm font-medium text-purple-600">
              Week
            </Button>
            <Button variant="ghost" size="sm" className="text-sm text-gray-500">
              Month
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 p-3 bg-orange-100 rounded-lg">
                  <IceCream className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Flavors Logged</h3>
                <p className="text-2xl font-bold mt-1 text-gray-900">35</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 p-3 bg-coral-100 rounded-lg">
                  <Music className="h-6 w-6 text-coral-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Shops Visited</h3>
                <p className="text-2xl font-bold mt-1 text-gray-900">1.25</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 p-3 bg-teal-100 rounded-lg">
                  <Trash2 className="h-6 w-6 text-teal-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Reviews Posted</h3>
                <p className="text-2xl font-bold mt-1 text-gray-900">16.35</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 p-3 bg-purple-100 rounded-lg">
                  <ImageIcon className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Photos Shared</h3>
                <p className="text-2xl font-bold mt-1 text-gray-900">12.10</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Other Functions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Other Functions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="border border-gray-100 shadow-sm bg-coral-50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-coral-500 rounded-lg text-white mr-3">
                    <BarChart className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-gray-800">Optimization</span>
                </div>
                <div className="w-10 h-6 bg-coral-500 rounded-full flex items-center p-1">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm bg-orange-50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-500 rounded-lg text-white mr-3">
                    <Zap className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-gray-800">Smart Scan</span>
                </div>
                <div className="w-10 h-6 bg-orange-500 rounded-full flex items-center justify-end p-1">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm bg-teal-50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-teal-500 rounded-lg text-white mr-3">
                    <Shield className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-gray-800">Malware</span>
                </div>
                <div className="w-10 h-6 bg-teal-500 rounded-full flex items-center p-1">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm bg-gray-50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-400 rounded-lg text-white mr-3">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-gray-800">Updater</span>
                </div>
                <div className="w-10 h-6 bg-gray-400 rounded-full flex items-center p-1">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistics of Tasting</h2>
          <Card className="border border-gray-100 shadow-sm h-[calc(100%-2rem)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500">CURRENT FRIDAY</p>
                  <p className="text-2xl font-bold">58%</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="p-1">
                    <BarChart className="h-5 w-5 text-orange-500" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1">
                    <Activity className="h-5 w-5 text-gray-400" />
                  </Button>
                </div>
              </div>

              <div className="h-40 flex items-end justify-between space-x-2">
                {["MO", "TU", "WE", "TH", "FR", "SA", "SU"].map((day, i) => (
                  <div key={day} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-full rounded-t-sm ${
                        day === "TH" ? "bg-orange-500 h-32" : `bg-teal-400 h-${12 + Math.floor(Math.random() * 20)}`
                      }`}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">{day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Updating Monitoring */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Updating Monitoring</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">System Files</h3>
                  <p className="text-sm text-gray-500">December {currentYear}</p>
                </div>
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-800">25%</span>
                  </div>
                  <svg className="h-16 w-16 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="10"
                      strokeDasharray="251.2"
                      strokeDashoffset="188.4"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm bg-purple-900 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Applications</h3>
                  <p className="text-sm text-purple-300">December {currentYear}</p>
                </div>
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">50%</span>
                  </div>
                  <svg className="h-16 w-16 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#6d28d9" strokeWidth="10" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="10"
                      strokeDasharray="251.2"
                      strokeDashoffset="125.6"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Helper function for conditional class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
