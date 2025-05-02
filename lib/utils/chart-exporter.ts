import { puppeteerService } from "./puppeteer-utils"
import path from "path"
import fs from "fs/promises"

interface ChartExportOptions {
  width?: number
  height?: number
  backgroundColor?: string
  scale?: number
  format?: "png" | "jpeg" | "pdf"
  quality?: number
}

/**
 * Chart exporter utility for generating images from chart data
 */
export class ChartExporter {
  /**
   * Export a chart as an image
   */
  async exportChart(chartData: any, outputPath: string, options: ChartExportOptions = {}): Promise<string> {
    // Create a temporary HTML file with the chart
    const tempDir = path.join(process.cwd(), "public", "temp")
    await fs.mkdir(tempDir, { recursive: true })

    const tempHtmlPath = path.join(tempDir, `chart-${Date.now()}.html`)
    const chartHtml = this.generateChartHtml(chartData, options)

    await fs.writeFile(tempHtmlPath, chartHtml)

    try {
      // Take a screenshot of the chart
      const tempHtmlUrl = `file://${tempHtmlPath}`

      await puppeteerService.takeScreenshot(tempHtmlUrl, outputPath, {
        width: options.width || 800,
        height: options.height || 500,
        waitForSelector: "#chart-container",
      })

      return outputPath
    } finally {
      // Clean up temporary file
      await fs.unlink(tempHtmlPath).catch(() => {})
    }
  }

  /**
   * Generate HTML for a chart using Chart.js
   */
  private generateChartHtml(chartData: any, options: ChartExportOptions): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Chart Export</title>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            body {
              margin: 0;
              padding: 0;
              background-color: ${options.backgroundColor || "transparent"};
            }
            #chart-container {
              width: ${options.width || 800}px;
              height: ${options.height || 500}px;
            }
          </style>
        </head>
        <body>
          <div id="chart-container">
            <canvas id="chart"></canvas>
          </div>
          
          <script>
            // Initialize the chart
            const ctx = document.getElementById('chart').getContext('2d');
            new Chart(ctx, ${JSON.stringify(chartData)});
          </script>
        </body>
      </html>
    `
  }

  /**
   * Export multiple charts as images
   */
  async exportCharts(
    charts: Array<{ data: any; outputPath: string; options?: ChartExportOptions }>,
  ): Promise<string[]> {
    const results: string[] = []

    for (const chart of charts) {
      try {
        const result = await this.exportChart(chart.data, chart.outputPath, chart.options)
        results.push(result)
      } catch (error) {
        console.error(`Error exporting chart to ${chart.outputPath}:`, error)
      }
    }

    await puppeteerService.closeBrowser()
    return results
  }
}

// Export a singleton instance
export const chartExporter = new ChartExporter()
