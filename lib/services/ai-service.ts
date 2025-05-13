import OpenAI from "openai"
import { generateText } from "ai"
import { openai as aiSDKOpenAI } from "@ai-sdk/openai"

// Initialize OpenAI API with the current SDK approach
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function analyzeFlavor(
  name: string,
  description: string,
  imageUrl: string | null,
  existingFlavors: any[],
) {
  try {
    // Analyze text content
    const textAnalysisPrompt = `
      Analyze this ice cream flavor:
      Name: ${name}
      Description: ${description}
      
      Existing flavors for comparison:
      ${existingFlavors.map((f) => `- ${f.name}: ${f.description}`).join("\n")}
      
      Provide the following in JSON format:
      1. tags: Array of category tags (e.g., chocolate, fruit, nuts)
      2. rarity: Rarity classification (Common, Uncommon, Rare, Ultra Rare, or Legendary)
      3. contentSeverity: Content moderation severity (none, low, medium, high)
      4. contentIssues: Array of content issues if any
      5. isDuplicate: Boolean indicating if this is likely a duplicate
      6. similarTo: Name of the most similar flavor if it's a duplicate
      7. duplicateConfidence: Confidence score for duplicate detection (0-1)
    `

    const { text: textAnalysisResult } = await generateText({
      model: aiSDKOpenAI("gpt-4o"),
      prompt: textAnalysisPrompt,
    })

    const textAnalysis = JSON.parse(textAnalysisResult)

    // If there's an image, analyze it too
    let imageAnalysis = { imageSeverity: "none", imageIssues: [] }

    if (imageUrl) {
      const imageAnalysisPrompt = `
        Analyze this ice cream flavor image at URL: ${imageUrl}
        
        Provide the following in JSON format:
        1. imageSeverity: Image moderation severity (none, low, medium, high)
        2. imageIssues: Array of image issues if any
      `

      const { text: imageAnalysisResult } = await generateText({
        model: aiSDKOpenAI("gpt-4o"),
        prompt: imageAnalysisPrompt,
      })

      imageAnalysis = JSON.parse(imageAnalysisResult)
    }

    // Combine results
    return {
      ...textAnalysis,
      ...imageAnalysis,
    }
  } catch (error) {
    console.error("Error analyzing flavor:", error)
    // Return safe defaults if analysis fails
    return {
      tags: [],
      rarity: "Common",
      contentSeverity: "none",
      contentIssues: [],
      isDuplicate: false,
      similarTo: null,
      duplicateConfidence: 0,
      imageSeverity: "none",
      imageIssues: [],
    }
  }
}

// Adding the missing exports that were flagged in the deployment error

/**
 * Categorizes an ice cream flavor based on its name and description
 * @param name The flavor name
 * @param description The flavor description
 * @returns An array of category tags
 */
export async function categorizeFlavor(name: string, description: string): Promise<string[]> {
  try {
    const prompt = `
      Categorize this ice cream flavor:
      Name: ${name}
      Description: ${description}
      
      Return ONLY an array of category tags in JSON format.
      Example categories: chocolate, fruit, nuts, vanilla, coffee, caramel, seasonal, alcohol, vegan, etc.
      Return between 1-5 tags that best describe this flavor.
    `

    const { text } = await generateText({
      model: aiSDKOpenAI("gpt-4o"),
      prompt,
    })

    const result = JSON.parse(text)
    return Array.isArray(result) ? result : []
  } catch (error) {
    console.error("Error categorizing flavor:", error)
    // Return safe default if categorization fails
    return ["uncategorized"]
  }
}

/**
 * Checks if a flavor is potentially a duplicate of existing flavors
 * @param name The flavor name to check
 * @param description The flavor description
 * @param existingFlavors Array of existing flavors to compare against
 * @returns Object with duplicate detection results
 */
export async function checkForDuplicates(
  name: string,
  description: string,
  existingFlavors: Array<{ name: string; description: string }> = [],
): Promise<{
  isDuplicate: boolean
  similarTo: string | null
  duplicateConfidence: number
}> {
  try {
    if (!existingFlavors.length) {
      return {
        isDuplicate: false,
        similarTo: null,
        duplicateConfidence: 0,
      }
    }

    const prompt = `
      Check if this ice cream flavor is a duplicate:
      Name: ${name}
      Description: ${description}
      
      Existing flavors:
      ${existingFlavors.map((f) => `- ${f.name}: ${f.description}`).join("\n")}
      
      Return ONLY a JSON object with these properties:
      1. isDuplicate: Boolean indicating if this is likely a duplicate
      2. similarTo: Name of the most similar flavor if it's a duplicate, null otherwise
      3. duplicateConfidence: Confidence score for duplicate detection (0-1)
    `

    const { text } = await generateText({
      model: aiSDKOpenAI("gpt-4o"),
      prompt,
    })

    const result = JSON.parse(text)
    return {
      isDuplicate: Boolean(result.isDuplicate),
      similarTo: result.similarTo || null,
      duplicateConfidence: Number(result.duplicateConfidence) || 0,
    }
  } catch (error) {
    console.error("Error checking for duplicates:", error)
    // Return safe default if duplicate check fails
    return {
      isDuplicate: false,
      similarTo: null,
      duplicateConfidence: 0,
    }
  }
}

/**
 * Moderates content to check for inappropriate material
 * @param name The flavor name
 * @param description The flavor description
 * @param imageUrl Optional URL to an image to moderate
 * @returns Moderation results
 */
export async function moderateContent(
  name: string,
  description: string,
  imageUrl?: string | null,
): Promise<{
  contentSeverity: "none" | "low" | "medium" | "high"
  contentIssues: string[]
  imageSeverity: "none" | "low" | "medium" | "high"
  imageIssues: string[]
}> {
  try {
    // Moderate text content
    const textModerationPrompt = `
      Moderate this ice cream flavor content for inappropriate material:
      Name: ${name}
      Description: ${description}
      
      Return ONLY a JSON object with these properties:
      1. contentSeverity: Content moderation severity (none, low, medium, high)
      2. contentIssues: Array of content issues if any (empty array if none)
    `

    const { text: textModerationResult } = await generateText({
      model: aiSDKOpenAI("gpt-4o"),
      prompt: textModerationPrompt,
    })

    const textModeration = JSON.parse(textModerationResult)

    // Default image moderation result
    let imageModeration = {
      imageSeverity: "none" as const,
      imageIssues: [] as string[],
    }

    // If there's an image, moderate it too
    if (imageUrl) {
      const imageModerationPrompt = `
        Moderate this ice cream flavor image at URL: ${imageUrl}
        
        Return ONLY a JSON object with these properties:
        1. imageSeverity: Image moderation severity (none, low, medium, high)
        2. imageIssues: Array of image issues if any (empty array if none)
      `

      const { text: imageModerationResult } = await generateText({
        model: aiSDKOpenAI("gpt-4o"),
        prompt: imageModerationPrompt,
      })

      imageModeration = JSON.parse(imageModerationResult)
    }

    // Combine results
    return {
      contentSeverity: textModeration.contentSeverity || "none",
      contentIssues: Array.isArray(textModeration.contentIssues) ? textModeration.contentIssues : [],
      imageSeverity: imageModeration.imageSeverity || "none",
      imageIssues: Array.isArray(imageModeration.imageIssues) ? imageModeration.imageIssues : [],
    }
  } catch (error) {
    console.error("Error moderating content:", error)
    // Return safe defaults if moderation fails
    return {
      contentSeverity: "none",
      contentIssues: [],
      imageSeverity: "none",
      imageIssues: [],
    }
  }
}
