export type QuestDifficulty = "easy" | "medium" | "hard" | "expert"
export type QuestStatus = "in_progress" | "completed" | "abandoned"
export type ObjectiveType =
  | "visit_shop"
  | "try_flavor"
  | "try_flavor_category"
  | "visit_location"
  | "log_reviews"
  | "earn_points"
  | "custom"
export type RewardType = "badge" | "points" | "title" | "custom"

export interface Quest {
  id: string
  title: string
  description: string
  image_url?: string
  start_date: string
  end_date?: string
  is_active: boolean
  is_featured: boolean
  difficulty: QuestDifficulty
  points: number
  max_participants?: number
  created_at: string
  updated_at: string
  objectives?: QuestObjective[]
  rewards?: QuestReward[]
  participant_count?: number
  completion_rate?: number
}

export interface QuestObjective {
  id: string
  quest_id: string
  title: string
  description?: string
  objective_type: ObjectiveType
  target_count: number
  flavor_category?: string
  shop_id?: string
  location_radius?: number
  latitude?: number
  longitude?: number
  created_at: string
  updated_at: string
}

export interface UserQuest {
  id: string
  user_id: string
  quest_id: string
  joined_at: string
  completed_at?: string
  status: QuestStatus
  progress: Record<string, any>
  quest?: Quest
}

export interface QuestReward {
  id: string
  quest_id: string
  reward_type: RewardType
  badge_id?: string
  points?: number
  description?: string
  created_at: string
}

export interface QuestProgress {
  objective_id: string
  current_count: number
  is_completed: boolean
  last_updated: string
}
