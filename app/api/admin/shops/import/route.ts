import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"
import { parse } from "csv-parse/sync"

export async function POST(request: Request) {
  try {
    const session = await getSession()

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Only admins can import shops" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file type and size
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "File must be a CSV" }, { status: 400 })
    }

    // Limit file size to 10MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds the 10MB limit" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Create an import job record
    const { data: importJob, error: importJobError } = await supabase
      .from("import_jobs")
      .insert({
        user_id: session.user.id,
        type: "shops",
        status: "pending",
        file_name: file.name,
        file_size: file.size,
      })
      .select()
      .single()

    if (importJobError || !importJob) {
      console.error("Error creating import job:", importJobError)
      return NextResponse.json({ error: "Failed to create import job" }, { status: 500 })
    }

    // Start the import process in the background
    processShopImport(file, importJob.id, session.user.id).catch((error) => {
      console.error("Error processing shop import:", error)
    })

    return NextResponse.json({
      success: true,
      message: "Import started",
      importId: importJob.id,
    })
  } catch (error) {
    console.error("Error importing shops:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import shops" },
      { status: 500 },
    )
  }
}

async function processShopImport(file: File, importId: string, userId: string) {
  const supabase = createServerClient()

  try {
    // Update job status to processing
    await supabase.from("import_jobs").update({ status: "processing" }).eq("id", importId)

    // Read and parse the CSV file
    const csvText = await file.text()
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    // Update total count
    await supabase.from("import_jobs").update({ total: records.length }).eq("id", importId)

    const errors: Array<{ row: number; message: string }> = []
    const warnings: Array<{ row: number; message: string }> = []
    let processed = 0
    let successful = 0
    let failed = 0

    // Process each record
    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      const rowNum = i + 2 // +2 for header row and 0-indexing

      try {
        // Validate required fields
        if (!record.name) {
          throw new Error("Shop name is required")
        }

        if (!record.address) {
          throw new Error("Address is required")
        }

        // Check if shop already exists
        const { data: existingShops } = await supabase
          .from("shops")
          .select("id")
          .eq("name", record.name)
          .eq("address", record.address)

        if (existingShops && existingShops.length > 0) {
          warnings.push({
            row: rowNum,
            message: `Shop "${record.name}" at "${record.address}" already exists`,
          })
          processed++
          continue
        }

        // Insert the shop
        const { error: insertError } = await supabase.from("shops").insert({
          name: record.name,
          address: record.address,
          city: record.city || null,
          state: record.state || null,
          phone: record.phone || null,
          website: record.website || null,
          lat: record.lat ? Number.parseFloat(record.lat) : null,
          lng: record.lng ? Number.parseFloat(record.lng) : null,
          image_url: record.image_url || null,
          source: "csv_import",
          created_by: userId,
        })

        if (insertError) {
          throw insertError
        }

        successful++
      } catch (error) {
        errors.push({
          row: rowNum,
          message: error instanceof Error ? error.message : "Unknown error",
        })
        failed++
      } finally {
        processed++

        // Update progress every 10 records or at the end
        if (processed % 10 === 0 || processed === records.length) {
          await supabase
            .from("import_jobs")
            .update({
              processed,
              successful,
              failed,
              errors,
              warnings,
            })
            .eq("id", importId)
        }
      }
    }

    // Update job as completed
    await supabase
      .from("import_jobs")
      .update({
        status: "completed",
        processed,
        successful,
        failed,
        errors,
        warnings,
        completed_at: new Date().toISOString(),
      })
      .eq("id", importId)
  } catch (error) {
    console.error("Error processing shop import:", error)

    // Update job as failed
    await supabase
      .from("import_jobs")
      .update({
        status: "failed",
        errors: [{ message: error instanceof Error ? error.message : "Unknown error" }],
        completed_at: new Date().toISOString(),
      })
      .eq("id", importId)
  }
}
