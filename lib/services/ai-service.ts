import OpenAI from "openai"

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
      } as unknown as OpenAI
    }

    openaiClient = new OpenAI({
      apiKey: apiKey,
    })
  }

  return openaiClient
}

export async function moderateContent(text: string): Promise<{
  flagged: boolean
  categories: string[]
  flags: string[]
}> {
  try {
    if (!text || text.trim() === "") {
      return { flagged: false, categories: [], flags: [] }
    }

    const client = getOpenAIClient()

    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a content moderation system. Analyze the following text for inappropriate content.
          Return a JSON object with the following structure:
          {
            "flagged": boolean,
            "categories": string[],
            "flags": string[]
          }
          
          Categories should be ice cream flavor categories like "chocolate", "fruit", "vanilla", etc.
          Flags should be reasons for flagging like "profanity", "adult content", "hate speech", etc.
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
      response.choices[0]?.message?.content || '{"flagged": false, "categories": [], "flags": []}',
    )
    return {
      flagged: result.flagged || false,
      categories: result.categories || [],
      flags: result.flags || [],
    }
  } catch (error) {
    console.error("Error moderating content:", error)
    // Return safe default in case of error
    return { flagged: false, categories: [], flags: [] }
  }
}

export async function analyzeFlavorRarity(
  flavorName: string,
  description: string,
): Promise<{
  rarity: string
  score: number
}> {
  try {
    if (!flavorName) {
      return { rarity: "Common", score: 0.1 }
    }

    const client = getOpenAIClient()

    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an ice cream flavor rarity analyzer. Analyze the following ice cream flavor name and description.
          Return a JSON object with the following structure:
          {
            "rarity": string,
            "score": number
          }
          
          Rarity should be one of: "Common", "Uncommon", "Rare", "Ultra Rare", "Legendary"
          Score should be a number between 0 and 1 representing how rare the flavor is.`,
        },
        {
          role: "user",
          content: `Flavor Name: ${flavorName}\nDescription: ${description || "No description provided"}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    })

    const result = JSON.parse(response.choices[0]?.message?.content || '{"rarity": "Common", "score": 0.1}')
    return {
      rarity: result.rarity || "Common",
      score: result.score || 0.1,
    }
  } catch (error) {
    console.error("Error analyzing flavor rarity:", error)
    // Return safe default in case of error
    return { rarity: "Common", score: 0.1 }
  }
}

