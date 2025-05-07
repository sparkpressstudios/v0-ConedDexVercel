/**
 * Import Validation Tests
 *
 * These tests verify that critical files have valid imports.
 */

import { execSync } from "child_process"
import path from "path"
import fs from "fs"
import { CRITICAL_FILES } from "../scripts/file-manifest"

// Only test TypeScript files
const TS_FILES = CRITICAL_FILES.filter((file) => file.endsWith(".tsx") || file.endsWith(".ts"))

describe("Import Validation", () => {
  // Test that critical files have valid imports
  TS_FILES.forEach((file) => {
    // Skip files that don't exist (they'll be caught by file-integrity tests)
    if (!fs.existsSync(path.join(process.cwd(), file))) {
      return
    }

    test(`${file} has valid imports`, () => {
      try {
        // Use TypeScript compiler to check imports
        execSync(`npx tsc --noEmit ${file}`, {
          stdio: "pipe",
          encoding: "utf-8",
          cwd: process.cwd(),
        })

        // If we get here, the imports are valid
        expect(true).toBe(true)
      } catch (error) {
        const errorOutput = error.stdout || error.message
        console.error(`Import validation failed for ${file}:`, errorOutput)
        expect(errorOutput).not.toContain("error TS")
      }
    })
  })
})
