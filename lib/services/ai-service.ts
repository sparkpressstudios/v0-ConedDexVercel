// Categorize a flavor based on its name and description
export const categorizeFlavor = async (
  name: string,
  description: string,
): Promise<{
  mainCategory: string
  tags: string[]
}> => {
  try {
    // In a real implementation, this would call an AI service
    // For now, we'll use a simple rule-based approach

    const nameLower = name.toLowerCase()
    const descLower = description.toLowerCase()
    const combined = `${nameLower} ${descLower}`

    // Define categories and their keywords
    const categories = {
      chocolate: ["chocolate", "cocoa", "fudge", "brownie", "mocha"],
      vanilla: ["vanilla", "bean", "cream", "white"],
      fruit: [
        "strawberry",
        "raspberry",
        "blueberry",
        "cherry",
        "fruit",
        "berry",
        "citrus",
        "lemon",
        "orange",
        "lime",
        "mango",
        "peach",
        "apple",
        "banana",
        "pineapple",
      ],
      nuts: ["nut", "almond", "pecan", "walnut", "pistachio", "hazelnut", "peanut", "cashew"],
      caramel: ["caramel", "butterscotch", "toffee", "dulce", "salted caramel"],
      mint: ["mint", "peppermint", "spearmint"],
      coffee: ["coffee", "espresso", "cappuccino", "latte"],
      cookie: ["cookie", "oreo", "biscuit", "graham", "wafer"],
      candy: ["candy", "marshmallow", "gummy", "sprinkle", "m&m", "snickers", "reese"],
      seasonal: ["pumpkin", "spice", "eggnog", "gingerbread", "cinnamon", "maple"],
    }

    // Find the main category
    let mainCategory = "other"
    let maxMatches = 0

    for (const [category, keywords] of Object.entries(categories)) {
      const matches = keywords.filter((keyword) => combined.includes(keyword)).length
      if (matches > maxMatches) {
        maxMatches = matches
        mainCategory = category
      }
    }

    // Generate tags
    const tags: string[] = []

    // Base type
    if (combined.includes("gelato")) tags.push("gelato")
    else if (combined.includes("sorbet")) tags.push("sorbet")
    else if (combined.includes("frozen yogurt") || combined.includes("froyo")) tags.push("frozen yogurt")
    else tags.push("ice cream")

    // Texture
    if (combined.includes("chunk") || combined.includes("pieces")) tags.push("chunky")
    if (combined.includes("swirl") || combined.includes("ripple")) tags.push("swirled")
    if (combined.includes("smooth") || combined.includes("creamy")) tags.push("creamy")

    // Dietary
    if (combined.includes("vegan")) tags.push("vegan")
    if (combined.includes("dairy-free") || combined.includes("dairy free")) tags.push("dairy-free")
    if (combined.includes("gluten-free") || combined.includes("gluten free")) tags.push("gluten-free")
    if (combined.includes("sugar-free") || combined.includes("sugar free")) tags.push("sugar-free")

    return {
      mainCategory,
      tags,
    }
  } catch (error) {
    console.error("Error categorizing flavor:", error)
    return {
      mainCategory: "other",
      tags: ["ice cream"],
    }
  }
}

// Check if a flavor might be a duplicate of existing flavors
export const checkForDuplicates = async (
  name: string,
  description: string,
): Promise<{
  isDuplicate: boolean
  similarityScore?: number
  similarTo?: string
}> => {
  // In a real implementation, this would query a database and use fuzzy matching
  // For now, we'll return a simple result
  return {
    isDuplicate: false,
  }
}

// Moderate content to ensure it's appropriate
export const moderateContent = async (
  name: string,
  description: string,
): Promise<{
  flagged: boolean
  reason?: string
}> => {
  // In a real implementation, this would call a content moderation API
  // For now, we'll use a simple check for obvious inappropriate words

  const inappropriate = ["explicit", "offensive", "inappropriate", "nsfw"]
  const combined = `${name.toLowerCase()} ${description.toLowerCase()}`

  for (const word of inappropriate) {
    if (combined.includes(word)) {
      return {
        flagged: true,
        reason: "Contains potentially inappropriate content",
      }
    }
  }

  return {
    flagged: false,
  }
}

