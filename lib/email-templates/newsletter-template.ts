import { baseTemplate } from "./base-template"

export const newsletterTemplate = (subject: string, content: string) => {
  return baseTemplate(`
    <h1>${subject}</h1>
    ${content}
  `)
}
