// Server-side utilities
import { cookies, headers } from "next/headers"

// Function to get cookies on the server
export function getServerCookies() {
  return cookies()
}

// Function to get headers on the server
export function getServerHeaders() {
  return headers()
}

// Function to get a specific cookie value
export function getServerCookie(name: string) {
  const cookieStore = cookies()
  return cookieStore.get(name)?.value
}

// Function to get a specific header value
export function getServerHeader(name: string) {
  const headersList = headers()
  return headersList.get(name)
}
