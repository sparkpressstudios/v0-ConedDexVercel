import { baseTemplate } from "./base-template"

export const passwordResetTemplate = (resetUrl: string) => {
  const content = `
    <h1>Reset Your Password</h1>
    <p>We received a request to reset your password for your ConeDex account. If you didn't make this request, you can safely ignore this email.</p>
    <p>To reset your password, click the button below:</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </div>
    <p>This link will expire in 24 hours for security reasons.</p>
    <p>If the button above doesn't work, copy and paste the following URL into your browser:</p>
    <p style="word-break: break-all;">${resetUrl}</p>
    <p>If you have any questions, please contact our support team.</p>
    <p>Best regards,</p>
    <p>The ConeDex Team</p>
  `

  return baseTemplate(content)
}
