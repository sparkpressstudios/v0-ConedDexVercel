import { puppeteerService } from "../utils/puppeteer-utils"

interface AccessibilityViolation {
  id: string
  impact: "minor" | "moderate" | "serious" | "critical"
  description: string
  help: string
  helpUrl: string
  nodes: Array<{
    html: string
    target: string[]
    failureSummary: string
  }>
}

interface AccessibilityTestResult {
  url: string
  timestamp: string
  violations: AccessibilityViolation[]
  passes: number
  incomplete: number
}

/**
 * Accessibility testing utility using Puppeteer and axe-core
 */
export class AccessibilityTester {
  /**
   * Run accessibility tests on a URL
   */
  async testUrl(url: string): Promise<AccessibilityTestResult> {
    await puppeteerService.initBrowser()
    const page = await puppeteerService.newPage()

    try {
      // Navigate to the URL
      await page.goto(url, { waitUntil: "networkidle2" })

      // Inject axe-core
      await page.addScriptTag({
        url: "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js",
      })

      // Run accessibility tests
      const results = await page.evaluate(() => {
        return new Promise((resolve) => {
          // @ts-ignore - axe is injected at runtime
          window.axe.run(
            document,
            {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"],
              },
            },
            (err, results) => {
              if (err) throw err
              resolve(results)
            },
          )
        })
      })

      return {
        url,
        timestamp: new Date().toISOString(),
        violations: results.violations,
        passes: results.passes.length,
        incomplete: results.incomplete.length,
      }
    } finally {
      await page.close()
      await puppeteerService.closeBrowser()
    }
  }

  /**
   * Test multiple pages for accessibility issues
   */
  async testMultipleUrls(urls: string[]): Promise<AccessibilityTestResult[]> {
    const results: AccessibilityTestResult[] = []

    await puppeteerService.initBrowser()

    try {
      for (const url of urls) {
        try {
          const page = await puppeteerService.newPage()

          try {
            // Navigate to the URL
            await page.goto(url, { waitUntil: "networkidle2" })

            // Inject axe-core
            await page.addScriptTag({
              url: "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js",
            })

            // Run accessibility tests
            const result = await page.evaluate(() => {
              return new Promise((resolve) => {
                // @ts-ignore - axe is injected at runtime
                window.axe.run(
                  document,
                  {
                    runOnly: {
                      type: "tag",
                      values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"],
                    },
                  },
                  (err, results) => {
                    if (err) throw err
                    resolve(results)
                  },
                )
              })
            })

            results.push({
              url,
              timestamp: new Date().toISOString(),
              violations: result.violations,
              passes: result.passes.length,
              incomplete: result.incomplete.length,
            })
          } finally {
            await page.close()
          }
        } catch (error) {
          console.error(`Error testing ${url}:`, error)
          results.push({
            url,
            timestamp: new Date().toISOString(),
            violations: [
              {
                id: "test-error",
                impact: "serious",
                description: `Error testing URL: ${error instanceof Error ? error.message : "Unknown error"}`,
                help: "Check if the URL is accessible",
                helpUrl: "",
                nodes: [],
              },
            ],
            passes: 0,
            incomplete: 0,
          })
        }
      }
    } finally {
      await puppeteerService.closeBrowser()
    }

    return results
  }

  /**
   * Generate an accessibility report in HTML format
   */
  generateHtmlReport(results: AccessibilityTestResult[]): string {
    const totalViolations = results.reduce((sum, result) => sum + result.violations.length, 0)
    const totalPasses = results.reduce((sum, result) => sum + result.passes, 0)

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Accessibility Test Report</title>
        <style>
          body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 1200px; margin: 0 auto; padding: 2rem; }
          h1, h2, h3 { margin-top: 2rem; }
          .summary { display: flex; gap: 2rem; margin: 2rem 0; }
          .summary-item { padding: 1rem; border-radius: 0.5rem; }
          .violations { background-color: #fee2e2; }
          .passes { background-color: #dcfce7; }
          .url { padding: 0.5rem; background-color: #f3f4f6; border-radius: 0.25rem; margin-bottom: 1rem; }
          .violation { margin-bottom: 2rem; border-left: 4px solid; padding-left: 1rem; }
          .critical { border-color: #ef4444; }
          .serious { border-color: #f97316; }
          .moderate { border-color: #eab308; }
          .minor { border-color: #3b82f6; }
          .impact { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.875rem; }
          .impact.critical { background-color: #fee2e2; color: #b91c1c; }
          .impact.serious { background-color: #ffedd5; color: #c2410c; }
          .impact.moderate { background-color: #fef9c3; color: #854d0e; }
          .impact.minor { background-color: #dbeafe; color: #1e40af; }
          .node { margin-top: 1rem; padding: 1rem; background-color: #f3f4f6; border-radius: 0.25rem; }
          .node pre { overflow-x: auto; }
          .help-link { display: inline-block; margin-top: 0.5rem; }
          .timestamp { color: #6b7280; font-size: 0.875rem; }
        </style>
      </head>
      <body>
        <h1>Accessibility Test Report</h1>
        <p class="timestamp">Generated on ${new Date().toLocaleString()}</p>
        
        <div class="summary">
          <div class="summary-item violations">
            <h2>Total Violations</h2>
            <p>${totalViolations}</p>
          </div>
          <div class="summary-item passes">
            <h2>Total Passes</h2>
            <p>${totalPasses}</p>
          </div>
        </div>
        
        ${results
          .map(
            (result) => `
          <h2>Results for URL</h2>
          <div class="url">${result.url}</div>
          
          <h3>Violations</h3>
          ${
            result.violations.length === 0
              ? "<p>No violations found.</p>"
              : result.violations
                  .map(
                    (violation) => `
            <div class="violation ${violation.impact}">
              <h4>${violation.id} - <span class="impact ${violation.impact}">${violation.impact}</span></h4>
              <p>${violation.description}</p>
              <a class="help-link" href="${violation.helpUrl}" target="_blank">Learn more</a>
              ${violation.nodes
                .map(
                  (node) => `
                <div class="node">
                  <p><strong>HTML:</strong></p>
                  <pre>${node.html}</pre>
                  <p><strong>Target:</strong> ${node.target.join(", ")}</p>
                  <p><strong>Failure Summary:</strong> ${node.failureSummary}</p>
                </div>
              `,
                )
                .join("")}
            </div>
          `,
                  )
                  .join("")
          }
        `,
          )
          .join("")}
      </body>
      </html>
    `

    return html
  }
}
