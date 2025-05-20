"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { getAllQuests, getQuestStatistics } from "@/app/actions/quest-actions"
import { toast } from "@/components/ui/use-toast"

export function QuestAnalytics() {
  const [loading, setLoading] = useState(true)
  const [quests, setQuests] = useState<any[]>([])
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null)
  const [statistics, setStatistics] = useState<any>(null)
  const [timeRange, setTimeRange] = useState("all")

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
      } else if (data && data.length > 0) {
        setQuests(data)
        setSelectedQuest(data[0].id)
      }

      setLoading(false)
    }

    loadQuests()
  }, [])

  useEffect(() => {
    async function loadStatistics() {
      if (!selectedQuest) return

      setLoading(true)
      const { data, error } = await getQuestStatistics(selectedQuest)

      if (error) {
        toast({
          title: "Error loading quest statistics",
          description: error,
          variant: "destructive",
        })
      } else if (data) {
        setStatistics(data)
      }

      setLoading(false)
    }

    loadStatistics()
  }, [selectedQuest])

  if (loading && !quests.length) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!quests.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quest Analytics</CardTitle>
          <CardDescription>No quests available for analysis</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Create quests to see analytics data</p>
        </CardContent>
      </Card>
    )
  }

  const selectedQuestData = quests.find((q) => q.id === selectedQuest)

  // Prepare data for charts
  const statusData = statistics
    ? [
        { name: "Completed", value: statistics.completion_count, color: "#10b981" },
        { name: "In Progress", value: statistics.in_progress_count, color: "#3b82f6" },
        { name: "Abandoned", value: statistics.abandonment_count, color: "#ef4444" },
      ]
    : []

  const completionRateData = statistics
    ? [
        { name: "Completion Rate", rate: statistics.completion_rate },
        { name: "Abandonment Rate", rate: statistics.abandonment_rate },
      ]
    : []

  const COLORS = ["#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6"]

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Quest Analytics</CardTitle>
            <CardDescription>Track quest participation and completion rates</CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedQuest || ""} onValueChange={setSelectedQuest}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a quest" />
              </SelectTrigger>
              <SelectContent>
                {quests.map((quest) => (
                  <SelectItem key={quest.id} value={quest.id}>
                    {quest.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : statistics ? (
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="completion">Completion Rate</TabsTrigger>
              <TabsTrigger value="status">Status Distribution</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Participants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.participant_count}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.completion_rate.toFixed(1)}%</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Abandonment Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.abandonment_rate.toFixed(1)}%</div>
                  </CardContent>
                </Card>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Total", value: statistics.participant_count },
                      { name: "Completed", value: statistics.completion_count },
                      { name: "In Progress", value: statistics.in_progress_count },
                      { name: "Abandoned", value: statistics.abandonment_count },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="completion">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionRateData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, "Rate"]} />
                    <Bar dataKey="rate" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="status">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Count"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Select a quest to view analytics</p>
          </div>
        )}

        {selectedQuestData && (
          <div className="mt-6 border-t pt-4">
            <h3 className="font-medium mb-2">{selectedQuestData.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{selectedQuestData.description}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{selectedQuestData.difficulty}</span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">{selectedQuestData.points} points</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                {selectedQuestData.objectives?.length || 0} objectives
              </span>
              <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded">
                {selectedQuestData.rewards?.length || 0} rewards
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
