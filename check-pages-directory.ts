// This is a utility script to check for any files in the pages/ directory
// that might be importing next/headers

import fs from "fs"
import path from "path"

function checkDirectory(dir: string) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stats = fs.statSync(filePath)

    if (stats.isDirectory()) {
      checkDirectory(filePath)
    } else if (stats.isFile() && (file.endsWith(".ts") || file.endsWith(".tsx"))) {
      const content = fs.readFileSync(filePath, "utf8")
      if (content.includes("next/headers")) {
        console.log(`File ${filePath} imports next/headers`)
      }
    }
  }
}

// Check the pages directory
checkDirectory("./pages")
