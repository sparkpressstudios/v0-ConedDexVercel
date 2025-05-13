import OpenAI from "openai"
import { createClient } from "@/lib/supabase/server"

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function moderateContent(text: string): Promise<{
  flagged: boolean
  categories: string[]
  scores: Record<string, number>
}> {
  try {
    const response = await openai.moderations.create({
      input: text,
    })

    const result = response.results[0]

    // Extract flagged categories
    const flaggedCategories = Object.entries(result.categories)
      .filter(([_, value]) => value)
      .map(([key, _]) => key)

    return {
      flagged: result.flagged,
      categories: flaggedCategories,
      scores: result.category_scores,
    }
  } catch (error) {
    console.error("Error moderating content:", error)
    return {
      flagged: false,
      categories: [],
      scores: {},
    }
  }
}

export async function analyzeFlavorText(
  name: string,
  description: string,
  ingredients?: string[],
): Promise<{
  categories: string[]
  rarity: string
  flags: string[]
  similarFlavors?: string[]
  duplicateScore?: number
}> {
  try {
    const ingredientsText = ingredients && ingredients.length > 0 ? `Ingredients: ${ingredients.join(", ")}` : ""

    const prompt = `
      Analyze this ice cream flavor:
      Name: ${name}
      Description: ${description}
      ${ingredientsText}
      
      Provide the following in JSON format:
      1. categories: Array of flavor categories (e.g., chocolate, fruit, nut, etc.)
      2. rarity: One of ["Common", "Uncommon", "Rare", "Ultra Rare", "Legendary"] based on uniqueness
      3. flags: Array of content issues (empty if none)
      4. similarFlavors: Array of common similar flavors (if any)
      5. duplicateScore: Number from 0-1 indicating likelihood of being a duplicate (0 = unique, 1 = exact duplicate)
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant that analyzes ice cream flavors." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content || "{}"
    const analysis = JSON.parse(content)

    return {
      categories: analysis.categories || [],
      rarity: analysis.rarity || "Common",
      flags: analysis.flags || [],
      similarFlavors: analysis.similarFlavors || [],
      duplicateScore: analysis.duplicateScore || 0,
    }
  } catch (error) {
    console.error("Error analyzing flavor text:", error)
    return {
      categories: [],
      rarity: "Common",
      flags: [],
    }
  }
}

// Adding the missing export that was flagged in the deployment error
export async function categorizeFlavor(name: string, description: string, ingredients?: string[]): Promise<string[]> {
  try {
    const ingredientsText = ingredients && ingredients.length > 0 ? `Ingredients: ${ingredients.join(", ")}` : ""

    const prompt = `
      Categorize this ice cream flavor:
      Name: ${name}
      Description: ${description}
      ${ingredientsText}
      
      Return ONLY an array of category tags in JSON format.
      Example categories: chocolate, fruit, nuts, vanilla, coffee, caramel, seasonal, alcohol, vegan, etc.
      Return between 1-5 tags that best describe this flavor.
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant that categorizes ice cream flavors." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content || '{"categories":[]}'
    const result = JSON.parse(content)

    return Array.isArray(result.categories) ? result.categories : []
  } catch (error) {
    console.error("Error categorizing flavor:", error)
    return ["uncategorized"]
  }
}

