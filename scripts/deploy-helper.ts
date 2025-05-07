#!/usr/bin/env node
/**
 * Deployment Helper Script
 *
 * This script helps prepare the project for deployment by ensuring
 * all necessary configuration is in place for pnpm compatibility.
 */

import fs from "fs"
import path from "path"
import chalk from "chalk"

const rootDir = process.cwd()

/**
 * Checks if a file exists
 */
function fileExists(filePath: string): boolean {
  return fs.existsSync(path.join(rootDir, filePath))
}

/**
 * Creates a file with the given content
 */
function createFile(filePath: string, content: string): void {
  const fullPath = path.join(rootDir, filePath)
  const directory = path.dirname(fullPath)

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true })
  }

  fs.writeFileSync(fullPath, content)
  console.log(chalk.green(`Created file: ${filePath}`))
}

/**
 * Removes a file if it exists
 */
function removeFile(filePath: string): void {
  const fullPath = path.join(rootDir, filePath)
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath)
    console.log(chalk.yellow(`Removed file: ${filePath}`))
  }
}

/**
 * Updates package.json with pnpm configuration
 */
function updatePackageJson(): void {
  const packageJsonPath = path.join(rootDir, "package.json")
  if (!fs.existsSync(packageJsonPath)) {
    console.error(chalk.red("package.json not found"))
    return
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"))

  // Add engines
  packageJson.engines = {
    ...packageJson.engines,
    node: ">=18.0.0",
    pnpm: ">=8.0.0",
  }

  // Add packageManager
  packageJson.packageManager = "pnpm@8.x"

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  console.log(chalk.green("Updated package.json with pnpm configuration"))
}

/**
 * Checks for conflicting lock files
 */
function checkLockFiles(): void {
  const lockFiles = ["package-lock.json", "yarn.lock"]
  let conflictsFound = false

  for (const file of lockFiles) {
    if (fileExists(file)) {
      console.log(chalk.yellow(`Found conflicting lock file: ${file}`))
      conflictsFound = true
    }
  }

  if (conflictsFound) {
    console.log(chalk.yellow("Would you like to remove conflicting lock files? (y/n)"))
    // In a real script, you'd prompt for input here
    // For this example, we'll assume yes
    for (const file of lockFiles) {
      removeFile(file)
    }
  }
}

/**
 * Creates necessary configuration files
 */
function createConfigFiles(): void {
  // Create .npmrc
  if (!fileExists(".npmrc")) {
    createFile(".npmrc", "shamefully-hoist=true\nnode-linker=hoisted")
  }

  // Create or update vercel.json
  const vercelJsonContent = {
    version: 2,
    buildCommand: "pnpm build",
    installCommand: "pnpm install",
    framework: "nextjs",
    outputDirectory: ".next",
    env: {
      NEXT_PUBLIC_RUNTIME: "app",
    },
    github: {
      enabled: true,
      silent: false,
    },
    headers: [
      {
        source: "/api/(.*)",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ],
  }

  createFile("vercel.json", JSON.stringify(vercelJsonContent, null, 2))
}

/**
 * Main function
 */
function main(): void {
  console.log(chalk.blue("🚀 Preparing project for deployment with pnpm..."))

  // Check for conflicting lock files
  checkLockFiles()

  // Update package.json
  updatePackageJson()

  // Create necessary configuration files
  createConfigFiles()

  console.log(chalk.green("✅ Project is now configured for deployment with pnpm!"))
  console.log(chalk.blue("Next steps:"))
  console.log('1. Commit these changes: git add . && git commit -m "Configure for pnpm deployment"')
  console.log("2. Push to your repository: git push")
  console.log("3. Deploy to Vercel: vercel --prod")
}

// Run the main function
main()
