import { baseTemplate } from "./base-template"

export const newFlavorTemplate = (shopName: string, flavorName: string, flavorUrl: string) => {
  const content = `
    <h1>New Flavor Alert: ${flavorName}!</h1>
    <p>${shopName} just added a new flavor to their menu: <strong>${flavorName}</strong>!</p>
    <p>Be among the first to try it and add it to your ConeDex collection.</p>
    <div style="text-align: center;">
      <a href="${flavorUrl}" class="button">View Flavor Details</a>
    </div>
    <p>You're receiving this email because you follow ${shopName} on ConeDex. You can manage your notification preferences in your account settings.</p>
    <p>Happy tasting!</p>
    <p>The ConeDex Team</p>
  `

  return baseTemplate(content)
}
