import { ChartExportTool } from "@/components/admin/analytics/chart-export-tool"

export default function AnalyticsExportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Exports</h1>
        <p className="text-muted-foreground">Export analytics data and visualizations for reports</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartExportTool />

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">Export Options</h2>
            <p className="text-muted-foreground">
              Use these tools to export analytics data and visualizations for reports, presentations, and sharing with
              stakeholders.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Available Export Formats</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">✓</span>
                <div>
                  <span className="font-medium">PNG Images</span>
                  <p className="text-sm text-muted-foreground">High-quality transparent images for presentations</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">✓</span>
                <div>
                  <span className="font-medium">PDF Reports</span>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive reports with multiple charts and data tables
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">✓</span>
                <div>
                  <span className="font-medium">CSV Data</span>
                  <p className="text-sm text-muted-foreground">
                    Raw data exports for further analysis in spreadsheet software
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
