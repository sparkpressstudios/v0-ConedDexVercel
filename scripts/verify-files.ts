#!/usr/bin/env node
/**
 * File Verification Script
 *
 * This script verifies the existence of critical files in the ConeDex Platform.
 * It can be run as a pre-commit hook, pre-build step, or manually.
 */

import fs from "fs"
import path from "path"
import chalk from "chalk"
import { CRITICAL_FILES, FILE_GROUPS } from "./file-manifest"

const rootDir = process.cwd()

/**
 * Verifies the existence of a list of files
 * @param files List of files to verify
 * @returns List of missing files
 */
function verifyFiles(files: string[]): string[] {
  return files.filter((file) => !fs.existsSync(path.join(rootDir, file)))
}

/**
 * Verifies all file groups and returns missing files by group
 * @returns Record of group names to lists of missing files
 */
function verifyAllGroups(): Record<string, string[]> {
  const results: Record<string, string[]> = {}

  for (const [group, files] of Object.entries(FILE_GROUPS)) {
    const missingFiles = verifyFiles(files)
    if (missingFiles.length > 0) {
      results[group] = missingFiles
    }
  }

  return results
}

/**
 * Main verification function
 * @param exitOnFailure Whether to exit the process on failure
 * @returns Whether all critical files exist
 */
export function verifyFileIntegrity(exitOnFailure = true): boolean {
  console.log(chalk.blue("🔍 Verifying file integrity..."))

  // Verify all critical files
  const missingCritical = verifyFiles(CRITICAL_FILES)
  if (missingCritical.length > 0) {
    console.error(chalk.red("❌ Missing critical files:"))
    missingCritical.forEach((file) => {
      console.error(chalk.red(`  - ${file}`))
    })

    if (exitOnFailure) {
      process.exit(1)
    }
    return false
  }

  // Verify by feature group
  const missingByGroup = verifyAllGroups()
  if (Object.keys(missingByGroup).length > 0) {
    console.warn(chalk.yellow("⚠️ Missing files by feature group:"))
    for (const [group, files] of Object.entries(missingByGroup)) {
      console.warn(chalk.yellow(`  ${group}:`))
      files.forEach((file) => {
        console.warn(chalk.yellow(`    - ${file}`))
      })
    }
  }

  console.log(chalk.green("✅ All critical files verified successfully"))
  return true
}

// Run the verification if this script is executed directly
if (require.main === module) {
  verifyFileIntegrity()
}
