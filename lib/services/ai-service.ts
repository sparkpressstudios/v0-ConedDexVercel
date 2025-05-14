import OpenAI from "openai"
import { createClient } from "@/lib/supabase/server"

// Initialize OpenAI client
let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.warn("OpenAI API key not found. AI features will not work.")
      // Return a mock client that will gracefully fail
      return {
        chat: {
          completions: {
            create: async () => {
              throw new Error("OpenAI API key not configured")
            },
          },
        },
        embeddings: {
          create: async () => {
            throw new Error("OpenAI API key not configured")
          },
        },
        moderations: {
          create: async () => {
            throw new Error("OpenAI API key not configured")
          },
        },
      } as unknown as OpenAI
    }

    openaiClient = new OpenAI({
      apiKey: apiKey,
    })
  }

  return openaiClient
}

/**
 * Comprehensive content moderation for flavor submissions
 * Checks for vulgar language, inappropriate content, and other policy violations
 */
export async function moderateContent(text: string): Promise<{
  flagged: boolean
  categories: string[]
  flags: string[]
  severity: "none" | "low" | "medium" | "high"
}> {
  try {
    if (!text || text.trim() === "") {
      return { flagged: false, categories: [], flags: [], severity: "none" }
    }

    const client = getOpenAIClient()

    // First use OpenAI's dedicated moderation endpoint
    try {
      const moderationResult = await client.moderations.create({ input: text })

      if (moderationResult.results[0]?.flagged) {
        // Extract flagged categories
        const flaggedCategories = Object.entries(moderationResult.results[0].categories)
          .filter(([_, value]) => value)
          .map(([key, _]) => key)

        return {
          flagged: true,
          categories: [],
          flags: flaggedCategories,
          severity: "high", // Direct API flagging is considered high severity
        }
      }
    } catch (error) {
      console.error("Error using OpenAI moderation API:", error)
      // Continue with the backup method if moderation API fails
    }

    // Backup: Use chat completion for more nuanced analysis
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a content moderation system for an ice cream flavor tracking app. 
          Analyze the following text for inappropriate content.
          Return a JSON object with the following structure:
          {
            "flagged": boolean,
            "categories": string[],
            "flags": string[],
            "severity": "none" | "low" | "medium" | "high"
          }
          
          Categories should be ice cream flavor categories like "chocolate", "fruit", "vanilla", etc.
          Flags should be reasons for flagging like "profanity", "adult content", "hate speech", etc.
          Severity should indicate how problematic the content is.
          Only flag content that is truly inappropriate.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    })

    const result = JSON.parse(
      response.choices[0]?.message?.content || '{"flagged": false, "categories": [], "flags": [], "severity": "none"}',
    )

    return {
      flagged: result.flagged || false,
      categories: result.categories || [],
      flags: result.flags || [],
      severity: result.severity || "none",
    }
  } catch (error) {
    console.error("Error moderating content:", error)
    // Return safe default in case of error
    return { flagged: false, categories: [], flags: [], severity: "none" }
  }
}

/**
 * Check for duplicate flavors in the database
 */
