"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export function PersonalStats() {
  const [tasteProfile, setTasteProfile] = useState({
    sweet: 0,
    creamy: 0,
    fruity: 0,
    nutty: 0,
    chocolate: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { user } = useAuth()

  useEffect(() => {
    async function fetchTasteProfile() {
      if (!user?.id) return

      try {
        setLoading(true)

        // Get user's flavor logs with flavor details
        const { data: userLogs, error: logsError } = await supabase
          .from("flavor_logs")
          .select(`
            flavors:flavor_id (
              category,
              base_type,
              tags
            )
          `)
          .eq("user_id", user.id)

        if (logsError) throw logsError

        if (userLogs && userLogs.length > 0) {
          // Count flavor categories
          const categories = userLogs.reduce(
            (acc, log) => {
              const category = log.flavors?.category?.toLowerCase()
              if (category) {
                // Map categories to taste profile properties
                if (category.includes("sweet") || category.includes("candy")) acc.sweet++
                if (category.includes("cream") || category.includes("milk")) acc.creamy++
                if (category.includes("fruit") || category.includes("berry")) acc.fruity++
                if (category.includes("nut") || category.includes("almond") || category.includes("pecan")) acc.nutty++
                if (category.includes("chocolate") || category.includes("cocoa")) acc.chocolate++
              }
              return acc
            },
            { sweet: 0, creamy: 0, fruity: 0, nutty: 0, chocolate: 0 },
          )

          // Convert counts to percentages
          const total = Object.values(categories).reduce((sum, count) => sum + count, 0) || 1
          const profile = {
            sweet: Math.round((categories.sweet / total) * 100) || 20,
            creamy: Math.round((categories.creamy / total) * 100) || 30,
            fruity: Math.round((categories.fruity / total) * 100) || 25,
            nutty: Math.round((categories.nutty / total) * 100) || 15,
            chocolate: Math.round((categories.chocolate / total) * 100) || 40,
          }

          setTasteProfile(profile)
        } else {
          // Set default profile for new users
          setTasteProfile({
            sweet: 20,
            creamy: 30,
            fruity: 25,
            nutty: 15,
            chocolate: 40,
          })
        }
      } catch (error) {
        console.error("Error calculating taste profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasteProfile()
  }, [supabase, user?.id])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Taste Profile</CardTitle>
        <CardDescription>Based on your flavor history</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sweet</span>
                <span className="text-sm text-gray-500">{tasteProfile.sweet}%</span>
              </div>
              <Progress value={tasteProfile.sweet} className="h-2 bg-gray-100">
                <div className="h-full bg-orange-400 rounded-full" style={{ width: `${tasteProfile.sweet}%` }} />
              </Progress>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Creamy</span>
                <span className="text-sm text-gray-500">{tasteProfile.creamy}%</span>
              </div>
              <Progress value={tasteProfile.creamy} className="h-2 bg-gray-100">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${tasteProfile.creamy}%` }} />
              </Progress>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Fruity</span>
                <span className="text-sm text-gray-500">{tasteProfile.fruity}%</span>
              </div>
              <Progress value={tasteProfile.fruity} className="h-2 bg-gray-100">
                <div className="h-full bg-pink-400 rounded-full" style={{ width: `${tasteProfile.fruity}%` }} />
              </Progress>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Nutty</span>
                <span className="text-sm text-gray-500">{tasteProfile.nutty}%</span>
              </div>
              <Progress value={tasteProfile.nutty} className="h-2 bg-gray-100">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${tasteProfile.nutty}%` }} />
              </Progress>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Chocolate</span>
                <span className="text-sm text-gray-500">{tasteProfile.chocolate}%</span>
              </div>
              <Progress value={tasteProfile.chocolate} className="h-2 bg-gray-100">
                <div className="h-full bg-brown-400 rounded-full" style={{ width: `${tasteProfile.chocolate}%` }} />
              </Progress>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/dashboard/profile">View Full Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default PersonalStats
