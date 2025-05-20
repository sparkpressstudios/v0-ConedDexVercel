"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function DebugPage() {
  const [info, setInfo] = useState({
    userAgent: "",
    windowDimensions: { width: 0, height: 0 },
    url: "",
    timestamp: "",
    fonts: [],
    cssVariables: {},
    errors: [],
  })

  useEffect(() => {
    try {
      // Basic information
      const userAgent = navigator.userAgent
      const windowDimensions = {
        width: window.innerWidth,
        height: window.innerHeight,
      }
      const url = window.location.href
      const timestamp = new Date().toISOString()

      // Font information
      const fontCheck = []
      const fontFamilies = ["Inter", "Roboto_Mono", "sans-serif", "monospace"]
      fontFamilies.forEach((font) => {
        const isAvailable = document.fonts.check(`12px ${font}`)
        fontCheck.push({ font, isAvailable })
      })

      // CSS variables
      const cssVars = {}
      const root = document.documentElement
      const computedStyle = getComputedStyle(root)
      ;["--background", "--foreground", "--primary", "--primary-foreground", "--font-sans", "--font-mono"].forEach(
        (variable) => {
          cssVars[variable] = computedStyle.getPropertyValue(variable)
        },
      )

      setInfo({
        userAgent,
        windowDimensions,
        url,
        timestamp,
        fonts: fontCheck,
        cssVariables: cssVars,
        errors: [],
      })
    } catch (error) {
      setInfo((prev) => ({
        ...prev,
        errors: [...prev.errors, error.message],
      }))
    }
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>ConeDex Debug Information</CardTitle>
          <CardDescription>
            This page displays diagnostic information to help troubleshoot display issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="mt-2 rounded-md bg-muted p-4">
              <p>
                <strong>User Agent:</strong> {info.userAgent}
              </p>
              <p>
                <strong>Window Size:</strong> {info.windowDimensions.width}x{info.windowDimensions.height}
              </p>
              <p>
                <strong>URL:</strong> {info.url}
              </p>
              <p>
                <strong>Timestamp:</strong> {info.timestamp}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Font Information</h3>
            <div className="mt-2 grid gap-2">
              {info.fonts.map((font, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant={font.isAvailable ? "default" : "destructive"}>
                    {font.isAvailable ? "Available" : "Missing"}
                  </Badge>
                  <span className="font-medium">{font.font}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">CSS Variables</h3>
            <div className="mt-2 rounded-md bg-muted p-4">
              {Object.entries(info.cssVariables).map(([key, value]) => (
                <p key={key}>
                  <strong>{key}:</strong> {value}
                </p>
              ))}
            </div>
          </div>

          {info.errors.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-destructive">Errors</h3>
              <div className="mt-2 rounded-md bg-destructive/10 p-4">
                {info.errors.map((error, index) => (
                  <p key={index} className="text-destructive">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>Refresh Information</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
