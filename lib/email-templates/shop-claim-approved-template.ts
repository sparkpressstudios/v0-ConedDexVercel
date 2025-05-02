import { baseTemplate } from "./base-template"

export const shopClaimApprovedTemplate = (shopName: string, shopUrl: string) => {
  const content = `
    <h1>Your Shop Claim Has Been Approved!</h1>
    <p>Great news! Your claim for <strong>${shopName}</strong> has been approved by our team.</p>
    <p>You now have full access to manage your shop's profile, menu, and engage with your customers on ConeDex.</p>
    <p>Get started by visiting your shop dashboard:</p>
    <div style="text-align: center;">
      <a href="${shopUrl}" class="button">Go to Shop Dashboard</a>
    </div>
    <p>Here are some things you can do now:</p>
    <ul>
      <li>Update your shop's profile and hours</li>
      <li>Add and manage your flavor menu</li>
      <li>Create special announcements</li>
      <li>Respond to customer reviews</li>
      <li>View analytics about your shop's performance</li>
    </ul>
    <p>If you have any questions about managing your shop on ConeDex, our support team is here to help!</p>
    <p>Best regards,</p>
    <p>The ConeDex Team</p>
  `

  return baseTemplate(content)
}
