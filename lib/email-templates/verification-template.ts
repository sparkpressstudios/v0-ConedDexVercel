import { baseTemplate } from "./base-template"

export const verificationTemplate = (verificationUrl: string) => {
  const content = `
    <h1>Verify Your Email Address</h1>
    <p>Thank you for registering with ConeDex! To complete your registration, we need to verify your email address.</p>
    <p>Please click the button below to verify your email:</p>
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
    </div>
    <p>This link will expire in 24 hours for security reasons.</p>
    <p>If the button above doesn't work, copy and paste the following URL into your browser:</p>
    <p style="word-break: break-all;">${verificationUrl}</p>
    <p>If you have any questions or didn't create an account, please contact our support team.</p>
    <p>Best regards,</p>
    <p>The ConeDex Team</p>
  `

  return baseTemplate(content)
}
