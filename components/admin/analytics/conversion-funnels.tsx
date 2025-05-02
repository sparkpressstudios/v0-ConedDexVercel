"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ArrowRight, Download, Plus } from "lucide-react"

// Sample funnel data
const signupFunnelData = [
  { step: "Visit Homepage", count: 5280, percentage: 100 },
  { step: "View Signup Page", count: 2112, percentage: 40 },
  { step: "Start Registration", count: 1584, percentage: 30 },
  { step: "Complete Registration", count: 1056, percentage: 20 },
  { step: "Verify Email", count: 792, percentage: 15 },
  { step: "Complete Profile", count: 528, percentage: 10 },
]

const shopClaimFunnelData = [
  { step: "Visit Business Page", count: 1200, percentage: 100 },
  { step: "Search for Shop", count: 840, percentage: 70 },
  { step: "Start Claim Process", count: 480, percentage: 40 },
  { step: "Submit Verification", count: 360, percentage: 30 },
  { step: "Verification Approved", count: 240, percentage: 20 },
]

const subscriptionFunnelData = [
  { step: "View Subscription Page", count: 950, percentage: 100 },
  { step: "View Pricing Details", count: 665, percentage: 70 },
  { step: "Start Checkout", count: 380, percentage: 40 },
  { step: "Enter Payment Info", count: 285, percentage: 30 },
  { step: "Complete Purchase", count: 190, percentage: 20 },
]

export function ConversionFunnels() {
  const [timeframe, setTimeframe] = useState("30d")

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Conversion Funnels</CardTitle>
          <CardDescription>Track user progression through key workflows</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" /> New Funnel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signup" className="space-y-4">
          <TabsList>
            <TabsTrigger value="signup">User Signup</TabsTrigger>
            <TabsTrigger value="shopClaim">Shop Claiming</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="signup">
            <FunnelVisualization data={signupFunnelData} />
          </TabsContent>

          <TabsContent value="shopClaim">
            <FunnelVisualization data={shopClaimFunnelData} />
          </TabsContent>

          <TabsContent value="subscription">
            <FunnelVisualization data={subscriptionFunnelData} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" /> Export Data
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function FunnelVisualization({ data }: { data: { step: string; count: number; percentage: number }[] }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2">
        {data.map((step, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="font-medium">{step.step}</span>
                {index < data.length - 1 && <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />}
              </div>
              <div className="text-sm">
                {step.count.toLocaleString()} users ({step.percentage}%)
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: `${step.percentage}%` }}></div>
            </div>
            {index < data.length - 1 && (
              <div className="flex justify-center text-sm text-muted-foreground">
                {((data[index + 1].count / step.count) * 100).toFixed(1)}% conversion to next step
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Funnel Insights</h4>
        <ul className="space-y-1 text-sm">
          <li>• Overall conversion rate: {data[data.length - 1].percentage}%</li>
          <li>• Biggest drop-off: {findBiggestDropoff(data)}</li>
          <li>• Recommended focus area: {getRecommendation(data)}</li>
        </ul>
      </div>
    </div>
  )
}

function findBiggestDropoff(data: { step: string; count: number; percentage: number }[]) {
  let biggestDropIndex = 0
  let biggestDropPercentage = 0

  for (let i = 0; i < data.length - 1; i++) {
    const dropPercentage = data[i].count - data[i + 1].count
    const dropRate = dropPercentage / data[i].count

    if (dropRate > biggestDropPercentage) {
      biggestDropPercentage = dropRate
      biggestDropIndex = i
    }
  }

  return `${data[biggestDropIndex].step} to ${data[biggestDropIndex + 1].step} (${(biggestDropPercentage * 100).toFixed(1)}% drop)`
}

function getRecommendation(data: { step: string; count: number; percentage: number }[]) {
  let biggestDropIndex = 0
  let biggestDropPercentage = 0

  for (let i = 0; i < data.length - 1; i++) {
    const dropPercentage = data[i].count - data[i + 1].count
    const dropRate = dropPercentage / data[i].count

    if (dropRate > biggestDropPercentage) {
      biggestDropPercentage = dropRate
      biggestDropIndex = i
    }
  }

  return `Optimize the ${data[biggestDropIndex + 1].step.toLowerCase()} experience`
}

// Let's create a component for user segmentation:
