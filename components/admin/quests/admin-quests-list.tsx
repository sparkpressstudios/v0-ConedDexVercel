"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Clock, Award, Edit, Trash2, Users, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { getAllQuests, deleteQuest, getQuestStatistics } from "@/app/actions/quest-actions"
import type { Quest } from "@/types/quests"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function AdminQuestsList() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [filteredQuests, setFilteredQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [questStats, setQuestStats] = useState<Record<string, any>>({})

  useEffect(() => {
    async function loadQuests() {
      setLoading(true)
      const { data, error } = await getAllQuests()
      if (error) {
        toast({
          title: "Error loading quests",
          description: error,
          variant: "destructive",
        })
      } else if (data) {
        setQuests(data)
        setFilteredQuests(data)

        // Load statistics for each quest
        const stats: Record<string, any> = {}
        for (const quest of data) {
          const { data: questStats } = await getQuestStatistics(quest.id)
          if (questStats) {
            stats[quest.id] = questStats
          }
        }
        setQuestStats(stats)
      }
      setLoading(false)
    }

    loadQuests()
  }, [])

  useEffect(() => {
    // Apply filters
    let result = quests

    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (quest) => quest.title.toLowerCase().includes(term) || quest.description.toLowerCase().includes(term),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      const now = new Date().toISOString()
      if (statusFilter === "active") {
        result = result.filter(
          (quest) =>
            quest.is_active &&
            new Date(quest.start_date) <= new Date() &&
            (!quest.end_date || new Date(quest.end_date) > new Date()),
        )
      } else if (statusFilter === "upcoming") {
        result = result.filter((quest) => quest.is_active && new Date(quest.start_date) > new Date())
      } else if (statusFilter === "ended") {
        result = result.filter((quest) => quest.end_date && new Date(quest.end_date) < new Date())
      } else if (statusFilter === "inactive") {
        result = result.filter((quest) => !quest.is_active)
      }
    }

    // Difficulty filter
    if (difficultyFilter !== "all") {
      result = result.filter((quest) => quest.difficulty === difficultyFilter)
    }

    // Featured filter
    if (showFeaturedOnly) {
      result = result.filter((quest) => quest.is_featured)
    }

    setFilteredQuests(result)
  }, [quests, searchTerm, statusFilter, difficultyFilter, showFeaturedOnly])

  const handleDeleteQuest = async (questId: string) => {
    setDeleting(questId)
    const { data, error } = await deleteQuest(questId)

    if (error) {
      toast({
        title: "Failed to delete quest",
        description: error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Quest deleted",
        description: "The quest has been successfully deleted.",
      })
      // Update the local state
      setQuests(quests.filter((q) => q.id !== questId))
    }
    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-24 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search quests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="featured-only" checked={showFeaturedOnly} onCheckedChange={setShowFeaturedOnly} />
        <Label htmlFor="featured-only">Show featured quests only</Label>
      </div>

      {filteredQuests.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="mb-2 text-lg font-medium">No quests found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or create a new quest.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/admin/quests/create">Create New Quest</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuests.map((quest) => (
            <AdminQuestCard
              key={quest.id}
              quest={quest}
              onDelete={handleDeleteQuest}
              deleting={deleting === quest.id}
              stats={questStats[quest.id]}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AdminQuestCard({
  quest,
  onDelete,
  deleting = false,
  stats = null,
}: {
  quest: Quest
  onDelete: (id: string) => void
  deleting?: boolean
  stats?: any
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-blue-100 text-blue-800"
      case "hard":
        return "bg-orange-100 text-orange-800"
      case "expert":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadge = () => {
    const now = new Date()
    const startDate = new Date(quest.start_date)
    const endDate = quest.end_date ? new Date(quest.end_date) : null

    if (!quest.is_active) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800">
          Inactive
        </Badge>
      )
    }

    if (startDate > now) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          Upcoming
        </Badge>
      )
    }

    if (endDate && endDate < now) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800">
          Ended
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="bg-green-100 text-green-800">
        Active
      </Badge>
    )
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-1">{quest.title}</CardTitle>
          <div className="flex gap-1">
            {getStatusBadge()}
            {quest.is_featured && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Featured
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>Started {formatDate(quest.start_date)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 line-clamp-2 text-sm text-gray-600">{quest.description}</p>

        {stats && (
          <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md bg-blue-50 p-2 text-center">
              <div className="font-medium text-blue-700">
                <Users className="mr-1 inline h-3 w-3" />
                Participants
              </div>
              <div className="text-sm">{stats.participant_count || 0}</div>
            </div>
            <div className="rounded-md bg-green-50 p-2 text-center">
              <div className="font-medium text-green-700">
                <CheckCircle2 className="mr-1 inline h-3 w-3" />
                Completed
              </div>
              <div className="text-sm">{stats.completion_count || 0}</div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={getDifficultyColor(quest.difficulty)}>
            {quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)}
          </Badge>
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            <Award className="mr-1 h-3 w-3" /> {quest.points} points
          </Badge>
          {quest.end_date && (
            <Badge variant="outline" className="bg-blue-50 text-blue-800">
              <Clock className="mr-1 h-3 w-3" /> Ends {formatDate(quest.end_date)}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" className="flex-1" asChild>
          <Link href={`/dashboard/admin/quests/${quest.id}`}>View</Link>
        </Button>
        <Button variant="outline" className="flex-1" asChild>
          <Link href={`/dashboard/admin/quests/${quest.id}/edit`}>
            <Edit className="mr-1 h-4 w-4" /> Edit
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700">
              <Trash2 className="mr-1 h-4 w-4" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Quest</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this quest? This action cannot be undone and will remove all user
                progress for this quest.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(quest.id)}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Quest"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
