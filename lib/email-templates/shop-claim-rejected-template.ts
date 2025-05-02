import { baseTemplate } from "./base-template"

export const shopClaimRejectedTemplate = (shopName: string, reason: string, supportUrl: string) => {
  const content = `
    <h1>Update on Your Shop Claim</h1>
    <p>We've reviewed your claim for <strong>${shopName}</strong> and unfortunately, we were unable to approve it at this time.</p>
    <p><strong>Reason:</strong> ${reason}</p>
    <p>If you believe this decision was made in error or you have additional documentation to support your claim, please contact our support team:</p>
    <div style="text-align: center;">
      <a href="${supportUrl}" class="button">Contact Support</a>
    </div>
    <p>Our team is happy to work with you to resolve any issues with your claim.</p>
    <p>Best regards,</p>
    <p>The ConeDex Team</p>
  `

  return baseTemplate(content)
}
