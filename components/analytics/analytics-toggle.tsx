"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function AnalyticsToggle() {
  const [isEnabled, setIsEnabled] = useState<boolean>(true)

  useEffect(() => {
    try {
      const disabled = localStorage.getItem("conedex_analytics_disabled") === "true"
      setIsEnabled(!disabled)
    } catch (error) {
      console.warn("Error reading analytics preferences:", error)
    }
  }, [])

  const toggleAnalytics = () => {
    try {
      const newValue = !isEnabled
      localStorage.setItem("conedex_analytics_disabled", newValue ? "false" : "true")
      setIsEnabled(newValue)
    } catch (error) {
      console.warn("Error saving analytics preferences:", error)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch id="analytics-mode" checked={isEnabled} onCheckedChange={toggleAnalytics} />
      <Label htmlFor="analytics-mode">Analytics {isEnabled ? "Enabled" : "Disabled"}</Label>
    </div>
  )
}