// Generate flavor recommendations based on user preferences
export const getFlavorRecommendations = async (userId: string, limit = 5): Promise<any[]> => {
  // In a real implementation, this would use a recommendation algorithm
  // For now, we'll return dummy data

  return [
    {
      id: "rec1",
      name: "Chocolate Fudge Brownie",
      description: "Rich chocolate ice cream with fudge brownie pieces",
      rating: 4.8,
      image: "/chocolate-ice-cream-scoop.png",
    },
    {
      id: "rec2",
      name: "Strawberry Cheesecake",
      description: "Creamy cheesecake ice cream with strawberry swirls",
      rating: 4.6,
      image: "/strawberry-ice-cream-scoop.png",
    },
    {
      id: "rec3",
      name: "Mint Chocolate Chip",
      description: "Refreshing mint ice cream with chocolate chips",
      rating: 4.7,
      image: "/mint-chocolate-chip-scoop.png",
    },
    {
      id: "rec4",
      name: "Cookies and Cream",
      description: "Vanilla ice cream with chocolate cookie pieces",
      rating: 4.5,
      image: "/cookies-and-cream-scoop.png",
    },
    {
      id: "rec5",
      name: "Mango Sorbet",
      description: "Refreshing dairy-free mango sorbet",
      rating: 4.4,
      image: "/mango-sorbet-scoop.png",
    },
  ].slice(0, limit)
}

// Analyze flavor trends based on user logs
export const analyzeFlavorTrends = async (): Promise<any> => {
  // In a real implementation, this would analyze database data
  // For now, we'll return dummy data

  return {
    topFlavors: [
      { name: "Chocolate", count: 120 },
      { name: "Vanilla", count: 100 },
      { name: "Strawberry", count: 80 },
      { name: "Mint Chocolate Chip", count: 75 },
      { name: "Cookies and Cream", count: 70 },
    ],
    risingFlavors: [
      { name: "Matcha", growth: 25 },
      { name: "Ube", growth: 20 },
      { name: "Boba", growth: 18 },
      { name: "Lavender", growth: 15 },
      { name: "Black Sesame", growth: 12 },
    ],
    seasonalTrends: {
      spring: ["Strawberry", "Lemon", "Pistachio"],
      summer: ["Mango", "Coconut", "Watermelon"],
      fall: ["Pumpkin Spice", "Apple Cider", "Maple"],
      winter: ["Peppermint", "Eggnog", "Gingerbread"],
    },
  }
}

