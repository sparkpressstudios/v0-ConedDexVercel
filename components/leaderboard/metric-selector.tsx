"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MetricIcon } from "@/components/leaderboard/metric-icon"

interface MetricSelectorProps {
  metrics: Array<{ id: string; name: string; description: string; icon: string }>
  selectedMetric: string | null
  onSelectMetric: (metricId: string) => void
}

export function MetricSelector({ metrics, selectedMetric, onSelectMetric }: MetricSelectorProps) {
  if (!metrics || metrics.length === 0) {
    return null
  }

  return (
    <Select value={selectedMetric || undefined} onValueChange={onSelectMetric}>
      <SelectTrigger className="w-full sm:w-[200px]">
        <SelectValue placeholder="Select metric" />
      </SelectTrigger>
      <SelectContent>
        {metrics.map((metric) => (
          <SelectItem key={metric.id} value={metric.id}>
            <div className="flex items-center gap-2">
              <MetricIcon icon={metric.icon} className="h-4 w-4" />
              <span>{metric.name.replace(/_/g, " ")}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
