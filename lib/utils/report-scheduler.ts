import { createServerClient } from "@/lib/supabase/server"
import { generateShopReport } from "@/app/actions/generate-shop-report"
import { generateFlavorCatalog } from "@/app/actions/generate-flavor-catalog"
import cron from "node-cron"

interface ScheduledReport {
  id: string
  type: "shop_report" | "flavor_catalog" | "analytics" | "custom"
  entityId: string
  schedule: string // cron expression
  options: Record<string, any>
  lastRun?: string
  nextRun?: string
  enabled: boolean
}

/**
 * Report scheduler utility for automating report generation
 */
export class ReportScheduler {
  private schedules: Map<string, cron.ScheduledTask> = new Map()
  private isInitialized = false

  /**
   * Initialize the scheduler and load all scheduled reports
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      const supabase = createServerClient()
      const { data: reports, error } = await supabase.from("scheduled_reports").select("*").eq("enabled", true)

      if (error) {
        throw error
      }

      if (reports && reports.length > 0) {
        for (const report of reports) {
          await this.scheduleReport(report)
        }
      }

      this.isInitialized = true
      console.log(`Report scheduler initialized with ${this.schedules.size} active schedules`)
    } catch (error) {
      console.error("Failed to initialize report scheduler:", error)
    }
  }

  /**
   * Schedule a report for automatic generation
   */
  async scheduleReport(report: ScheduledReport): Promise<boolean> {
    try {
      // Validate cron expression
      if (!cron.validate(report.schedule)) {
        throw new Error(`Invalid cron expression: ${report.schedule}`)
      }

      // Cancel existing schedule if it exists
      if (this.schedules.has(report.id)) {
        this.schedules.get(report.id)?.stop()
      }

      // Calculate next run time
      const nextRun = cron
        .schedule(report.schedule, () => {}, { scheduled: false })
        .nextDate()
        .toJSDate()

      // Schedule the report generation
      const task = cron.schedule(
        report.schedule,
        async () => {
          await this.generateReport(report)
        },
        {
          scheduled: true,
          timezone: "UTC",
        },
      )

      this.schedules.set(report.id, task)

      // Update the report's next run time in the database
      const supabase = createServerClient()
      await supabase
        .from("scheduled_reports")
        .update({
          nextRun: nextRun.toISOString(),
        })
        .eq("id", report.id)

      return true
    } catch (error) {
      console.error(`Failed to schedule report ${report.id}:`, error)
      return false
    }
  }

  /**
   * Generate a report based on its type
   */
  private async generateReport(report: ScheduledReport): Promise<void> {
    console.log(`Generating scheduled report: ${report.id} (${report.type})`)

    try {
      const supabase = createServerClient()
      let result: any = null

      // Generate the appropriate report type
      switch (report.type) {
        case "shop_report":
          result = await generateShopReport(report.entityId)
          break
        case "flavor_catalog":
          result = await generateFlavorCatalog({
            shopId: report.entityId,
            ...report.options,
          })
          break
        case "analytics":
          // Implement analytics report generation
          break
        case "custom":
          // Implement custom report generation
          break
      }

      // Update the report status in the database
      await supabase
        .from("scheduled_reports")
        .update({
          lastRun: new Date().toISOString(),
          nextRun: this.schedules.get(report.id)?.nextDate().toJSDate().toISOString(),
          lastResult: result,
        })
        .eq("id", report.id)

      // Create a notification for the report
      await supabase.from("notifications").insert({
        user_id: report.options.userId,
        type: "report_generated",
        title: `${report.type.replace("_", " ")} Generated`,
        message: `Your scheduled ${report.type.replace("_", " ")} has been generated.`,
        data: {
          reportId: report.id,
          reportType: report.type,
          reportUrl: result?.url,
        },
        read: false,
        created_at: new Date().toISOString(),
      })

      console.log(`Successfully generated report: ${report.id}`)
    } catch (error) {
      console.error(`Failed to generate report ${report.id}:`, error)

      // Update the report with error information
      const supabase = createServerClient()
      await supabase
        .from("scheduled_reports")
        .update({
          lastRun: new Date().toISOString(),
          nextRun: this.schedules.get(report.id)?.nextDate().toJSDate().toISOString(),
          lastError: error instanceof Error ? error.message : "Unknown error",
        })
        .eq("id", report.id)
    }
  }

  /**
   * Cancel a scheduled report
   */
  cancelSchedule(reportId: string): boolean {
    if (this.schedules.has(reportId)) {
      this.schedules.get(reportId)?.stop()
      this.schedules.delete(reportId)
      return true
    }
    return false
  }

  /**
   * Get all active schedules
   */
  getActiveSchedules(): { id: string; nextRun: Date }[] {
    return Array.from(this.schedules.entries()).map(([id, task]) => ({
      id,
      nextRun: task.nextDate().toJSDate(),
    }))
  }

  /**
   * Shutdown the scheduler
   */
  shutdown(): void {
    for (const task of this.schedules.values()) {
      task.stop()
    }
    this.schedules.clear()
    this.isInitialized = false
  }
}

// Export a singleton instance
export const reportScheduler = new ReportScheduler()