export async function checkForDuplicates(
  flavorName: string,
  description: string,
  existingFlavors: Array<{ name: string; description: string }> = [],
): Promise<{
  isDuplicate: boolean
  similarityScore: number
  mostSimilarFlavor: string | null
}> {
  try {
    if (!flavorName || existingFlavors.length === 0) {
      return { isDuplicate: false, similarityScore: 0, mostSimilarFlavor: null }
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
            "similarityScore": number,
            "mostSimilarFlavor": string
          }
          
          isDuplicate should be true if the new flavor is very similar to an existing one.
          similarityScore should be a number between 0 and 1 representing how similar the most similar flavor is.
          mostSimilarFlavor should be the name of the most similar existing flavor, or null if none are similar.`,
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
      response.choices[0]?.message?.content ||
        '{"isDuplicate": false, "similarityScore": 0, "mostSimilarFlavor": null}',
    )
    return {
      isDuplicate: result.isDuplicate || false,
      similarityScore: result.similarityScore || 0,
      mostSimilarFlavor: result.mostSimilarFlavor,
    }
  } catch (error) {
    console.error("Error checking for duplicates:", error)
    // Return safe default in case of error
    return { isDuplicate: false, similarityScore: 0, mostSimilarFlavor: null }
  }
}

export async function categorizeFlavorIngredients(
  flavorName: string,
  description: string,
): Promise<{
  categories: string[]
  ingredients: string[]
}> {
  try {
    if (!flavorName) {
      return { categories: [], ingredients: [] }
    }

    const client = getOpenAIClient()

    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an ice cream flavor analyzer. Extract categories and ingredients from the flavor name and description.
          Return a JSON object with the following structure:
          {
            "categories": string[],
            "ingredients": string[]
          }
          
          Categories should be broad flavor categories like "chocolate", "fruit", "vanilla", etc.
          Ingredients should be specific ingredients mentioned or implied in the flavor.`,
        },
        {
          role: "user",
          content: `Flavor Name: ${flavorName}\nDescription: ${description || "No description provided"}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    })

    const result = JSON.parse(response.choices[0]?.message?.content || '{"categories": [], "ingredients": []}')
    return {
      categories: result.categories || [],
      ingredients: result.ingredients || [],
    }
  } catch (error) {
    console.error("Error categorizing flavor ingredients:", error)
    // Return safe default in case of error
    return { categories: [], ingredients: [] }
  }
}

export async function generateFlavorDescription(flavorName: string): Promise<string> {
  try {
    if (!flavorName) {
      return "A delicious ice cream flavor."
    }

    const client = getOpenAIClient()

    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an ice cream flavor description generator. Create a mouthwatering, concise description for the given ice cream flavor name.
          The description should be 1-2 sentences long and highlight the key flavors and experience.`,
        },
        {
          role: "user",
          content: `Flavor Name: ${flavorName}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    })

    return response.choices[0]?.message?.content || "A delicious ice cream flavor."
  } catch (error) {
    console.error("Error generating flavor description:", error)
    // Return safe default in case of error
    return "A delicious ice cream flavor."
  }
}

// Add the missing exports
export async function analyzeFlavor(
  flavorName: string,
  description: string,
): Promise<{
  analysis: string
  rating: number
  complexity: string
  seasonality: string[]
  pairings: string[]
}> {
  try {
    if (!flavorName) {
      return {
        analysis: "No flavor to analyze",
        rating: 0,
        complexity: "Simple",
        seasonality: ["Any season"],
        pairings: ["Any dessert"],
      }
    }

    const client = getOpenAIClient()

    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an ice cream flavor analyst. Analyze the following ice cream flavor name and description.
          Return a JSON object with the following structure:
          {
            "analysis": string,
            "rating": number,
            "complexity": string,
            "seasonality": string[],
            "pairings": string[]
          }
          
          Analysis should be a brief analysis of the flavor profile.
          Rating should be a number between 1 and 10.
          Complexity should be one of: "Simple", "Moderate", "Complex", "Very Complex"
          Seasonality should be an array of seasons when this flavor would be most popular.
          Pairings should be an array of foods or desserts that would pair well with this flavor.`,
        },
        {
          role: "user",
          content: `Flavor Name: ${flavorName}\nDescription: ${description || "No description provided"}`,
        },
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
    })

    const result = JSON.parse(
      response.choices[0]?.message?.content ||
        '{"analysis": "No analysis available", "rating": 5, "complexity": "Simple", "seasonality": ["Any season"], "pairings": ["Any dessert"]}',
    )

    return {
      analysis: result.analysis || "No analysis available",
      rating: result.rating || 5,
      complexity: result.complexity || "Simple",
      seasonality: result.seasonality || ["Any season"],
      pairings: result.pairings || ["Any dessert"],
    }
  } catch (error) {
    console.error("Error analyzing flavor:", error)
    // Return safe default in case of error
    return {
      analysis: "Analysis unavailable at this time",
      rating: 5,
      complexity: "Simple",
      seasonality: ["Any season"],
      pairings: ["Any dessert"],
    }
  }
}

