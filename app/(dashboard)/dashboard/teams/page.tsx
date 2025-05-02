"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserPlus, Trophy, Star, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function TeamsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  const [isJoiningTeam, setIsJoiningTeam] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [teamDescription, setTeamDescription] = useState("")
  const [inviteCode, setInviteCode] = useState("")

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real implementation, this would create a team in the database
    toast({
      title: "Team Created",
      description: `Your team "${teamName}" has been created successfully.`,
    })
    setIsCreatingTeam(false)
    setTeamName("")
    setTeamDescription("")
  }

  const handleJoinTeam = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real implementation, this would join a team using the invite code
    toast({
      title: "Team Joined",
      description: "You have successfully joined the team.",
    })
    setIsJoiningTeam(false)
    setInviteCode("")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">Create or join teams to track and share ice cream adventures</p>
        </div>
        <Dialog open={isCreatingTeam} onOpenChange={setIsCreatingTeam}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateTeam}>
              <DialogHeader>
                <DialogTitle>Create a New Team</DialogTitle>
                <DialogDescription>
                  Form a team with friends to track flavors together and compete for badges
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Ice Cream Enthusiasts"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="team-description">Description (Optional)</Label>
                  <Input
                    id="team-description"
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    placeholder="A team dedicated to finding the best ice cream flavors"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Team</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search teams..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Create Your First Team</CardTitle>
            <CardDescription>Start collaborating with friends on your ice cream journey</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex h-40 flex-col items-center justify-center rounded-md border-2 border-dashed p-4">
              <Users className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Create a team to track flavors together and compete for badges
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => setIsCreatingTeam(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Join Existing Team</CardTitle>
            <CardDescription>Join a team with an invitation code</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex h-40 flex-col items-center justify-center rounded-md border-2 border-dashed p-4">
              <UserPlus className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Enter an invitation code to join an existing team
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Dialog open={isJoiningTeam} onOpenChange={setIsJoiningTeam}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Join with Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleJoinTeam}>
                  <DialogHeader>
                    <DialogTitle>Join a Team</DialogTitle>
                    <DialogDescription>Enter the invitation code provided by the team owner</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="invite-code">Invitation Code</Label>
                      <Input
                        id="invite-code"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        placeholder="TEAM-123-ABC"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Join Team</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Team Leaderboard</CardTitle>
            <CardDescription>See the top teams in your area</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex h-40 flex-col items-center justify-center rounded-md border-2 border-dashed p-4">
              <Trophy className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-center text-sm text-muted-foreground">
                View the leaderboard to see how teams rank
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => (window.location.href = "/dashboard/leaderboard")}
            >
              <Star className="mr-2 h-4 w-4" />
              View Leaderboard
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Coming Soon</h2>
        <p className="mt-2 text-muted-foreground">
          Team features are currently in development. Create and join teams to track flavors together, earn team badges,
          and compete on leaderboards. Stay tuned for updates!
        </p>
      </div>
    </div>
  )
}
