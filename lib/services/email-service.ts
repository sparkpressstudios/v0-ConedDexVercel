"use client"

// Import only SendGrid, no nodemailer
import sgMail from "@sendgrid/mail"

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
} else {
  console.error("SENDGRID_API_KEY is not defined")
}

// Email template types
export type EmailTemplate =
  | "welcome"
  | "password-reset"
  | "verification"
  | "notification"
  | "shop-follow"
  | "new-flavor"
  | "newsletter"
  | "shop-claim-approved"
  | "shop-claim-rejected"

// Email data interface
export interface EmailData {
  to: string
  subject: string
  text?: string
  html?: string
  data?: Record<string, any>
}

// Mock email service for browser compatibility
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    console.log(`[Mock] Sending email to ${to} with subject: ${subject}`)
    // In a real implementation, this would call an API endpoint
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

export async function sendTemplatedEmail(
  to: string,
  templateName: string,
  data: Record<string, any>,
): Promise<boolean> {
  try {
    console.log(`[Mock] Sending templated email "${templateName}" to ${to} with data:`, data)
    // In a real implementation, this would call an API endpoint
    return true
  } catch (error) {
    console.error("Error sending templated email:", error)
    return false
  }
}

export async function sendBulkEmail(recipients: string[], subject: string, html: string): Promise<boolean> {
  try {
    console.log(`[Mock] Sending bulk email to ${recipients.length} recipients with subject: ${subject}`)
    // In a real implementation, this would call an API endpoint
    return true
  } catch (error) {
    console.error("Error sending bulk email:", error)
    return false
  }
}

// Re-export the functions

// Add any additional email-related functions here
export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: "Welcome to ConeDex!",
    html: `
      <div>
        <h1>Welcome to ConeDex, ${name}!</h1>
        <p>Thank you for joining our community of ice cream enthusiasts.</p>
        <p>Start exploring ice cream shops and flavors near you!</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  return sendEmail({
    to: email,
    subject: "Reset Your ConeDex Password",
    html: `
      <div>
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  })
}

export async function sendVerificationEmail(email: string, verificationLink: string) {
  return sendEmail({
    to: email,
    subject: "Verify Your ConeDex Email",
    html: `
      <div>
        <h1>Email Verification</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationLink}">Verify Email</a>
      </div>
    `,
  })
}

/**
 * Email Service class for handling all email operations
 */
