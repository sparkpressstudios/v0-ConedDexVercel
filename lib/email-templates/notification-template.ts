import { baseTemplate } from "./base-template"

export const notificationTemplate = (subject: string, message: string, actionUrl?: string, actionText?: string) => {
  let actionButton = ""

  if (actionUrl && actionText) {
    actionButton = `
      <div style="text-align: center;">
        <a href="${actionUrl}" class="button">${actionText}</a>
      </div>
    `
  }

  const content = `
    <h1>${subject}</h1>
    <p>${message}</p>
    ${actionButton}
    <p>If you have any questions, please contact our support team.</p>
    <p>Best regards,</p>
    <p>The ConeDex Team</p>
  `

  return baseTemplate(content)
}
