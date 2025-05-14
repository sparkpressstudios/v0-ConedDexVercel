"use client"
import sgMail from "@sendgrid/mail"

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
} else {
  console.error("SENDGRID_API_KEY is not defined")
}

// Email data interface
export interface EmailData {
  to: string | string[]
  subject: string
  text?: string
  html: string
  from?: string
}

/**
 * SendGrid Email Service
 */
export class SendGridEmailService {
  private static instance: SendGridEmailService
  private fromEmail: string

  private constructor() {
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || "noreply@conedex.com"
  }

  public static getInstance(): SendGridEmailService {
    if (!SendGridEmailService.instance) {
      SendGridEmailService.instance = new SendGridEmailService()
    }
    return SendGridEmailService.instance
  }

  /**
   * Send an email using SendGrid
   */
  public async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const msg = {
        to: emailData.to,
        from: emailData.from || this.fromEmail,
        subject: emailData.subject,
        text: emailData.text || "Please view this email in an HTML-compatible email client",
        html: emailData.html,
      }

      await sgMail.send(msg)
      return true
    } catch (error) {
      console.error("Error sending email:", error)
      if (error instanceof Error) {
        console.error(`SendGrid error: ${error.message}`)
      }
      return false
    }
  }

  /**
   * Send a batch of emails using SendGrid
   */
  public async sendBatchEmails(recipients: string[], subject: string, html: string): Promise<boolean> {
    try {
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
          from: this.fromEmail,
          subject,
          html,
        })
      }

      return true
    } catch (error) {
      console.error("Error sending batch emails:", error)
      if (error instanceof Error) {
        console.error(`SendGrid batch error: ${error.message}`)
      }
      return false
    }
  }
}

// Mock email service for browser compatibility
export function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  console.log(`[Mock] Sending email to ${to} with subject: ${subject}`)
  return Promise.resolve(true)
}

export function sendBatchEmails(recipients: string[], subject: string, html: string) {
  console.log(`[Mock] Sending batch email to ${recipients.length} recipients with subject: ${subject}`)
  return Promise.resolve(true)
}

export async function sendTemplatedEmail({
  to,
  templateId,
  dynamicData,
}: {
  to: string
  templateId: string
  dynamicData: Record<string, any>
}) {
  try {
    // For v0.dev preview, we'll mock the templated email sending
    console.log(`Templated email would be sent to: ${to}`)
    console.log(`Template ID: ${templateId}`)
    console.log(`Dynamic data:`, dynamicData)

    return {
      success: true,
      message: "Templated email sent successfully (preview mode)",
    }
  } catch (error) {
    console.error("Error sending templated email:", error)
    return {
      success: false,
      message: "Failed to send templated email",
    }
  }
}

// Email template generators
export function generateWelcomeEmail(name: string): { subject: string; html: string } {
  const subject = "Welcome to ConeDex!"
  const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/login`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to ConeDex!</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8a100; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
        <h1>Welcome to ConeDex!</h1>
      </div>
      <div style="padding: 20px; background-color: #fff; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
        <p>Hi ${name},</p>
        <p>Welcome to ConeDex, the ultimate platform for ice cream enthusiasts! We're excited to have you join our community.</p>
        <p>With ConeDex, you can:</p>
        <ul>
          <li>Discover new ice cream shops and flavors</li>
          <li>Track your favorite flavors</li>
          <li>Connect with other ice cream lovers</li>
          <li>Earn badges and climb the leaderboard</li>
        </ul>
        <p>Ready to start your ice cream adventure?</p>
        <a href="${loginUrl}" style="display: inline-block; background-color: #f8a100; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 20px 0;">Log In to Your Account</a>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Happy scooping!</p>
        <p>The ConeDex Team</p>
      </div>
      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
        <p>&copy; ${new Date().getFullYear()} ConeDex. All rights reserved.</p>
        <p>This email was sent to you because you signed up for ConeDex.</p>
      </div>
    </body>
    </html>
  `

  return { subject, html }
}

export function generatePasswordResetEmail(resetToken: string): { subject: string; html: string } {
  const subject = "Reset Your ConeDex Password"
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${resetToken}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Your ConeDex Password</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8a100; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
        <h1>Reset Your Password</h1>
      </div>
      <div style="padding: 20px; background-color: #fff; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
        <p>Hello,</p>
        <p>We received a request to reset your password for your ConeDex account. If you didn't make this request, you can safely ignore this email.</p>
        <p>To reset your password, click the button below:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #f8a100; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 20px 0;">Reset Password</a>
        <p style="color: #cc0000; font-size: 14px;">This link will expire in 1 hour for security reasons.</p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p>${resetUrl}</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,</p>
        <p>The ConeDex Team</p>
      </div>
      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
        <p>&copy; ${new Date().getFullYear()} ConeDex. All rights reserved.</p>
      </div>
    </body>
    </html>
  `

  return { subject, html }
}

export function generateNewsletterEmail(subject: string, content: string) {
  return {
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">${subject}</h1>
        <div style="line-height: 1.6; color: #444;">
          ${content}
        </div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
          <p>You're receiving this email because you subscribed to our newsletter.</p>
          <p>To unsubscribe, click <a href="#" style="color: #999;">here</a>.</p>
        </div>
      </div>
    `,
  }
}
