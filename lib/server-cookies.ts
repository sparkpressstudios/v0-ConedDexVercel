"use server"

import { cookies } from "next/headers"

// Function to get a cookie from the server
export async function getServerCookie(name: string) {
  const cookieStore = cookies()
  return cookieStore.get(name)?.value
}

// Function to set a cookie on the server
export async function setServerCookie(name: string, value: string, options?: any) {
  const cookieStore = cookies()
  cookieStore.set(name, value, options)
}

// Function to delete a cookie on the server
export async function deleteServerCookie(name: string) {
  const cookieStore = cookies()
  cookieStore.delete(name)
}

// Function to get all cookies from the server
export async function getAllServerCookies() {
  const cookieStore = cookies()
  return cookieStore.getAll()
}
