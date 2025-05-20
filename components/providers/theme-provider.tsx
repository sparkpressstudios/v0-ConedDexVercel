"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"

type Theme = "explorer" | "shop-owner" | "admin" | "system"
type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
  userRoleTheme: "explorer" | "shop-owner" | "admin"
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
  userRoleTheme: "explorer",
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "conedex-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")
  const { user } = useAuth()

  // Determine user role theme
  const userRoleTheme = user?.role === "shop_owner" ? "shop-owner" : user?.role === "admin" ? "admin" : "explorer"

  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null

    if (storedTheme) {
      setTheme(storedTheme)
    }

    // Check for dark mode preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    setResolvedTheme(mediaQuery.matches ? "dark" : "light")

    const handleChange = () => {
      setResolvedTheme(mediaQuery.matches ? "dark" : "light")
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [storageKey])

  // Apply theme classes to document
  useEffect(() => {
    const root = window.document.documentElement

    // Remove all theme classes
    root.classList.remove("theme-explorer", "theme-shop-owner", "theme-admin", "light", "dark")

    // Add role-based theme class
    if (userRoleTheme === "shop-owner") {
      root.classList.add("theme-shop-owner")
    } else if (userRoleTheme === "admin") {
      root.classList.add("theme-admin")
    } else {
      root.classList.add("theme-explorer")
    }

    // Add light/dark theme class
    if (theme === "system") {
      root.classList.add(resolvedTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme, resolvedTheme, userRoleTheme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    resolvedTheme,
    userRoleTheme: userRoleTheme as "explorer" | "shop-owner" | "admin",
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
