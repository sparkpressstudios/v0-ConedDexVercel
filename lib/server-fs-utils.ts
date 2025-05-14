"use server"

// This file contains server-only utilities that use the Node.js fs module
// It should never be imported directly in client components

import fs from "fs"
import path from "path"

// Export any file system related functions here
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

export async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const data = await fs.promises.readFile(filePath, "utf8")
    return JSON.parse(data) as T
  } catch {
    return null
  }
}

export async function writeJsonFile<T>(filePath: string, data: T): Promise<boolean> {
  try {
    const dirPath = path.dirname(filePath)
    await fs.promises.mkdir(dirPath, { recursive: true })
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf8")
    return true
  } catch (error) {
    console.error("Error writing JSON file:", error)
    return false
  }
}

// Add any other file system utilities you need here