export async function checkForDuplicates(
  flavorName: string,
  description: string,
  existingFlavors: Array<{ name: string; description: string }> = [],
): Promise<{
  isDuplicate: boolean
  duplicateConfidence: number
  similarTo: string | null
}> {
  try {
    if (!flavorName) {
      return { isDuplicate: false, duplicateConfidence: 0, similarTo: null }
    }

    // If no existing flavors were provided, fetch them from the database
    if (existingFlavors.length === 0) {
      try {
        const supabase = createClient()
        const { data } = await supabase.from("flavor_logs").select("name, description").limit(100)

        if (data && data.length > 0) {
          existingFlavors = data
        }
      } catch (error) {
        console.error("Error fetching existing flavors:", error)
      }
    }

    // If still no flavors, return no duplicates
    if (existingFlavors.length === 0) {
      return { isDuplicate: false, duplicateConfidence: 0, similarTo: null }
    }

    const client = getOpenAIClient()

    const existingFlavorsText = existingFlavors
      .map((f, i) => `${i + 1}. ${f.name}: ${f.description || "No description"}`)
      .join("\n")

    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a duplicate detector for ice cream flavors. Compare the new flavor with existing flavors.
          Return a JSON object with the following structure:
          {
            "isDuplicate": boolean,
            "duplicateConfidence": number,
            "similarTo": string
          }
          
          isDuplicate should be true if the new flavor is very similar to an existing one.
          duplicateConfidence should be a number between 0 and 1 representing how similar the most similar flavor is.
          similarTo should be the name of the most similar existing flavor, or null if none are similar.
          
          Consider that different shops might have slightly different names for the same flavor.
          For example, "Chocolate Chip Cookie Dough" and "Cookie Dough Chunk" might be considered duplicates.
          However, "Strawberry" and "Strawberry Cheesecake" would not be duplicates.`,
        },
        {
          role: "user",
          content: `New Flavor: ${flavorName}\nDescription: ${description || "No description"}\n\nExisting Flavors:\n${existingFlavorsText}`,
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    })

    const result = JSON.parse(
      response.choices[0]?.message?.content || '{"isDuplicate": false, "duplicateConfidence": 0, "similarTo": null}',
    )

    return {
      isDuplicate: result.isDuplicate || false,
      duplicateConfidence: result.duplicateConfidence || 0,
      similarTo: result.similarTo,
    }
  } catch (error) {
    console.error("Error checking for duplicates:", error)
    // Return safe default in case of error
    return { isDuplicate: false, duplicateConfidence: 0, similarTo: null }
  }
}

/**
 * Analyze an image to detect inappropriate content
 */
export async function analyzeImage(imageUrl: string): Promise<{
  flagged: boolean
  imageSeverity: "none" | "low" | "medium" | "high"
  imageIssues: string[]
  isIceCream: boolean
  confidence: number
}> {
  try {
    if (!imageUrl) {
      return {
        flagged: false,
        imageSeverity: "none",
        imageIssues: [],
        isIceCream: true,
        confidence: 1.0,
      }
    }

    const client = getOpenAIClient()

    const response = await client.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: `You are an image analysis system for an ice cream tracking app.
          Analyze the provided image and determine:
          1. If it contains inappropriate content
          2. If it actually shows ice cream
          
          Return a JSON object with the following structure:
          {
            "flagged": boolean,
            "imageSeverity": "none" | "low" | "medium" | "high",
            "imageIssues": string[],
            "isIceCream": boolean,
            "confidence": number
          }
          
          flagged should be true if the image contains inappropriate content.
          imageSeverity should indicate how problematic the content is.
          imageIssues should list specific issues found.
          isIceCream should be true if the image appears to contain ice cream.
          confidence should be a number between 0 and 1 representing confidence in the analysis.`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image of ice cream:" },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 800,
      temperature: 0.1,
      response_format: { type: "json_object" },
    })

    const result = JSON.parse(
      response.choices[0]?.message?.content ||
        '{"flagged": false, "imageSeverity": "none", "imageIssues": [], "isIceCream": true, "confidence": 1.0}',
    )

    return {
      flagged: result.flagged || false,
      imageSeverity: result.imageSeverity || "none",
      imageIssues: result.imageIssues || [],
      isIceCream: result.isIceCream !== false, // Default to true if not specified
      confidence: result.confidence || 1.0,
    }
  } catch (error) {
    console.error("Error analyzing image:", error)
    // Return safe default in case of error
    return {
      flagged: false,
      imageSeverity: "none",
      imageIssues: [],
      isIceCream: true,
      confidence: 0.5,
    }
  }
}

/**
 * Comprehensive flavor analysis including categorization, duplicate checking, and moderation
 */
export async function analyzeFlavor(
  flavorName: string,
  description: string,
  imageUrl: string | null = null,
  existingFlavors: Array<{ name: string; description: string }> = [],
): Promise<{
  contentSeverity: "none" | "low" | "medium" | "high"
  contentIssues: string[]
  imageSeverity: "none" | "low" | "medium" | "high"
  imageIssues: string[]
  isDuplicate: boolean
  duplicateConfidence: number
  similarTo: string | null
  tags: string[]
  rarity: string
  isIceCream: boolean
}> {
  try {
    // Run all analyses in parallel for efficiency
    const [contentModeration, duplicateCheck, imageAnalysis, categoryData] = await Promise.all([
      moderateContent(`${flavorName} ${description}`),
      checkForDuplicates(flavorName, description, existingFlavors),
      imageUrl
        ? analyzeImage(imageUrl)
        : Promise.resolve({
            flagged: false,
            imageSeverity: "none",
            imageIssues: [],
            isIceCream: true,
            confidence: 1.0,
          }),
      categorizeFlavor(flavorName, description),
    ])

    return {
      contentSeverity: contentModeration.severity,
      contentIssues: contentModeration.flags,
      imageSeverity: imageAnalysis.imageSeverity,
      imageIssues: imageAnalysis.imageIssues,
      isDuplicate: duplicateCheck.isDuplicate,
      duplicateConfidence: duplicateCheck.duplicateConfidence,
      similarTo: duplicateCheck.similarTo,
      tags: categoryData.tags || [],
      rarity: categoryData.rarity || "Common",
      isIceCream: imageAnalysis.isIceCream,
    }
  } catch (error) {
    console.error("Error analyzing flavor:", error)
    // Return safe default in case of error
    return {
      contentSeverity: "none",
      contentIssues: [],
      imageSeverity: "none",
      imageIssues: [],
      isDuplicate: false,
      duplicateConfidence: 0,
      similarTo: null,
      tags: [],
      rarity: "Common",
      isIceCream: true,
    }
  }
}

/**
 * Categorize a flavor based on its name and description
 */
export async function categorizeFlavor(
  flavorName: string,
  description: string,
): Promise<{
  mainCategory: string
  subCategories: string[]
  tags: string[]
  allergens: string[]
  dietaryInfo: string[]
  rarity: string
}> {
  try {
    if (!flavorName) {
      return {
        mainCategory: "Uncategorized",
        subCategories: [],
        tags: [],
        allergens: [],
        dietaryInfo: [],
        rarity: "Common",
      }
    }

    const client = getOpenAIClient()

    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an ice cream flavor categorization system. Categorize the following ice cream flavor based on its name and description.
          Return a JSON object with the following structure:
          {
            "mainCategory": string,
            "subCategories": string[],
            "tags": string[],
            "allergens": string[],
            "dietaryInfo": string[],
            "rarity": string
          }
          
          mainCategory should be the primary flavor category (e.g., "Chocolate", "Fruit", "Vanilla", "Nut", etc.)
          subCategories should be more specific categories (e.g., "Dark Chocolate", "Berry", "Tropical Fruit", etc.)
          tags should be relevant descriptive tags (e.g., "creamy", "sweet", "tangy", "rich", etc.)
          allergens should list potential allergens (e.g., "nuts", "dairy", "eggs", etc.)
          dietaryInfo should include dietary considerations (e.g., "vegetarian", "contains gluten", etc.)
          rarity should be one of: "Common", "Uncommon", "Rare", "Ultra Rare", "Legendary"`,
        },
        {
          role: "user",
          content: `Flavor Name: ${flavorName}\nDescription: ${description || "No description provided"}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    })

    const result = JSON.parse(
      response.choices[0]?.message?.content ||
        '{"mainCategory": "Uncategorized", "subCategories": [], "tags": [], "allergens": [], "dietaryInfo": [], "rarity": "Common"}',
    )

    return {
      mainCategory: result.mainCategory || "Uncategorized",
      subCategories: result.subCategories || [],
      tags: result.tags || [],
      allergens: result.allergens || [],
      dietaryInfo: result.dietaryInfo || [],
      rarity: result.rarity || "Common",
    }
  } catch (error) {
    console.error("Error categorizing flavor:", error)
    // Return safe default in case of error
    return {
      mainCategory: "Uncategorized",
      subCategories: [],
      tags: [],
      allergens: [],
      dietaryInfo: [],
      rarity: "Common",
    }
  }
}

async function analyzeFlavorRarity(flavorName: string, description: string): Promise<string> {
  return "Common"
}

async function generateFlavorDescription(flavorName: string): Promise<string> {
  return `A delicious flavor of ${flavorName}`
}

// Export other existing functions
export { analyzeFlavorRarity, generateFlavorDescription }
