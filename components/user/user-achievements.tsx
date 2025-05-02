"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Trophy, Star, Medal, TrendingUp, Clock, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Sample data - in a real app, this would come from an API
const recentAchievements = [
  {
    id: 1,
    name: "Flavor Explorer",
    description: "Tried 10 different flavors",
    icon: <Star className="h-5 w-5" />,
    date: "2023-04-15",
    points: 50,
    unlocked: true,
  },
  {
    id: 2,
    name: "Shop Hopper",
    description: "Visited 5 different ice cream shops",
    icon: <Trophy className="h-5 w-5" />,
    date: "2023-04-10",
    points: 75,
    unlocked: true,
  },
  {
    id: 3,
    name: "Review Master",
    description: "Left 15 detailed reviews",
    icon: <Medal className="h-5 w-5" />,
    date: "2023-04-05",
    points: 100,
    unlocked: true,
  },
]

const inProgressAchievements = [
  {
    id: 4,
    name: "Flavor Connoisseur",
    description: "Try 25 different flavors",
    icon: <Award className="h-5 w-5" />,
    progress: 60,
    points: 150,
    unlocked: false,
  },
  {
    id: 5,
    name: "Ice Cream Aficionado",
    description: "Visit 15 different ice cream shops",
    icon: <TrendingUp className="h-5 w-5" />,
    progress: 40,
    points: 200,
    unlocked: false,
  },
  {
    id: 6,
    name: "Seasonal Specialist",
    description: "Try all seasonal flavors in a year",
    icon: <Clock className="h-5 w-5" />,
    progress: 25,
    points: 300,
    unlocked: false,
  },
]

interface AchievementCardProps {
  achievement: {
    id: number
    name: string
    description: string
    icon: React.ReactNode
    date?: string
    progress?: number
    points: number
    unlocked: boolean
  }
}

function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <Card
      className={cn(
        "h-full transition-all duration-300",
        achievement.unlocked ? "border-amber-200 bg-amber-50/30" : "",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "p-2 rounded-full",
                achievement.unlocked ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600",
              )}
            >
              {achievement.icon}
            </div>
            <CardTitle className="text-base font-medium">{achievement.name}</CardTitle>
          </div>
          <Badge variant={achievement.unlocked ? "default" : "outline"}>{achievement.points} pts</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{achievement.description}</CardDescription>

        {achievement.unlocked ? (
          <div className="mt-2 text-sm text-muted-foreground">
            Unlocked on {new Date(achievement.date!).toLocaleDateString()}
          </div>
        ) : (
          <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{achievement.progress}%</span>
            </div>
            <Progress value={achievement.progress} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function UserAchievements() {
  const totalPoints = recentAchievements.reduce((sum, achievement) => sum + achievement.points, 0)
  const [showShareDialog, setShowShareDialog] = useState(false)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Your Achievements</CardTitle>
            <CardDescription>Track your progress and earn rewards</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-base px-3 py-1">
              <Trophy className="h-4 w-4 mr-1 text-amber-500" />
              {totalPoints} Points
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recent">
          <TabsList className="mb-4">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="all">All Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="in-progress">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {inProgressAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...recentAchievements, ...inProgressAchievements].map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View Achievement History
        </Button>
      </CardFooter>
    </Card>
  )
}