export async function checkForDuplicates(
  name: string,
  description: string,
): Promise<{
  isDuplicate: boolean
  similarFlavors: string[]
  duplicateScore: number
}> {
  try {
    // Get existing flavors from the database
    const supabase = await createClient()
    const { data: existingFlavors } = await supabase.from("flavors").select("name, description").limit(100)

    if (!existingFlavors || existingFlavors.length === 0) {
      return {
        isDuplicate: false,
        similarFlavors: [],
        duplicateScore: 0,
      }
    }

    const existingFlavorsText = existingFlavors.map((f, i) => `${i + 1}. ${f.name}: ${f.description}`).join("\n")

    const prompt = `
      I have a new ice cream flavor:
      Name: ${name}
      Description: ${description}
      
      Here are some existing flavors:
      ${existingFlavorsText}
      
      Is the new flavor a duplicate or very similar to any existing flavor? 
      Provide the following in JSON format:
      1. isDuplicate: Boolean indicating if it's a duplicate
      2. similarFlavors: Array of names of similar flavors
      3. duplicateScore: Number from 0-1 indicating similarity (0 = completely different, 1 = exact duplicate)
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant that detects duplicate ice cream flavors." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content || "{}"
    const analysis = JSON.parse(content)

    return {
      isDuplicate: analysis.isDuplicate || false,
      similarFlavors: analysis.similarFlavors || [],
      duplicateScore: analysis.duplicateScore || 0,
    }
  } catch (error) {
    console.error("Error checking for duplicates:", error)
    return {
      isDuplicate: false,
      similarFlavors: [],
      duplicateScore: 0,
    }
  }
}

export async function analyzeImage(imageUrl: string): Promise<{
  imageSeverity: "none" | "low" | "medium" | "high"
  imageIssues: string[]
}> {
  try {
    const prompt = `
      Analyze this ice cream image at URL: ${imageUrl}
      
      Provide the following in JSON format:
      1. imageSeverity: Image moderation severity (none, low, medium, high)
      2. imageIssues: Array of image issues if any (empty array if none)
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        { role: "system", content: "You are a helpful assistant that analyzes images for content moderation." },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    })

    const content = response.choices[0]?.message?.content || "{}"
    const analysis = JSON.parse(content)

    return {
      imageSeverity: analysis.imageSeverity || "none",
      imageIssues: analysis.imageIssues || [],
    }
  } catch (error) {
    console.error("Error analyzing image:", error)
    return {
      imageSeverity: "none",
      imageIssues: [],
    }
  }
}

export async function generateFlavorDescription(name: string, ingredients?: string[]): Promise<string> {
  try {
    const ingredientsText = ingredients && ingredients.length > 0 ? `Ingredients: ${ingredients.join(", ")}` : ""

    const prompt = `
      Create a mouthwatering description for this ice cream flavor:
      Name: ${name}
      ${ingredientsText}
      
      The description should be 2-3 sentences long, enticing, and highlight the flavor profile.
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a creative ice cream flavor writer." },
        { role: "user", content: prompt },
      ],
    })

    return (
      response.choices[0]?.message?.content || `A delicious ${name} ice cream that's sure to delight your taste buds.`
    )
  } catch (error) {
    console.error("Error generating flavor description:", error)
    return `A delicious ${name} ice cream that's sure to delight your taste buds.`
  }
}

export async function generateFlavorSuggestions(userPreferences: string[]): Promise<string[]> {
  try {
    const preferencesText = userPreferences.join(", ")

    const prompt = `
      Based on these flavor preferences: ${preferencesText}
      
      Generate 5 unique ice cream flavor suggestions that this person might enjoy.
      Return only the names of the flavors as a JSON array of strings.
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a creative ice cream flavor expert." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content || '{"flavors":[]}'
    const suggestions = JSON.parse(content)

    return Array.isArray(suggestions.flavors) ? suggestions.flavors : []
  } catch (error) {
    console.error("Error generating flavor suggestions:", error)
    return ["Vanilla Bean", "Chocolate Fudge", "Strawberry Swirl", "Mint Chocolate Chip", "Cookies and Cream"]
  }
}

export async function analyzeFlavor(
  name: string,
  description: string,
  imageUrl: string | null,
  existingFlavors: any[],
) {
  try {
    // Analyze text content
    const contentToModerate = `${name} ${description}`
    const moderationResults = await moderateContent(contentToModerate)
    const analysisResults = await analyzeFlavorText(name, description)

    const existingFlavorsFormatted = existingFlavors.map((f) => ({
      name: f.name,
      description: f.description || "",
    }))

    const duplicateResults = await checkForDuplicates(name, description)

    // Analyze image if available
    let imageAnalysis = {
      imageSeverity: "none" as const,
      imageIssues: [] as string[],
    }

    if (imageUrl) {
      imageAnalysis = await analyzeImage(imageUrl)
    }

    // Combine results
    return {
      tags: analysisResults.categories,
      rarity: analysisResults.rarity,
      contentSeverity: moderationResults.flagged ? "high" : "none",
      contentIssues: moderationResults.categories,
      isDuplicate: duplicateResults.isDuplicate,
      similarTo: duplicateResults.similarFlavors[0] || null,
      duplicateConfidence: duplicateResults.duplicateScore,
      imageSeverity: imageAnalysis.imageSeverity,
      imageIssues: imageAnalysis.imageIssues,
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
