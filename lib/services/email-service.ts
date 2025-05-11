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
   * Send a welcome email to new users
   */
  public async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/login`
    const html = generateWelcomeEmailHtml(name, loginUrl)

    return this.sendEmail({
      to: email,
      subject: "Welcome to ConeDex!",
      html,
    })
  }

  /**
   * Send a password reset email
   */
  public async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${resetToken}`
    const html = generatePasswordResetEmailHtml(resetUrl)

    return this.sendEmail({
      to: email,
      subject: "Reset Your ConeDex Password",
      html,
    })
  }

  /**
   * Send a verification email
   */
  public async sendVerificationEmail(email: string, verificationToken: string): Promise<boolean> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email?token=${verificationToken}`
    const html = generateVerificationEmailHtml(verificationUrl)

    return this.sendEmail({
      to: email,
      subject: "Verify Your ConeDex Email",
      html,
    })
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

// For backward compatibility
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  return EmailService.getInstance().sendEmail(emailData)
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  return EmailService.getInstance().sendWelcomeEmail(email, name)
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  return EmailService.getInstance().sendPasswordResetEmail(email, resetToken)
}

export async function sendVerificationEmail(email: string, verificationToken: string): Promise<boolean> {
  return EmailService.getInstance().sendVerificationEmail(email, verificationToken)
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
 * Generate HTML for welcome email
 */
function generateWelcomeEmailHtml(name: string, loginUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Welcome to ConeDex!</title>
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
        <h1>Welcome to ConeDex!</h1>
      </div>
      <div class="content">
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
        <a href="${loginUrl}" class="button">Log In to Your Account</a>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Happy scooping!</p>
        <p>The ConeDex Team</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ConeDex. All rights reserved.</p>
        <p>This email was sent to you because you signed up for ConeDex.</p>
      </div>
    </body>
    </html>
  `
}

/**
 * Generate HTML for password reset email
 */
function generatePasswordResetEmailHtml(resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Reset Your ConeDex Password</title>
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
        .warning {
          color: #cc0000;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Reset Your Password</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>We received a request to reset your password for your ConeDex account. If you didn't make this request, you can safely ignore this email.</p>
        <p>To reset your password, click the button below:</p>
        <a href="${resetUrl}" class="button">Reset Password</a>
        <p class="warning">This link will expire in 1 hour for security reasons.</p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p>${resetUrl}</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,</p>
        <p>The ConeDex Team</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ConeDex. All rights reserved.</p>
      </div>
    </body>
    </html>
  `
}

/**
 * Generate HTML for verification email
 */
function generateVerificationEmailHtml(verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Verify Your ConeDex Email</title>
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
        <h1>Verify Your Email</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>Thanks for signing up for ConeDex! Please verify your email address to complete your registration.</p>
        <p>Click the button below to verify your email:</p>
        <a href="${verificationUrl}" class="button">Verify Email</a>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p>${verificationUrl}</p>
        <p>If you didn't create an account with ConeDex, you can safely ignore this email.</p>
        <p>Best regards,</p>
        <p>The ConeDex Team</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ConeDex. All rights reserved.</p>
      </div>
    </body>
    </html>
  `
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
