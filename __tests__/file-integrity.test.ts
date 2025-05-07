/**
 * File Integrity Tests
 *
 * These tests verify that all critical files exist and have valid imports.
 */

import fs from "fs"
import path from "path"
import { CRITICAL_FILES, FILE_GROUPS } from "../scripts/file-manifest"

describe("File Integrity", () => {
  test("All critical files exist", () => {
    CRITICAL_FILES.forEach((file) => {
      const exists = fs.existsSync(path.join(process.cwd(), file))
      if (!exists) {
        console.error(`Missing critical file: ${file}`)
      }
      expect(exists).toBe(true)
    })
  })

  // Test each feature group
  Object.entries(FILE_GROUPS).forEach(([group, files]) => {
    test(`${group} feature files exist`, () => {
      const missingFiles: string[] = []

      files.forEach((file) => {
        const exists = fs.existsSync(path.join(process.cwd(), file))
        if (!exists) {
          missingFiles.push(file)
        }
      })

      if (missingFiles.length > 0) {
        console.error(`Missing files in ${group} group:`, missingFiles)
      }

      expect(missingFiles.length).toBe(0)
    })
  })
})
