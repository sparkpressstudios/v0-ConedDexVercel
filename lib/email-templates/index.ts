// Simple email template functions that work in browser environment

export const welcomeTemplate = (name: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #4f46e5;">Welcome to ConeDex, ${name}!</h1>
    <p>Thank you for joining our community of ice cream enthusiasts.</p>
    <p>Start exploring ice cream shops and flavors near you!</p>
    <div style="margin-top: 30px; padding: 20px; background-color: #f3f4f6; border-radius: 5px;">
      <p style="margin: 0;">Happy ice cream hunting!</p>
      <p style="margin: 5px 0 0;">The ConeDex Team</p>
    </div>
  </div>
`

export const passwordResetTemplate = (resetLink: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #4f46e5;">Password Reset Request</h1>
    <p>You requested to reset your password. Click the button below to set a new password:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Reset Password</a>
    </div>
    <p>If you didn't request this, please ignore this email.</p>
    <div style="margin-top: 30px; padding: 20px; background-color: #f3f4f6; border-radius: 5px;">
      <p style="margin: 0;">The ConeDex Team</p>
    </div>
  </div>
`

export const verificationTemplate = (verificationLink: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #4f46e5;">Email Verification</h1>
    <p>Please verify your email address by clicking the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Verify Email</a>
    </div>
    <p>If you didn't create an account with us, please ignore this email.</p>
    <div style="margin-top: 30px; padding: 20px; background-color: #f3f4f6; border-radius: 5px;">
      <p style="margin: 0;">The ConeDex Team</p>
    </div>
  </div>
`

export const newsletterTemplate = (content: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; padding: 20px 0;">
      <h1 style="color: #4f46e5;">ConeDex Newsletter</h1>
    </div>
    <div style="padding: 20px; background-color: white; border-radius: 5px;">
      ${content}
    </div>
    <div style="margin-top: 30px; padding: 20px; background-color: #f3f4f6; border-radius: 5px; text-align: center;">
      <p style="margin: 0;">© ${new Date().getFullYear()} ConeDex. All rights reserved.</p>
      <p style="margin: 10px 0 0;">
        <a href="#" style="color: #4f46e5; text-decoration: none; margin: 0 10px;">Unsubscribe</a>
        <a href="#" style="color: #4f46e5; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
      </p>
    </div>
  </div>
`