export async function categorizeFlavor(
  flavorName: string,
  description: string,
): Promise<{
  mainCategory: string
  subCategories: string[]
  tags: string[]
  allergens: string[]
  dietaryInfo: string[]
}> {
  try {
    if (!flavorName) {
      return {
        mainCategory: "Uncategorized",
        subCategories: [],
        tags: [],
        allergens: [],
        dietaryInfo: [],
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
            "dietaryInfo": string[]
          }
          
          mainCategory should be the primary flavor category (e.g., "Chocolate", "Fruit", "Vanilla", "Nut", etc.)
          subCategories should be more specific categories (e.g., "Dark Chocolate", "Berry", "Tropical Fruit", etc.)
          tags should be relevant descriptive tags (e.g., "creamy", "sweet", "tangy", "rich", etc.)
          allergens should list potential allergens (e.g., "nuts", "dairy", "eggs", etc.)
          dietaryInfo should include dietary considerations (e.g., "vegetarian", "contains gluten", etc.)`,
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
        '{"mainCategory": "Uncategorized", "subCategories": [], "tags": [], "allergens": [], "dietaryInfo": []}',
    )

    return {
      mainCategory: result.mainCategory || "Uncategorized",
      subCategories: result.subCategories || [],
      tags: result.tags || [],
      allergens: result.allergens || [],
      dietaryInfo: result.dietaryInfo || [],
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
    }
  }
}

// Fallback function for moderateContent when OpenAI is unavailable
export async function moderateContentFallback(text: string): Promise<{
  flagged: boolean
  categories: string[]
  flags: string[]
}> {
  try {
    if (!text || text.trim() === "") {
      return { flagged: false, categories: [], flags: [] }
    }

    const client = getOpenAIClient()

    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a content moderation system. Analyze the following text for inappropriate content.
          Return a JSON object with the following structure:
          {
            "flagged": boolean,
            "categories": string[],
            "flags": string[]
          }
          
          Categories should be ice cream flavor categories like "chocolate", "fruit", "vanilla", etc.
          Flags should be reasons for flagging like "profanity", "adult content", "hate speech", etc.
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
      response.choices[0]?.message?.content || '{"flagged": false, "categories": [], "flags": []}',
    )
    return {
      flagged: result.flagged || false,
      categories: result.categories || [],
      flags: result.flags || [],
    }
  } catch (error) {
    console.error("Error moderating content:", error)
    // Return safe default in case of error
    return { flagged: false, categories: [], flags: [] }
  }
}

// Fallback function for checkForDuplicates when OpenAI is unavailable
export async function checkForDuplicatesFallback(
  flavorName: string,
  description: string,
  existingFlavors: Array<{ name: string; description: string }> = [],
): Promise<{
  isDuplicate: boolean
  similarityScore: number
  mostSimilarFlavor: string | null
}> {
  try {
    if (!flavorName || existingFlavors.length === 0) {
      return { isDuplicate: false, similarityScore: 0, mostSimilarFlavor: null }
    }

    // Simple fallback implementation when OpenAI is unavailable
    // Just check for exact name matches
    const exactMatch = existingFlavors.find((f) => f.name.toLowerCase() === flavorName.toLowerCase())

    if (exactMatch) {
      return {
        isDuplicate: true,
        similarityScore: 1.0,
        mostSimilarFlavor: exactMatch.name,
      }
    }

    // Check for partial matches
    const partialMatches = existingFlavors.filter(
      (f) =>
        f.name.toLowerCase().includes(flavorName.toLowerCase()) ||
        flavorName.toLowerCase().includes(f.name.toLowerCase()),
    )

    if (partialMatches.length > 0) {
      return {
        isDuplicate: true,
        similarityScore: 0.7,
        mostSimilarFlavor: partialMatches[0].name,
      }
    }

    return { isDuplicate: false, similarityScore: 0, mostSimilarFlavor: null }
  } catch (error) {
    console.error("Error checking for duplicates:", error)
    // Return safe default in case of error
    return { isDuplicate: false, similarityScore: 0, mostSimilarFlavor: null }
  }
}

// Fallback function for categorizeFlavor when OpenAI is unavailable
export async function categorizeFlavorFallback(
  flavorName: string,
  description: string,
): Promise<{
  mainCategory: string
  subCategories: string[]
  tags: string[]
  allergens: string[]
  dietaryInfo: string[]
}> {
  try {
    if (!flavorName) {
      return {
        mainCategory: "Uncategorized",
        subCategories: [],
        tags: [],
        allergens: [],
        dietaryInfo: [],
      }
    }

    // Simple fallback categorization based on common keywords
    const lowerName = flavorName.toLowerCase()
    const lowerDesc = description?.toLowerCase() || ""

    // Determine main category
    let mainCategory = "Uncategorized"
    if (lowerName.includes("chocolate") || lowerDesc.includes("chocolate")) {
      mainCategory = "Chocolate"
    } else if (lowerName.includes("vanilla") || lowerDesc.includes("vanilla")) {
      mainCategory = "Vanilla"
    } else if (
      lowerName.includes("strawberry") ||
      lowerName.includes("raspberry") ||
      lowerName.includes("blueberry") ||
      lowerDesc.includes("strawberry") ||
      lowerDesc.includes("raspberry") ||
      lowerDesc.includes("blueberry")
    ) {
      mainCategory = "Fruit"
    } else if (lowerName.includes("mint") || lowerDesc.includes("mint")) {
      mainCategory = "Mint"
    } else if (
      lowerName.includes("cookie") ||
      lowerName.includes("dough") ||
      lowerDesc.includes("cookie") ||
      lowerDesc.includes("dough")
    ) {
      mainCategory = "Cookie"
    }

    // Simple allergen detection
    const allergens = []
    if (lowerName.includes("nut") || lowerDesc.includes("nut")) {
      allergens.push("nuts")
    }
    if (lowerName.includes("dairy") || lowerDesc.includes("dairy") || mainCategory !== "Sorbet") {
      allergens.push("dairy")
    }

    return {
      mainCategory,
      subCategories: [],
      tags: [mainCategory.toLowerCase()],
      allergens,
      dietaryInfo: allergens.length === 0 ? ["allergen-free"] : [],
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
    }
  }
}
