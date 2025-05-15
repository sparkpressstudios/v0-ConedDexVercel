import type { Metadata } from "next"
import { UserLeaderboard } from "@/components/leaderboard/user-leaderboard"
import { TeamLeaderboard } from "@/components/leaderboard/team-leaderboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Users, Info } from "lucide-react"

export const metadata: Metadata = {
  title: "Leaderboard | ConeDex",
  description: "See how you rank against other ice cream explorers",
}

export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">See how you rank against other ice cream explorers</p>
      </div>

      <Card className="bg-muted/40">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Info className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">
                Leaderboards are updated every hour. Log more flavors, visit more shops, and earn badges to climb the
                ranks!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>Individual Rankings</span>
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Team Rankings</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <UserLeaderboard />
        </TabsContent>
        <TabsContent value="teams" className="space-y-4">
          <TeamLeaderboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
