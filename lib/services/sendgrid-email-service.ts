// Remove any nodemailer imports and replace with SendGrid only
import sgMail from "@sendgrid/mail"

// Email data interface
export interface EmailData {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
} else {
  console.error("SENDGRID_API_KEY is not defined")
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    // For v0.dev preview, just log the email
    if (process.env.NODE_ENV === "development") {
      console.log("Sending email:", emailData)
      return true
    }

    const msg = {
      to: emailData.to,
      from: process.env.SENDGRID_FROM_EMAIL || "noreply@conedex.com",
      subject: emailData.subject,
      text: emailData.text || "Please view this email in an HTML-compatible email client",
      html: emailData.html,
    }

    await sgMail.send(msg)
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

/**
 * Send batch emails using SendGrid
 */
export async function sendBatchEmails(recipients: string[], subject: string, html: string): Promise<boolean> {
  try {
    // For v0.dev preview, just log the emails
    if (process.env.NODE_ENV === "development") {
      console.log(`Sending batch email to ${recipients.length} recipients:`, { subject, html })
      return true
    }

    // Split recipients into batches of 1000 to avoid SendGrid limits
    const batchSize = 1000
    const batches = []

    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize))
    }

    // Send to each batch
    for (const batch of batches) {
      const personalizations = batch.map((email) => ({
        to: email,
      }))

      await sgMail.send({
        personalizations,
        from: process.env.SENDGRID_FROM_EMAIL || "noreply@conedex.com",
        subject,
        html,
      })
    }

    return true
  } catch (error) {
    console.error("Error sending batch emails:", error)
    return false
  }
}

/**
 * Generate newsletter email HTML and subject
 */
export function generateNewsletterEmail(subject: string, content: string): { subject: string; html: string } {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${subject}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
        }
        .header { 
          background-color: #f8a100; 
          padding: 20px; 
          text-align: center; 
          border-radius: 5px 5px 0 0; 
        }
        .content { 
          padding: 20px; 
          background-color: #fff; 
          border: 1px solid #ddd; 
          border-top: none; 
          border-radius: 0 0 5px 5px; 
        }
        .footer { 
          text-align: center; 
          margin-top: 20px; 
          font-size: 12px; 
          color: #999; 
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${subject}</h1>
      </div>
      <div class="content">
        ${content}
        <p>Happy scooping!</p>
        <p>The ConeDex Team</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ConeDex. All rights reserved.</p>
        <p>You received this newsletter because you subscribed to ConeDex updates.</p>
      </div>
    </body>
    </html>
  `

  return { subject, html }
}