// Analyze a flavor's profile and provide detailed insights
export const analyzeFlavor = async (
  name: string,
  description: string,
  ingredients?: string[],
): Promise<{
  flavorProfile: {
    sweetness: number
    richness: number
    complexity: number
    uniqueness: number
  }
  pairingRecommendations: string[]
  nutritionalEstimate?: {
    calories: string
    fat: string
    sugar: string
  }
  seasonalRating: {
    spring: number
    summer: number
    fall: number
    winter: number
  }
  marketingTags: string[]
}> => {
  try {
    // In a real implementation, this would call an AI service
    // For now, we'll use a simple rule-based approach
    const nameLower = name.toLowerCase()
    const descLower = description.toLowerCase()
    const combined = `${nameLower} ${descLower}`

    // Default values
    const result = {
      flavorProfile: {
        sweetness: 5,
        richness: 5,
        complexity: 5,
        uniqueness: 5,
      },
      pairingRecommendations: ["Waffle cone", "Chocolate sauce", "Whipped cream"],
      nutritionalEstimate: {
        calories: "250-300 per serving",
        fat: "14-18g",
        sugar: "20-25g",
      },
      seasonalRating: {
        spring: 7,
        summer: 8,
        fall: 7,
        winter: 7,
      },
      marketingTags: ["delicious", "premium", "handcrafted"],
    }

    // Adjust sweetness
    if (combined.includes("chocolate") || combined.includes("caramel") || combined.includes("candy")) {
      result.flavorProfile.sweetness = 8
    } else if (combined.includes("fruit") || combined.includes("berry")) {
      result.flavorProfile.sweetness = 6
    } else if (combined.includes("coffee") || combined.includes("dark chocolate")) {
      result.flavorProfile.sweetness = 4
    }

    // Adjust richness
    if (combined.includes("cream") || combined.includes("butter") || combined.includes("fudge")) {
      result.flavorProfile.richness = 9
    } else if (combined.includes("sorbet") || combined.includes("light")) {
      result.flavorProfile.richness = 3
    }

    // Adjust complexity
    if (combined.includes("swirl") || combined.includes("ripple") || combined.includes("pieces")) {
      result.flavorProfile.complexity = 8
    } else if (combined.includes("simple") || combined.includes("classic")) {
      result.flavorProfile.complexity = 4
    }

    // Adjust uniqueness
    if (combined.includes("unique") || combined.includes("special") || combined.includes("signature")) {
      result.flavorProfile.uniqueness = 9
    } else if (combined.includes("traditional") || combined.includes("classic")) {
      result.flavorProfile.uniqueness = 3
    }

    // Adjust pairing recommendations
    if (combined.includes("chocolate")) {
      result.pairingRecommendations = ["Waffle cone", "Caramel sauce", "Nuts"]
    } else if (combined.includes("fruit") || combined.includes("berry")) {
      result.pairingRecommendations = ["Sugar cone", "Whipped cream", "Fresh fruit"]
    } else if (combined.includes("coffee")) {
      result.pairingRecommendations = ["Chocolate cone", "Chocolate chips", "Espresso shot"]
    }

    // Adjust seasonal ratings
    if (combined.includes("pumpkin") || combined.includes("spice") || combined.includes("cinnamon")) {
      result.seasonalRating.fall = 10
      result.seasonalRating.winter = 8
      result.seasonalRating.spring = 4
      result.seasonalRating.summer = 3
    } else if (combined.includes("mint") || combined.includes("peppermint")) {
      result.seasonalRating.winter = 10
      result.seasonalRating.summer = 7
    } else if (combined.includes("fruit") || combined.includes("berry") || combined.includes("sorbet")) {
      result.seasonalRating.summer = 10
      result.seasonalRating.spring = 8
      result.seasonalRating.fall = 5
      result.seasonalRating.winter = 4
    }

    // Generate marketing tags
    const marketingTags = ["premium", "handcrafted"]

    if (combined.includes("organic") || combined.includes("natural")) {
      marketingTags.push("organic", "all-natural")
    }

    if (combined.includes("local") || combined.includes("farm")) {
      marketingTags.push("locally-sourced", "farm-to-cone")
    }

    if (combined.includes("classic") || combined.includes("traditional")) {
      marketingTags.push("classic", "timeless")
    }

    if (combined.includes("unique") || combined.includes("special")) {
      marketingTags.push("unique", "signature")
    }

    if (combined.includes("seasonal")) {
      marketingTags.push("seasonal", "limited-edition")
    }

    result.marketingTags = [...new Set(marketingTags)]

    return result
  } catch (error) {
    console.error("Error analyzing flavor:", error)
    return {
      flavorProfile: {
        sweetness: 5,
        richness: 5,
        complexity: 5,
        uniqueness: 5,
      },
      pairingRecommendations: ["Waffle cone", "Chocolate sauce", "Whipped cream"],
      seasonalRating: {
        spring: 7,
        summer: 8,
        fall: 7,
        winter: 7,
      },
      marketingTags: ["delicious", "premium", "handcrafted"],
    }
  }
}
