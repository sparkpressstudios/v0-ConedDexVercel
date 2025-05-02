import { baseTemplate } from "./base-template"

export const shopFollowTemplate = (shopName: string, shopUrl: string) => {
  const content = `
    <h1>You're Now Following ${shopName}!</h1>
    <p>You're now following ${shopName} on ConeDex. You'll receive updates when they add new flavors, post announcements, or have special promotions.</p>
    <p>Visit their shop page to see their current menu and latest updates:</p>
    <div style="text-align: center;">
      <a href="${shopUrl}" class="button">Visit ${shopName}</a>
    </div>
    <p>You can manage your followed shops and notification preferences in your account settings.</p>
    <p>Happy ice cream exploring!</p>
    <p>The ConeDex Team</p>
  `

  return baseTemplate(content)
}
