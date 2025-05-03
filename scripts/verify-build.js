const fs = require("fs")
const path = require("path")

// Check if the .next directory exists
if (!fs.existsSync(path.join(process.cwd(), ".next"))) {
  console.error("❌ Build output directory .next does not exist!")
  process.exit(1)
}

// Check if the standalone directory exists (if using output: 'standalone')
if (!fs.existsSync(path.join(process.cwd(), ".next/standalone"))) {
  console.warn('⚠️ Standalone output directory does not exist. Make sure output: "standalone" is in next.config.js')
}

// Check for critical files
const criticalFiles = [".next/server/pages/index.html", ".next/server/app/page.js", "public/index.html"]

let missingFiles = false
criticalFiles.forEach((file) => {
  if (!fs.existsSync(path.join(process.cwd(), file))) {
    console.warn(`⚠️ Critical file ${file} is missing!`)
    missingFiles = true
  }
})

if (missingFiles) {
  console.warn("Some critical files are missing, which might cause 404 errors in preview.")
} else {
  console.log("✅ Build verification passed! All critical files exist.")
}
