import { baseTemplate } from "./base-template"

export const welcomeTemplate = (name: string, loginUrl: string) => {
  const content = `
    <h1>Welcome to ConeDex, ${name}!</h1>
    <p>Thank you for joining our community of ice cream enthusiasts. We're excited to have you on board!</p>
    <p>With ConeDex, you can:</p>
    <ul>
      <li>Discover new ice cream flavors</li>
      <li>Track your favorite shops</li>
      <li>Share your ice cream experiences</li>
      <li>Connect with other ice cream lovers</li>
    </ul>
    <p>Ready to get started?</p>
    <div style="text-align: center;">
      <a href="${loginUrl}" class="button">Log In to Your Account</a>
    </div>
    <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
    <p>Happy scooping!</p>
    <p>The ConeDex Team</p>
  `

  return baseTemplate(content)
}
