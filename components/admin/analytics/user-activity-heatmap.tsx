"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

// Sample data - in a real app, this would come from the database
const heatmapData = [
  {
    day: "Monday",
    "00:00": 5,
    "01:00": 3,
    "02:00": 2,
    "03:00": 1,
    "04:00": 1,
    "05:00": 2,
    "06:00": 5,
    "07:00": 10,
    "08:00": 20,
    "09:00": 35,
    "10:00": 45,
    "11:00": 50,
    "12:00": 55,
    "13:00": 52,
    "14:00": 48,
    "15:00": 45,
    "16:00": 40,
    "17:00": 35,
    "18:00": 30,
    "19:00": 25,
    "20:00": 20,
    "21:00": 15,
    "22:00": 10,
    "23:00": 7,
  },
  {
    day: "Tuesday",
    "00:00": 4,
    "01:00": 2,
    "02:00": 1,
    "03:00": 1,
    "04:00": 1,
    "05:00": 3,
    "06:00": 6,
    "07:00": 12,
    "08:00": 25,
    "09:00": 40,
    "10:00": 50,
    "11:00": 55,
    "12:00": 58,
    "13:00": 55,
    "14:00": 50,
    "15:00": 48,
    "16:00": 42,
    "17:00": 38,
    "18:00": 32,
    "19:00": 28,
    "20:00": 22,
    "21:00": 16,
    "22:00": 12,
    "23:00": 8,
  },
  {
    day: "Wednesday",
    "00:00": 5,
    "01:00": 3,
    "02:00": 2,
    "03:00": 1,
    "04:00": 1,
    "05:00": 3,
    "06:00": 7,
    "07:00": 15,
    "08:00": 28,
    "09:00": 42,
    "10:00": 52,
    "11:00": 58,
    "12:00": 60,
    "13:00": 58,
    "14:00": 52,
    "15:00": 50,
    "16:00": 45,
    "17:00": 40,
    "18:00": 35,
    "19:00": 30,
    "20:00": 25,
    "21:00": 18,
    "22:00": 14,
    "23:00": 9,
  },
  {
    day: "Thursday",
    "00:00": 6,
    "01:00": 4,
    "02:00": 2,
    "03:00": 1,
    "04:00": 1,
    "05:00": 3,
    "06:00": 8,
    "07:00": 16,
    "08:00": 30,
    "09:00": 45,
    "10:00": 55,
    "11:00": 60,
    "12:00": 62,
    "13:00": 60,
    "14:00": 55,
    "15:00": 52,
    "16:00": 48,
    "17:00": 42,
    "18:00": 38,
    "19:00": 32,
    "20:00": 28,
    "21:00": 20,
    "22:00": 15,
    "23:00": 10,
  },
  {
    day: "Friday",
    "00:00": 7,
    "01:00": 5,
    "02:00": 3,
    "03:00": 2,
    "04:00": 2,
    "05:00": 4,
    "06:00": 9,
    "07:00": 18,
    "08:00": 32,
    "09:00": 48,
    "10:00": 58,
    "11:00": 62,
    "12:00": 65,
    "13:00": 62,
    "14:00": 58,
    "15:00": 55,
    "16:00": 50,
    "17:00": 45,
    "18:00": 40,
    "19:00": 35,
    "20:00": 30,
    "21:00": 25,
    "22:00": 20,
    "23:00": 15,
  },
  {
    day: "Saturday",
    "00:00": 10,
    "01:00": 8,
    "02:00": 6,
    "03:00": 5,
    "04:00": 4,
    "05:00": 5,
    "06:00": 8,
    "07:00": 12,
    "08:00": 18,
    "09:00": 25,
    "10:00": 35,
    "11:00": 45,
    "12:00": 50,
    "13:00": 52,
    "14:00": 50,
    "15:00": 48,
    "16:00": 45,
    "17:00": 42,
    "18:00": 40,
    "19:00": 38,
    "20:00": 35,
    "21:00": 30,
    "22:00": 25,
    "23:00": 20,
  },
  {
    day: "Sunday",
    "00:00": 12,
    "01:00": 10,
    "02:00": 8,
    "03:00": 6,
    "04:00": 5,
    "05:00": 6,
    "06:00": 8,
    "07:00": 10,
    "08:00": 15,
    "09:00": 20,
    "10:00": 30,
    "11:00": 40,
    "12:00": 45,
    "13:00": 48,
    "14:00": 45,
    "15:00": 42,
    "16:00": 40,
    "17:00": 38,
    "18:00": 35,
    "19:00": 32,
    "20:00": 30,
    "21:00": 25,
    "22:00": 20,
    "23:00": 15,
  },
]

const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`)

export function UserActivityHeatmap() {
  const [timeframe, setTimeframe] = useState("30d")

  // Function to determine cell color based on value
  const getCellColor = (value: number) => {
    const maxValue = 65 // Maximum value in our dataset
    const intensity = Math.min(value / maxValue, 1)
    return `rgba(var(--primary-rgb), ${intensity})`
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Activity Heatmap</CardTitle>
          <CardDescription>Activity patterns by day and hour</CardDescription>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 border-b">Day</th>
                {hours.map((hour) => (
                  <th key={hour} className="p-2 border-b text-center w-10">
                    {hour}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row) => (
                <tr key={row.day}>
                  <td className="p-2 border-b font-medium">{row.day}</td>
                  {hours.map((hour) => (
                    <td
                      key={hour}
                      className="p-2 border-b text-center"
                      style={{
                        backgroundColor: getCellColor(row[hour as keyof typeof row] as number),
                        color: (row[hour as keyof typeof row] as number) > 40 ? "white" : "inherit",
                      }}
                    >
                      {row[hour as keyof typeof row]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
