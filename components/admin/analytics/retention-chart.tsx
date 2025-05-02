"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

// Sample data - in a real app, this would come from the database
const retentionData = [
  [100, 80, 70, 65, 60, 55, 52, 50],
  [100, 82, 72, 68, 62, 58, 55, 0],
  [100, 85, 75, 70, 65, 60, 0, 0],
  [100, 83, 73, 68, 63, 0, 0, 0],
  [100, 87, 78, 72, 0, 0, 0, 0],
  [100, 88, 80, 0, 0, 0, 0, 0],
  [100, 90, 0, 0, 0, 0, 0, 0],
  [100, 0, 0, 0, 0, 0, 0, 0],
]

export function RetentionChart() {
  const [timeframe, setTimeframe] = useState("8w")

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Retention</CardTitle>
          <CardDescription>Weekly cohort retention analysis</CardDescription>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="4w">4 weeks</SelectItem>
            <SelectItem value="8w">8 weeks</SelectItem>
            <SelectItem value="12w">12 weeks</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 border-b">Cohort</th>
                <th className="p-2 border-b">Week 0</th>
                <th className="p-2 border-b">Week 1</th>
                <th className="p-2 border-b">Week 2</th>
                <th className="p-2 border-b">Week 3</th>
                <th className="p-2 border-b">Week 4</th>
                <th className="p-2 border-b">Week 5</th>
                <th className="p-2 border-b">Week 6</th>
                <th className="p-2 border-b">Week 7</th>
              </tr>
            </thead>
            <tbody>
              {retentionData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td className="p-2 border-b font-medium">Cohort {rowIndex + 1}</td>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="p-2 border-b text-center"
                      style={{
                        backgroundColor: cell ? `rgba(var(--primary-rgb), ${cell / 100})` : "transparent",
                        color: cell > 50 ? "white" : "inherit",
                      }}
                    >
                      {cell ? `${cell}%` : "-"}
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
