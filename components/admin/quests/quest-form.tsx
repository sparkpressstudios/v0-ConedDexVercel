"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, MinusCircle, Save, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { createQuest, updateQuest, getQuestById } from "@/app/actions/quest-actions"
import { toast } from "@/components/ui/use-toast"
import type { Quest, QuestObjective, QuestReward } from "@/types/quests"

type FormMode = "create" | "edit"

export function QuestForm({
  mode = "create",
  questId = "",
}: {
  mode?: FormMode
  questId?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(mode === "edit")
  const [saving, setSaving] = useState(false)

  // Quest form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [difficulty, setDifficulty] = useState<string>("medium")
  const [points, setPoints] = useState(100)
  const [maxParticipants, setMaxParticipants] = useState<number | undefined>(undefined)

  // Objectives and rewards
  const [objectives, setObjectives] = useState<Partial<QuestObjective>[]>([
    { title: "", description: "", objective_type: "try_flavor", target_count: 1 },
  ])
  const [rewards, setRewards] = useState<Partial<QuestReward>[]>([
    { reward_type: "points", points: 100, description: "Completion reward" },
  ])

  useEffect(() => {
    if (mode === "edit" && questId) {
      async function loadQuest() {
        setLoading(true)
        const { data, error } = await getQuestById(questId)
        if (error) {
          toast({
            title: "Error loading quest",
            description: error,
            variant: "destructive",
          })
          router.push("/dashboard/admin/quests")
        } else if (data) {
          // Set quest data
          setTitle(data.title)
          setDescription(data.description)
          setStartDate(new Date(data.start_date))
          setEndDate(data.end_date ? new Date(data.end_date) : undefined)
          setIsActive(data.is_active)
          setIsFeatured(data.is_featured)
          setDifficulty(data.difficulty)
          setPoints(data.points)
          setMaxParticipants(data.max_participants)

          // Set objectives and rewards
          if (data.objectives && data.objectives.length > 0) {
            setObjectives(
              data.objectives.map((obj) => ({
                id: obj.id,
                title: obj.title,
                description: obj.description,
                objective_type: obj.objective_type,
                target_count: obj.target_count,
                flavor_category: obj.flavor_category,
                shop_id: obj.shop_id,
                location_radius: obj.location_radius,
                latitude: obj.latitude,
                longitude: obj.longitude,
              })),
            )
          }

          if (data.rewards && data.rewards.length > 0) {
            setRewards(
              data.rewards.map((reward) => ({
                id: reward.id,
                reward_type: reward.reward_type,
                badge_id: reward.badge_id,
                points: reward.points,
                description: reward.description,
              })),
            )
          }
        }
        setLoading(false)
      }

      loadQuest()
    }
  }, [mode, questId, router])

  const handleAddObjective = () => {
    setObjectives([...objectives, { title: "", description: "", objective_type: "try_flavor", target_count: 1 }])
  }

  const handleRemoveObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index))
  }

  const handleObjectiveChange = (index: number, field: string, value: any) => {
    const updatedObjectives = [...objectives]
    updatedObjectives[index] = { ...updatedObjectives[index], [field]: value }
    setObjectives(updatedObjectives)
  }

  const handleAddReward = () => {
    setRewards([...rewards, { reward_type: "points", points: 50, description: "" }])
  }

  const handleRemoveReward = (index: number) => {
    setRewards(rewards.filter((_, i) => i !== index))
  }

  const handleRewardChange = (index: number, field: string, value: any) => {
    const updatedRewards = [...rewards]
    updatedRewards[index] = { ...updatedRewards[index], [field]: value }
    setRewards(updatedRewards)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Validate form
    if (!title || !description || !startDate || objectives.length === 0 || rewards.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      setSaving(false)
      return
    }

    // Validate objectives
    for (const obj of objectives) {
      if (!obj.title || !obj.target_count) {
        toast({
          title: "Validation Error",
          description: "Please fill in all objective fields.",
          variant: "destructive",
        })
        setSaving(false)
        return
      }
    }

    // Prepare quest data
    const questData: Partial<Quest> = {
      title,
      description,
      start_date: startDate.toISOString(),
      end_date: endDate?.toISOString(),
      is_active: isActive,
      is_featured: isFeatured,
      difficulty: difficulty as any,
      points,
      max_participants: maxParticipants,
    }

    try {
      if (mode === "create") {
        // Create new quest
        const { data, error } = await createQuest(questData, objectives, rewards)
        if (error) {
          throw new Error(error)
        }

        toast({
          title: "Quest Created",
          description: "The quest has been successfully created.",
        })

        router.push("/dashboard/admin/quests")
      } else {
        // Update existing quest
        const { data, error } = await updateQuest(questId, questData, objectives, rewards)
        if (error) {
          throw new Error(error)
        }

        toast({
          title: "Quest Updated",
          description: "The quest has been successfully updated.",
        })

        router.push(`/dashboard/admin/quests/${questId}`)
      }
    } catch (error) {
      toast({
        title: `Failed to ${mode === "create" ? "create" : "update"} quest`,
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Loading Quest...</CardTitle>
            <CardDescription>Please wait while we load the quest data.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "Create New Quest" : "Edit Quest"}</CardTitle>
          <CardDescription>
            {mode === "create"
              ? "Create a new quest for users to complete and earn rewards."
              : "Edit the details of this quest."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quest Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quest title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter quest description"
              required
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date *</Label>
              <DatePicker date={startDate} setDate={setStartDate} className="w-full" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date (Optional)</Label>
              <DatePicker date={endDate} setDate={setEndDate} className="w-full" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty *</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Points *</Label>
              <Input
                id="points"
                type="number"
                value={points}
                onChange={(e) => setPoints(Number.parseInt(e.target.value) || 0)}
                min={0}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="max-participants">Max Participants (Optional)</Label>
              <Input
                id="max-participants"
                type="number"
                value={maxParticipants || ""}
                onChange={(e) => setMaxParticipants(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                min={0}
                placeholder="Unlimited"
              />
            </div>

            <div className="flex flex-col justify-end space-y-2">
              <div className="flex items-center space-x-2">
                <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
                <Label htmlFor="is-active">Active</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="is-featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
                <Label htmlFor="is-featured">Featured</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quest Objectives</span>
            <Button type="button" variant="outline" size="sm" onClick={handleAddObjective}>
              <PlusCircle className="mr-1 h-4 w-4" /> Add Objective
            </Button>
          </CardTitle>
          <CardDescription>Define what users need to do to complete this quest.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {objectives.map((objective, index) => (
            <div key={index} className="rounded-lg border p-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-medium">Objective {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveObjective(index)}
                  disabled={objectives.length <= 1}
                >
                  <MinusCircle className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`objective-title-${index}`}>Title *</Label>
                  <Input
                    id={`objective-title-${index}`}
                    value={objective.title}
                    onChange={(e) => handleObjectiveChange(index, "title", e.target.value)}
                    placeholder="Enter objective title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`objective-description-${index}`}>Description</Label>
                  <Textarea
                    id={`objective-description-${index}`}
                    value={objective.description || ""}
                    onChange={(e) => handleObjectiveChange(index, "description", e.target.value)}
                    placeholder="Enter objective description"
                    rows={2}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`objective-type-${index}`}>Type *</Label>
                    <Select
                      value={objective.objective_type as string}
                      onValueChange={(value) => handleObjectiveChange(index, "objective_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="try_flavor">Try Flavor</SelectItem>
                        <SelectItem value="try_flavor_category">Try Flavor Category</SelectItem>
                        <SelectItem value="visit_shop">Visit Shop</SelectItem>
                        <SelectItem value="visit_location">Visit Location</SelectItem>
                        <SelectItem value="log_reviews">Log Reviews</SelectItem>
                        <SelectItem value="earn_points">Earn Points</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`objective-target-${index}`}>Target Count *</Label>
                    <Input
                      id={`objective-target-${index}`}
                      type="number"
                      value={objective.target_count}
                      onChange={(e) =>
                        handleObjectiveChange(index, "target_count", Number.parseInt(e.target.value) || 1)
                      }
                      min={1}
                      required
                    />
                  </div>
                </div>

                {/* Additional fields based on objective type */}
                {objective.objective_type === "try_flavor_category" && (
                  <div className="space-y-2">
                    <Label htmlFor={`objective-category-${index}`}>Flavor Category</Label>
                    <Input
                      id={`objective-category-${index}`}
                      value={objective.flavor_category || ""}
                      onChange={(e) => handleObjectiveChange(index, "flavor_category", e.target.value)}
                      placeholder="e.g., Chocolate, Fruit, etc."
                    />
                  </div>
                )}

                {objective.objective_type === "visit_shop" && (
                  <div className="space-y-2">
                    <Label htmlFor={`objective-shop-${index}`}>Shop ID</Label>
                    <Input
                      id={`objective-shop-${index}`}
                      value={objective.shop_id || ""}
                      onChange={(e) => handleObjectiveChange(index, "shop_id", e.target.value)}
                      placeholder="Enter shop ID"
                    />
                  </div>
                )}

                {objective.objective_type === "visit_location" && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor={`objective-latitude-${index}`}>Latitude</Label>
                      <Input
                        id={`objective-latitude-${index}`}
                        type="number"
                        step="0.000001"
                        value={objective.latitude || ""}
                        onChange={(e) =>
                          handleObjectiveChange(index, "latitude", Number.parseFloat(e.target.value) || 0)
                        }
                        placeholder="Latitude"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`objective-longitude-${index}`}>Longitude</Label>
                      <Input
                        id={`objective-longitude-${index}`}
                        type="number"
                        step="0.000001"
                        value={objective.longitude || ""}
                        onChange={(e) =>
                          handleObjectiveChange(index, "longitude", Number.parseFloat(e.target.value) || 0)
                        }
                        placeholder="Longitude"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`objective-radius-${index}`}>Radius (meters)</Label>
                      <Input
                        id={`objective-radius-${index}`}
                        type="number"
                        value={objective.location_radius || ""}
                        onChange={(e) =>
                          handleObjectiveChange(index, "location_radius", Number.parseInt(e.target.value) || 100)
                        }
                        placeholder="Radius in meters"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {objectives.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <h3 className="mb-2 text-lg font-medium">No objectives</h3>
              <p className="text-muted-foreground">Add at least one objective for this quest.</p>
              <Button type="button" onClick={handleAddObjective} className="mt-4">
                <PlusCircle className="mr-1 h-4 w-4" /> Add Objective
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Quest Rewards</span>
            <Button type="button" variant="outline" size="sm" onClick={handleAddReward}>
              <PlusCircle className="mr-1 h-4 w-4" /> Add Reward
            </Button>
          </CardTitle>
          <CardDescription>Define what users will receive upon completing this quest.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rewards.map((reward, index) => (
            <div key={index} className="rounded-lg border p-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-medium">Reward {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveReward(index)}
                  disabled={rewards.length <= 1}
                >
                  <MinusCircle className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`reward-type-${index}`}>Reward Type *</Label>
                  <Select
                    value={reward.reward_type as string}
                    onValueChange={(value) => handleRewardChange(index, "reward_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="points">Points</SelectItem>
                      <SelectItem value="badge">Badge</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {reward.reward_type === "points" && (
                  <div className="space-y-2">
                    <Label htmlFor={`reward-points-${index}`}>Points *</Label>
                    <Input
                      id={`reward-points-${index}`}
                      type="number"
                      value={reward.points || 0}
                      onChange={(e) => handleRewardChange(index, "points", Number.parseInt(e.target.value) || 0)}
                      min={0}
                      required
                    />
                  </div>
                )}

                {reward.reward_type === "badge" && (
                  <div className="space-y-2">
                    <Label htmlFor={`reward-badge-${index}`}>Badge ID *</Label>
                    <Input
                      id={`reward-badge-${index}`}
                      value={reward.badge_id || ""}
                      onChange={(e) => handleRewardChange(index, "badge_id", e.target.value)}
                      placeholder="Enter badge ID"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor={`reward-description-${index}`}>Description</Label>
                  <Input
                    id={`reward-description-${index}`}
                    value={reward.description || ""}
                    onChange={(e) => handleRewardChange(index, "description", e.target.value)}
                    placeholder="Enter reward description"
                  />
                </div>
              </div>
            </div>
          ))}

          {rewards.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <h3 className="mb-2 text-lg font-medium">No rewards</h3>
              <p className="text-muted-foreground">Add at least one reward for this quest.</p>
              <Button type="button" onClick={handleAddReward} className="mt-4">
                <PlusCircle className="mr-1 h-4 w-4" /> Add Reward
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-1 h-4 w-4" />
              {mode === "create" ? "Create Quest" : "Update Quest"}
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
          <X className="mr-1 h-4 w-4" /> Cancel
        </Button>
      </div>
    </form>
  )
}
