import { createClient } from "@/lib/supabase/server"

// Interface for flavor data
interface FlavorData {
  id: string
  name: string
  description: string
  image_url?: string
  category?: string
  tags?: string[]
  created_at: string
  shop_id?: string
  shop_name?: string
}

// Interface for flavor similarity result
interface SimilarityResult {
  id: string
  name: string
  similarity: number
  category: string
}

// Interface for flavor statistics
interface FlavorStatistics {
  totalCaptures: number
  uniqueShops: number
  topShops: {
    id: string
    name: string
    count: number
  }[]
  averageRating: number
  popularityTrend: "rising" | "stable" | "declining"
  firstLogged: string
  lastLogged: string
}

/**
 * Detects potential duplicate flavors based on name and description similarity
 */
export async function detectDuplicateFlavors(
  name: string,
  description: string,
  threshold = 0.8,
): Promise<SimilarityResult[]> {
  const supabase = createClient()

  try {
    // Get all flavors from the database
    const { data: flavors, error } = await supabase.from("flavors").select("id, name, description, category")

    if (error) throw error

    // Simple similarity calculation based on string comparison
    // In a production environment, this would use a more sophisticated algorithm or AI service
    const similarFlavors = flavors
      .map((flavor) => {
        // Calculate name similarity (case insensitive)
        const nameSimilarity = calculateStringSimilarity(name.toLowerCase(), flavor.name.toLowerCase())

        // Calculate description similarity if both exist
        const descSimilarity =
          description && flavor.description
            ? calculateStringSimilarity(description.toLowerCase(), flavor.description.toLowerCase())
            : 0

        // Combined similarity score (weighted more towards name)
        const similarity = nameSimilarity * 0.7 + descSimilarity * 0.3

        return {
          id: flavor.id,
          name: flavor.name,
          similarity,
          category: flavor.category || "unknown",
        }
      })
      .filter((result) => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5) // Return top 5 matches

    return similarFlavors
  } catch (error) {
    console.error("Error detecting duplicate flavors:", error)
    return []
  }
}

/**
 * Gets statistics for a specific flavor across all users
 */
export async function getFlavorStatistics(flavorId: string): Promise<FlavorStatistics | null> {
  const supabase = createClient()

  try {
    // Get all logs for this flavor
    const { data: logs, error } = await supabase
      .from("flavor_logs")
      .select(`
        id,
        rating,
        date_logged,
        shop_id,
        shops (
          id,
          name
        )
      `)
      .eq("flavor_id", flavorId)

    if (error) throw error

    if (!logs || logs.length === 0) {
      return null
    }

    // Calculate statistics
    const totalCaptures = logs.length

    // Get unique shops
    const shops = logs
      .filter((log) => log.shop_id)
      .map((log) => ({
        id: log.shop_id,
        name: log.shops?.name || "Unknown Shop",
      }))

    const uniqueShopIds = [...new Set(shops.map((shop) => shop.id))]
    const uniqueShops = uniqueShopIds.length

    // Count occurrences of each shop
    const shopCounts = shops.reduce(
      (acc, shop) => {
        acc[shop.id] = (acc[shop.id] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Get top shops
    const topShops = Object.entries(shopCounts)
      .map(([id, count]) => ({
        id,
        name: shops.find((shop) => shop.id === id)?.name || "Unknown Shop",
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    // Calculate average rating
    const ratings = logs.filter((log) => log.rating).map((log) => log.rating)
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0

    // Sort logs by date
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date_logged).getTime() - new Date(b.date_logged).getTime())

    const firstLogged = sortedLogs[0]?.date_logged || ""
    const lastLogged = sortedLogs[sortedLogs.length - 1]?.date_logged || ""

    // Determine popularity trend (simplified)
    // In a real implementation, this would use more sophisticated time-series analysis
    const now = new Date()
    const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1))
    const twoMonthsAgo = new Date(now.setMonth(now.getMonth() - 1))

    const recentLogs = logs.filter((log) => new Date(log.date_logged) >= oneMonthAgo).length

    const olderLogs = logs.filter(
      (log) => new Date(log.date_logged) >= twoMonthsAgo && new Date(log.date_logged) < oneMonthAgo,
    ).length

    let popularityTrend: "rising" | "stable" | "declining" = "stable"

    if (recentLogs > olderLogs * 1.2) {
      popularityTrend = "rising"
    } else if (recentLogs < olderLogs * 0.8) {
      popularityTrend = "declining"
    }

    return {
      totalCaptures,
      uniqueShops,
      topShops,
      averageRating,
      popularityTrend,
      firstLogged,
      lastLogged,
    }
  } catch (error) {
    console.error("Error getting flavor statistics:", error)
    return null
  }
}

/**
 * Gets global flavor statistics across all users
 */
export async function getGlobalFlavorStatistics() {
  const supabase = createClient()

  try {
    // Get all flavors with their logs count
    const { data, error } = await supabase.from("flavors").select(`
        id,
        name,
        category,
        image_url,
        flavor_logs (count)
      `)

    if (error) throw error

    // Transform the data
    const flavorsWithStats = await Promise.all(
      data.map(async (flavor) => {
        const stats = await getFlavorStatistics(flavor.id)

        return {
          id: flavor.id,
          name: flavor.name,
          category: flavor.category,
          image_url: flavor.image_url,
          captureCount: flavor.flavor_logs.count,
          stats,
        }
      }),
    )

    // Sort by capture count
    return flavorsWithStats.sort((a, b) => b.captureCount - a.captureCount)
  } catch (error) {
    console.error("Error getting global flavor statistics:", error)
    return []
  }
}

/**
 * Calculate string similarity using Levenshtein distance
 * Returns a value between 0 (completely different) and 1 (identical)
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i
  }

  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      )
    }
  }

  const distance = track[str2.length][str1.length]
  const maxLength = Math.max(str1.length, str2.length)

  if (maxLength === 0) return 1.0

  return 1.0 - distance / maxLength
}
