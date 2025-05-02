export class EmailService {
  private from: string

  constructor() {
    this.from = process.env.SENDGRID_FROM_EMAIL || "noreply@conedex.app"
  }

  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: to }],
              subject: "Welcome to ConeDex!",
            },
          ],
          from: { email: this.from },
          content: [
            {
              type: "text/html",
              value: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #FF6B6B;">Welcome to ConeDex, ${name}!</h1>
                  <p>Thank you for joining our community of ice cream enthusiasts!</p>
                  <p>With ConeDex, you can:</p>
                  <ul>
                    <li>Track your favorite ice cream flavors</li>
                    <li>Discover new shops in your area</li>
                    <li>Share your experiences with others</li>
                  </ul>
                  <p>Get started by exploring shops near you or logging your first flavor!</p>
                  <div style="margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="background-color: #FF6B6B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                  </div>
                  <p>Happy scooping!</p>
                  <p>The ConeDex Team</p>
                </div>
              `,
            },
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("SendGrid API error:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error sending welcome email:", error)
      return false
    }
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<boolean> {
    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: to }],
              subject: "Reset Your ConeDex Password",
            },
          ],
          from: { email: this.from },
          content: [
            {
              type: "text/html",
              value: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #FF6B6B;">Reset Your Password</h1>
                  <p>We received a request to reset your password for ConeDex.</p>
                  <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
                  <div style="margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #FF6B6B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                  </div>
                  <p>If you didn't request a password reset, you can safely ignore this email.</p>
                  <p>The ConeDex Team</p>
                </div>
              `,
            },
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("SendGrid API error:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error sending password reset email:", error)
      return false
    }
  }

  async sendVerificationEmail(to: string, verificationLink: string): Promise<boolean> {
    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: to }],
              subject: "Verify Your ConeDex Email",
            },
          ],
          from: { email: this.from },
          content: [
            {
              type: "text/html",
              value: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #FF6B6B;">Verify Your Email</h1>
                  <p>Thank you for signing up for ConeDex!</p>
                  <p>Please click the button below to verify your email address:</p>
                  <div style="margin: 30px 0;">
                    <a href="${verificationLink}" style="background-color: #FF6B6B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
                  </div>
                  <p>If you didn't create an account with ConeDex, you can safely ignore this email.</p>
                  <p>The ConeDex Team</p>
                </div>
              `,
            },
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("SendGrid API error:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error sending verification email:", error)
      return false
    }
  }

  async sendShopClaimApprovedEmail(to: string, shopName: string): Promise<boolean> {
    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: to }],
              subject: `Your Claim for ${shopName} Has Been Approved!`,
            },
          ],
          from: { email: this.from },
          content: [
            {
              type: "text/html",
              value: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #FF6B6B;">Claim Approved!</h1>
                  <p>Great news! Your claim for <strong>${shopName}</strong> has been approved.</p>
                  <p>You now have full access to manage your shop's profile, including:</p>
                  <ul>
                    <li>Updating shop information</li>
                    <li>Managing flavor listings</li>
                    <li>Responding to customer reviews</li>
                    <li>Posting announcements</li>
                  </ul>
                  <div style="margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/shop" style="background-color: #FF6B6B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Manage Your Shop</a>
                  </div>
                  <p>If you have any questions, please don't hesitate to contact our support team.</p>
                  <p>The ConeDex Team</p>
                </div>
              `,
            },
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("SendGrid API error:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error sending shop claim approved email:", error)
      return false
    }
  }

  async sendShopClaimRejectedEmail(to: string, shopName: string, reason: string): Promise<boolean> {
    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: to }],
              subject: `Update on Your Claim for ${shopName}`,
            },
          ],
          from: { email: this.from },
          content: [
            {
              type: "text/html",
              value: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #FF6B6B;">Claim Update</h1>
                  <p>We've reviewed your claim for <strong>${shopName}</strong>.</p>
                  <p>Unfortunately, we were unable to verify your ownership at this time.</p>
                  <p><strong>Reason:</strong> ${reason}</p>
                  <p>You can submit a new claim with additional verification information:</p>
                  <div style="margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/shop/claim" style="background-color: #FF6B6B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Submit New Claim</a>
                  </div>
                  <p>If you believe this was an error or have questions, please contact our support team.</p>
                  <p>The ConeDex Team</p>
                </div>
              `,
            },
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("SendGrid API error:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error sending shop claim rejected email:", error)
      return false
    }
  }

  async sendNewFlavorNotification(to: string, shopName: string, flavorName: string): Promise<boolean> {
    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: to }],
              subject: `New Flavor Alert: ${flavorName} at ${shopName}`,
            },
          ],
          from: { email: this.from },
          content: [
            {
              type: "text/html",
              value: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #FF6B6B;">New Flavor Alert! 🍦</h1>
                  <p><strong>${shopName}</strong> just added a new flavor: <strong>${flavorName}</strong>!</p>
                  <p>Be one of the first to try it and add it to your ConeDex collection.</p>
                  <div style="margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shops/${shopName}" style="background-color: #FF6B6B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Shop</a>
                  </div>
                  <p>Happy tasting!</p>
                  <p>The ConeDex Team</p>
                  <p style="font-size: 12px; color: #999; margin-top: 30px;">
                    You're receiving this because you follow ${shopName} on ConeDex.
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings/notifications" style="color: #999;">Manage notification preferences</a>
                  </p>
                </div>
              `,
            },
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("SendGrid API error:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error sending new flavor notification:", error)
      return false
    }
  }

  async sendNewsletter(to: string, subject: string, content: string): Promise<boolean> {
    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: to }],
              subject: subject,
            },
          ],
          from: { email: this.from },
          content: [
            {
              type: "text/html",
              value: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  ${content}
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                    <p>© ${new Date().getFullYear()} ConeDex. All rights reserved.</p>
                    <p>
                      You're receiving this email because you subscribed to ConeDex newsletters.
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings/notifications" style="color: #999;">
                        Unsubscribe or manage email preferences
                      </a>
                    </p>
                  </div>
                </div>
              `,
            },
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("SendGrid API error:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error sending newsletter:", error)
      return false
    }
  }
}
