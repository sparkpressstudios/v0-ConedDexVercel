"use server"

import { revalidatePath } from "next/cache"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { sendEmail, sendBatchEmails, generateNewsletterEmail } from "@/lib/services/sendgrid-email-service"

interface NewsletterData {
  subject: string
  content: string
}

interface SendNewsletterData extends NewsletterData {
  testOnly?: boolean
  testEmail?: string
}

export async function createNewsletter(data: NewsletterData) {
  const supabase = createServerActionClient({ cookies })

  // Check if user is admin
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error("Unauthorized")
  }

  // Get user role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single()

  if (profileError || !profile || profile.role !== "admin") {
    throw new Error("Unauthorized: Admin access required")
  }

  // Insert newsletter
  const { data: newsletter, error } = await supabase
    .from("newsletters")
    .insert({
      subject: data.subject,
      content: data.content,
      created_by: userData.user.id,
      status: "draft",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating newsletter:", error)
    throw new Error("Failed to create newsletter")
  }

  revalidatePath("/dashboard/admin/newsletters")
  return newsletter
}

export async function sendNewsletter(data: SendNewsletterData) {
  const supabase = createServerActionClient({ cookies })

  try {
    // Check if user is admin
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      throw new Error("Unauthorized")
    }

    // Get user role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single()

    if (profileError || !profile || profile.role !== "admin") {
      throw new Error("Unauthorized: Admin access required")
    }

    // Generate email content
    const { subject, html } = generateNewsletterEmail(data.subject, data.content)

    if (data.testOnly && data.testEmail) {
      // Send test email
      const testResult = await sendEmail({
        to: data.testEmail,
        subject,
        html,
      })

      if (!testResult) {
        throw new Error("Failed to send test email")
      }
      return { success: true, message: "Test email sent" }
    }

    // Get all subscribed users
    const { data: subscribers, error: subscribersError } = await supabase
      .from("profiles")
      .select("email")
      .eq("email_subscribed", true)

    if (subscribersError) {
      console.error("Error fetching subscribers:", subscribersError)
      throw new Error("Failed to fetch subscribers")
    }

    if (!subscribers || subscribers.length === 0) {
      return { success: false, message: "No subscribers found" }
    }

    // Insert newsletter record
    const { data: newsletter, error } = await supabase
      .from("newsletters")
      .insert({
        subject: data.subject,
        content: data.content,
        created_by: userData.user.id,
        status: "sent",
        sent_at: new Date().toISOString(),
        recipient_count: subscribers.length,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating newsletter record:", error)
      throw new Error("Failed to create newsletter record")
    }

    // Extract email addresses
    const emailAddresses = subscribers.map((sub) => sub.email).filter(Boolean)

    // Send to all subscribers
    const sendResult = await sendBatchEmails(emailAddresses, subject, html)

    if (!sendResult) {
      // Update newsletter record with failed status
      await supabase
        .from("newsletters")
        .update({
          status: "failed",
        })
        .eq("id", newsletter.id)

      throw new Error("Failed to send newsletter")
    }

    revalidatePath("/dashboard/admin/newsletters")
    return {
      success: true,
      message: `Newsletter sent to ${subscribers.length} subscribers`,
    }
  } catch (error) {
    console.error("Error in sendNewsletter:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

export async function getNewsletters() {
  const supabase = createServerActionClient({ cookies })

  // Check if user is admin
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error("Unauthorized")
  }

  // Get user role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single()

  if (profileError || !profile || profile.role !== "admin") {
    throw new Error("Unauthorized: Admin access required")
  }

  const { data, error } = await supabase
    .from("newsletters")
    .select(`
      *,
      profiles:created_by (
        email,
        full_name
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching newsletters:", error)
    throw new Error("Failed to fetch newsletters")
  }

  return data
}

export async function deleteNewsletter(id: string) {
  const supabase = createServerActionClient({ cookies })

  try {
    // Check if user is admin
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      throw new Error("Unauthorized")
    }

    // Get user role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single()

    if (profileError || !profile || profile.role !== "admin") {
      throw new Error("Unauthorized: Admin access required")
    }

    // Check if newsletter exists and is a draft
    const { data: newsletter, error: fetchError } = await supabase
      .from("newsletters")
      .select("status")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching newsletter:", fetchError)
      throw new Error("Newsletter not found")
    }

    if (newsletter.status !== "draft") {
      throw new Error("Only draft newsletters can be deleted")
    }

    // Delete the newsletter
    const { error: deleteError } = await supabase.from("newsletters").delete().eq("id", id)

    if (deleteError) {
      console.error("Error deleting newsletter:", deleteError)
      throw new Error("Failed to delete newsletter")
    }

    // Log the action to audit log if it exists
    try {
      await supabase.from("admin_audit_logs").insert({
        user_id: userData.user.id,
        action: "delete",
        resource_type: "newsletter",
        resource_id: id,
        details: { message: "Newsletter deleted" },
      })
    } catch (auditError) {
      // Don't fail the operation if audit logging fails
      console.warn("Failed to log audit entry:", auditError)
    }

    revalidatePath("/dashboard/admin/newsletters")
    return { success: true, message: "Newsletter deleted successfully" }
  } catch (error) {
    console.error("Error in deleteNewsletter:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

// Mock newsletter subscription for v0.dev preview
export async function subscribeToNewsletter(email: string) {
  try {
    // In a real app, this would call an API to subscribe the user
    console.log(`Subscribing email to newsletter: ${email}`)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return { success: true, message: "Successfully subscribed to newsletter!" }
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    return { success: false, message: "Failed to subscribe to newsletter." }
  }
}

// Mock newsletter sending for v0.dev preview
export async function sendNewsletterMock({
  subject,
  content,
  recipientList,
}: {
  subject: string
  content: string
  recipientList?: string
}) {
  try {
    // In a real app, this would send the newsletter to all subscribers
    console.log(`Sending newsletter with subject: ${subject}`)
    console.log(`Content: ${content}`)
    console.log(`Recipient list: ${recipientList || "all subscribers"}`)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return { success: true, message: "Newsletter sent successfully!" }
  } catch (error) {
    console.error("Error sending newsletter:", error)
    return { success: false, message: "Failed to send newsletter." }
  }
}

// Mock newsletter template creation for v0.dev preview
export async function saveNewsletterTemplate({
  name,
  subject,
  content,
}: {
  name: string
  subject: string
  content: string
}) {
  try {
    console.log(`Saving newsletter template: ${name}`)
    console.log(`Subject: ${subject}`)
    console.log(`Content: ${content}`)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    return { success: true, message: "Newsletter template saved successfully!" }
  } catch (error) {
    console.error("Error saving newsletter template:", error)
    return { success: false, message: "Failed to save newsletter template." }
  }
}
