import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const searchParams = request.nextUrl.searchParams
  const metricId = searchParams.get("metricId")
  const seasonId = searchParams.get("seasonId")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const offset = Number.parseInt(searchParams.get("offset") || "0")

  if (!metricId) {
    return NextResponse.json({ error: "metricId is required" }, { status: 400 })
  }

  let query

  if (seasonId) {
    query = supabase
      .from("seasonal_team_scores")
      .select(`
        id,
        score,
        teams:team_id (
          id,
          name,
          description,
          logo_url
        ),
        leaderboard_metrics:metric_id (
          name,
          description,
          icon
        ),
        leaderboard_seasons:season_id (
          name,
          description,
          start_date,
          end_date
        )
      `)
      .eq("season_id", seasonId)
      .eq("metric_id", metricId)
  } else {
    query = supabase
      .from("team_scores")
      .select(`
        id,
        score,
        teams:team_id (
          id,
          name,
          description,
          logo_url
        ),
        leaderboard_metrics:metric_id (
          name,
          description,
          icon
        )
      `)
      .eq("metric_id", metricId)
  }

  const { data, error } = await query.order("score", { ascending: false }).range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
