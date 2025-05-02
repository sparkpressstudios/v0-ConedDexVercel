import { TeamRanking } from "@/components/leaderboard/team-ranking"

import { Shell } from "@/components/shell"

interface Props {
  params: { id: string }
}

async function getTeam(id: string) {
  // Replace with your actual data fetching logic
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return {
    id,
    name: `Team ${id}`,
    description: `This is team ${id}'s description.`,
  }
}

export default async function TeamPage({ params }: Props) {
  const team = await getTeam(params.id)

  return (
    <Shell>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Existing components */}
        <TeamRanking teamId={team.id} />
      </div>
    </Shell>
  )
}
