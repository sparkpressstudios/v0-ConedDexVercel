"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { Plus, Save, X, BarChart } from "lucide-react"

// Sample segments
const predefinedSegments = [
  { id: 1, name: "Power Users", description: "Users with 10+ sessions per week", count: 245 },
  { id: 2, name: "New Users", description: "Joined in the last 30 days", count: 512 },
  { id: 3, name: "Inactive Users", description: "No activity in 14+ days", count: 189 },
  { id: 4, name: "Shop Owners", description: "Users who have claimed a shop", count: 78 },
  { id: 5, name: "Premium Subscribers", description: "Users on paid subscription plans", count: 156 },
]

export function UserSegments() {
  const [segments, setSegments] = useState(predefinedSegments)
  const [activeSegment, setActiveSegment] = useState<number | null>(null)
  const [newSegmentName, setNewSegmentName] = useState("")
  const [filters, setFilters] = useState<{ property: string; operator: string; value: string }[]>([
    { property: "sessions", operator: "gt", value: "10" },
  ])

  const handleAddFilter = () => {
    setFilters([...filters, { property: "sessions", operator: "eq", value: "" }])
  }

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  const handleFilterChange = (index: number, field: string, value: string) => {
    const newFilters = [...filters]
    newFilters[index] = { ...newFilters[index], [field]: value }
    setFilters(newFilters)
  }

  const handleSaveSegment = () => {
    if (!newSegmentName) return

    const newSegment = {
      id: segments.length + 1,
      name: newSegmentName,
      description: `Custom segment with ${filters.length} filters`,
      count: Math.floor(Math.random() * 500), // In a real app, this would be calculated
    }

    setSegments([...segments, newSegment])
    setNewSegmentName("")
    setFilters([{ property: "sessions", operator: "gt", value: "10" }])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Segments</CardTitle>
        <CardDescription>Create and analyze specific user segments</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="existing" className="space-y-4">
          <TabsList>
            <TabsTrigger value="existing">Existing Segments</TabsTrigger>
            <TabsTrigger value="create">Create Segment</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-4">
            <div className="grid gap-4">
              {segments.map((segment) => (
                <div
                  key={segment.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    activeSegment === segment.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setActiveSegment(segment.id === activeSegment ? null : segment.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{segment.name}</h3>
                      <p className="text-sm text-muted-foreground">{segment.description}</p>
                    </div>
                    <Badge variant="outline">{segment.count} users</Badge>
                  </div>
                </div>
              ))}
            </div>

            {activeSegment && (
              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  <BarChart className="h-4 w-4 mr-1" /> View Analytics
                </Button>
                <Button>Export Segment</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="segment-name">Segment Name</Label>
                <Input
                  id="segment-name"
                  placeholder="e.g., Power Users"
                  value={newSegmentName}
                  onChange={(e) => setNewSegmentName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Filters</Label>
                  <Button variant="outline" size="sm" onClick={handleAddFilter}>
                    <Plus className="h-4 w-4 mr-1" /> Add Filter
                  </Button>
                </div>

                <div className="space-y-2">
                  {filters.map((filter, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Select
                        value={filter.property}
                        onValueChange={(value) => handleFilterChange(index, "property", value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Property" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sessions">Sessions</SelectItem>
                          <SelectItem value="lastActive">Last Active</SelectItem>
                          <SelectItem value="registrationDate">Registration Date</SelectItem>
                          <SelectItem value="platform">Platform</SelectItem>
                          <SelectItem value="subscriptionTier">Subscription Tier</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={filter.operator}
                        onValueChange={(value) => handleFilterChange(index, "operator", value)}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="eq">Equals</SelectItem>
                          <SelectItem value="gt">Greater than</SelectItem>
                          <SelectItem value="lt">Less than</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        value={filter.value}
                        onChange={(e) => handleFilterChange(index, "value", e.target.value)}
                        placeholder="Value"
                      />

                      <Button variant="ghost" size="icon" onClick={() => handleRemoveFilter(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Preview Results</Button>
                <Button onClick={handleSaveSegment} disabled={!newSegmentName}>
                  <Save className="h-4 w-4 mr-1" /> Save Segment
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