export class EmailService {
  private static instance: EmailService

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  /**
   * Send an email using SendGrid
   */
  public async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // For v0.dev preview, just log the email
      if (typeof window !== "undefined") {
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
      // Log detailed error information
      if (error instanceof Error) {
        console.error(`SendGrid error: ${error.message}`)
      }
      return false
    }
  }

  /**
   * Send a notification email
   */
  public async sendNotificationEmail(
    email: string,
    subject: string,
    message: string,
    actionUrl?: string,
    actionText?: string,
  ): Promise<boolean> {
    const html = generateNotificationEmailHtml(subject, message, actionUrl, actionText)

    return this.sendEmail({
      to: email,
      subject,
      html,
    })
  }

  /**
   * Send a shop follow notification email
   */
  public async sendShopFollowEmail(email: string, shopName: string, shopId: string): Promise<boolean> {
    const shopUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/shops/${shopId}`
    const html = generateShopFollowEmailHtml(shopName, shopUrl)

    return this.sendEmail({
      to: email,
      subject: `You're now following ${shopName} on ConeDex!`,
      html,
    })
  }

  /**
   * Send a new flavor notification email
   */
  public async sendNewFlavorEmail(
    email: string,
    shopName: string,
    flavorName: string,
    flavorId: string,
  ): Promise<boolean> {
    const flavorUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/flavors/${flavorId}`
    const html = generateNewFlavorEmailHtml(shopName, flavorName, flavorUrl)

    return this.sendEmail({
      to: email,
      subject: `${shopName} just added a new flavor: ${flavorName}!`,
      html,
    })
  }

  /**
   * Send a newsletter to multiple recipients
   */
  public async sendNewsletter(recipients: string[], subject: string, content: string): Promise<boolean> {
    const html = generateNewsletterEmailHtml(subject, content)

    try {
      // For v0.dev preview, just log the email
      if (typeof window !== "undefined") {
        console.log(`Sending newsletter to ${recipients.length} recipients:`, { subject, content })
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
      console.error("Error sending newsletter:", error)
      // Log detailed error information
      if (error instanceof Error) {
        console.error(`SendGrid batch error: ${error.message}`)
      }
      return false
    }
  }

  /**
   * Send shop claim approval email
   */
  public async sendShopClaimApprovedEmail(email: string, shopName: string, shopId: string): Promise<boolean> {
    const shopUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/shop`
    const html = generateShopClaimApprovedEmailHtml(shopName, shopUrl)

    return this.sendEmail({
      to: email,
      subject: `Your claim for ${shopName} has been approved!`,
      html,
    })
  }

  /**
   * Send shop claim rejection email
   */
  public async sendShopClaimRejectedEmail(email: string, shopName: string, reason: string): Promise<boolean> {
    const supportUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/contact`
    const html = generateShopClaimRejectedEmailHtml(shopName, reason, supportUrl)

    return this.sendEmail({
      to: email,
      subject: `Update on your claim for ${shopName}`,
      html,
    })
  }
}

export async function sendNotificationEmail(
  email: string,
  subject: string,
  message: string,
  actionUrl?: string,
  actionText?: string,
): Promise<boolean> {
  return EmailService.getInstance().sendNotificationEmail(email, subject, message, actionUrl, actionText)
}

export async function sendShopFollowEmail(email: string, shopName: string, shopId: string): Promise<boolean> {
  return EmailService.getInstance().sendShopFollowEmail(email, shopName, shopId)
}

export async function sendNewFlavorEmail(
  email: string,
  shopName: string,
  flavorName: string,
  flavorId: string,
): Promise<boolean> {
  return EmailService.getInstance().sendNewFlavorEmail(email, shopName, flavorName, flavorId)
}

export async function sendNewsletter(recipients: string[], subject: string, content: string): Promise<boolean> {
  return EmailService.getInstance().sendNewsletter(recipients, subject, content)
}

export async function sendShopClaimApprovedEmail(email: string, shopName: string, shopId: string): Promise<boolean> {
  return EmailService.getInstance().sendShopClaimApprovedEmail(email, shopName, shopId)
}

export async function sendShopClaimRejectedEmail(email: string, shopName: string, reason: string): Promise<boolean> {
  return EmailService.getInstance().sendShopClaimRejectedEmail(email, shopName, reason)
}

/**
 * Generate HTML for notification email
 */
function generateNotificationEmailHtml(
  subject: string,
  message: string,
  actionUrl?: string,
  actionText?: string,
): string {
  return `
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
        .button {
          display: inline-block;
          background-color: #f8a100;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 20px 0;
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
        <p>Hello,</p>
        <p>${message}</p>
        ${actionUrl && actionText ? `<a href="${actionUrl}" class="button">${actionText}</a>` : ""}
        <p>Best regards,</p>
        <p>The ConeDex Team</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ConeDex. All rights reserved.</p>
        <p>You received this email because you have notifications enabled for your ConeDex account.</p>
      </div>
    </body>
    </html>
  `
}

/**
 * Generate HTML for shop follow email
 */
function generateShopFollowEmailHtml(shopName: string, shopUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>You're now following ${shopName} on ConeDex!</title>
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
        .button {
          display: inline-block;
          background-color: #f8a100;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 20px 0;
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
        <h1>You're Following ${shopName}!</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>You're now following <strong>${shopName}</strong> on ConeDex! You'll receive updates when they add new flavors or make announcements.</p>
        <p>Visit their shop page to see their current menu and latest updates:</p>
        <a href="${shopUrl}" class="button">View Shop Page</a>
        <p>Happy ice cream exploring!</p>
        <p>The ConeDex Team</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ConeDex. All rights reserved.</p>
        <p>You can manage your notification preferences in your account settings.</p>
      </div>
    </body>
    </html>
  `
}

/**
 * Generate HTML for new flavor email
 */
function generateNewFlavorEmailHtml(shopName: string, flavorName: string, flavorUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${shopName} just added a new flavor: ${flavorName}!</title>
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
        .button {
          display: inline-block;
          background-color: #f8a100;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer { 
          text-align: center; 
          margin-top: 20px; 
          font-size: 12px; 
          color: #999; 
        }
        .flavor-highlight {
          font-size: 18px;
          font-weight: bold;
          color: #f8a100;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>New Flavor Alert!</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p><strong>${shopName}</strong> just added a new flavor to their menu:</p>
        <p class="flavor-highlight">${flavorName}</p>
        <p>Be one of the first to try it and add it to your ConeDex collection!</p>
        <a href="${flavorUrl}" class="button">View Flavor Details</a>
        <p>Happy tasting!</p>
        <p>The ConeDex Team</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ConeDex. All rights reserved.</p>
        <p>You received this email because you follow ${shopName} on ConeDex.</p>
        <p>You can manage your notification preferences in your account settings.</p>
      </div>
    </body>
    </html>
  `
}

/**
 * Generate HTML for newsletter email
 */
function generateNewsletterEmailHtml(subject: string, content: string): string {
  return `
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
        .button {
          display: inline-block;
          background-color: #f8a100;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 20px 0;
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
        <p>You can manage your email preferences in your account settings.</p>
      </div>
    </body>
    </html>
  `
}

/**
 * Generate HTML for shop claim approved email
 */
function generateShopClaimApprovedEmailHtml(shopName: string, shopUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Your claim for ${shopName} has been approved!</title>
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
        .button {
          display: inline-block;
          background-color: #f8a100;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 20px 0;
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
        <h1>Your claim for ${shopName} has been approved!</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>Your claim for <strong>${shopName}</strong> has been approved! You can now manage your shop details and add new flavors.</p>
        <p>Visit your shop dashboard to get started:</p>
        <a href="${shopUrl}" class="button">Go to Shop Dashboard</a>
        <p>Welcome to the ConeDex community!</p>
        <p>The ConeDex Team</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ConeDex. All rights reserved.</p>
        <p>You received this email because you requested to claim ${shopName} on ConeDex.</p>
      </div>
    </body>
    </html>
  `
}

/**
 * Generate HTML for shop claim rejection email
 */
function generateShopClaimRejectedEmailHtml(shopName: string, reason: string, supportUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Update on your claim for ${shopName}</title>
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
        .button {
          display: inline-block;
          background-color: #f8a100;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 20px 0;
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
        <h1>Claim Update for ${shopName}</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>We regret to inform you that your claim for <strong>${shopName}</strong> has been rejected.</p>
        <p>Reason: ${reason}</p>
        <p>If you believe this is an error or have additional information to provide, please contact our support team:</p>
        <a href="${supportUrl}" class="button">Contact Support</a>
        <p>We appreciate your interest in ConeDex.</p>
        <p>The ConeDex Team</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ConeDex. All rights reserved.</p>
        <p>You received this email because you requested to claim ${shopName} on ConeDex.</p>
      </div>
    </body>
    </html>
  `
}
