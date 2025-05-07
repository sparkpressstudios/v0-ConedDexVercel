#!/usr/bin/env node
/**
 * Migration Helper Script
 *
 * This script helps track and manage the migration from Pages Router to App Router.
 * It checks the status of files that need to be migrated and provides a progress report.
 */

import fs from "fs"
import path from "path"
import chalk from "chalk"
import { MIGRATION_MAP, COMPONENT_MIGRATION_MAP } from "./file-manifest"

const rootDir = process.cwd()

/**
 * Checks the migration status of all files in the migration map
 */
function checkMigrationStatus(): void {
  console.log(chalk.blue("📊 Checking migration status..."))

  let migrated = 0
  let pending = 0
  let partial = 0

  console.log(chalk.cyan("\nPage Routes:"))
  for (const [source, target] of Object.entries(MIGRATION_MAP)) {
    const sourceExists = fs.existsSync(path.join(rootDir, source))
    const targetExists = fs.existsSync(path.join(rootDir, target))

    if (sourceExists && targetExists) {
      console.log(chalk.yellow(`⚠️ Both exist: ${source} and ${target}`))
      partial++
    } else if (!sourceExists && targetExists) {
      console.log(chalk.green(`✅ Migrated: ${source} → ${target}`))
      migrated++
    } else if (sourceExists && !targetExists) {
      console.log(chalk.red(`❌ Not migrated: ${source} → ${target}`))
      pending++
    }
  }

  console.log(chalk.cyan("\nComponents:"))
  for (const [source, target] of Object.entries(COMPONENT_MIGRATION_MAP)) {
    const sourceExists = fs.existsSync(path.join(rootDir, source))
    const targetExists = fs.existsSync(path.join(rootDir, target))

    if (sourceExists && targetExists) {
      console.log(chalk.yellow(`⚠️ Both exist: ${source} and ${target}`))
      partial++
    } else if (!sourceExists && targetExists) {
      console.log(chalk.green(`✅ Migrated: ${source} → ${target}`))
      migrated++
    } else if (sourceExists && !targetExists) {
      console.log(chalk.red(`❌ Not migrated: ${source} → ${target}`))
      pending++
    }
  }

  const total = migrated + pending + partial
  const percentComplete = Math.round((migrated / total) * 100)

  console.log(chalk.blue(`\nMigration progress: ${migrated}/${total} (${percentComplete}%)`))
  console.log(chalk.blue(`  - Fully migrated: ${migrated}`))
  console.log(chalk.blue(`  - Partially migrated: ${partial}`))
  console.log(chalk.blue(`  - Not migrated: ${pending}`))
}

/**
 * Creates the directory structure for a target file if it doesn't exist
 */
function createDirectoryForFile(filePath: string): void {
  const directory = path.dirname(filePath)
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true })
    console.log(chalk.green(`Created directory: ${directory}`))
  }
}

/**
 * Prepares a file for migration by creating the necessary directory structure
 */
function prepareForMigration(source: string, target: string): void {
  const sourcePath = path.join(rootDir, source)
  const targetPath = path.join(rootDir, target)

  if (!fs.existsSync(sourcePath)) {
    console.error(chalk.red(`Source file does not exist: ${source}`))
    return
  }

  if (fs.existsSync(targetPath)) {
    console.warn(chalk.yellow(`Target file already exists: ${target}`))
    return
  }

  createDirectoryForFile(targetPath)
  console.log(chalk.green(`Ready to migrate: ${source} → ${target}`))
}

/**
 * Prepares all files for migration
 */
function prepareAllForMigration(): void {
  console.log(chalk.blue("🔧 Preparing for migration..."))

  for (const [source, target] of Object.entries(MIGRATION_MAP)) {
    prepareForMigration(source, target)
  }

  for (const [source, target] of Object.entries(COMPONENT_MIGRATION_MAP)) {
    prepareForMigration(source, target)
  }
}

// Process command line arguments
const args = process.argv.slice(2)
if (args.includes("--prepare")) {
  prepareAllForMigration()
} else {
  checkMigrationStatus()
}
