// Demo user types
export interface DemoUser {
  email: string
  role: string
  id: string
  name: string
}

// Demo user data
export const demoUsers: Record<string, DemoUser> = {
  "admin@conedex.app": {
    email: "admin@conedex.app",
    role: "admin",
    id: "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
    name: "Alex Admin",
  },
  "shopowner@conedex.app": {
    email: "shopowner@conedex.app",
    role: "shop_owner",
    id: "f5c0d6e7-2e4b-5d7c-8f9a-1b2c3d4e5f6a",
    name: "Sam Scooper",
  },
  "explorer@conedex.app": {
    email: "explorer@conedex.app",
    role: "explorer",
    id: "e4b9c5f8-1d3a-4c6b-9e2f-a8b7c6d5e4f3",
    name: "Emma Explorer",
  },
}

// Client-side function to get demo user from cookie
export function getDemoUserFromCookie(): DemoUser | null {
  if (typeof document === "undefined") return null

  const demoUserEmail = document.cookie
    .split("; ")
    .find((row) => row.startsWith("conedex_demo_user="))
    ?.split("=")[1]

  if (demoUserEmail && demoUsers[demoUserEmail]) {
    return demoUsers[demoUserEmail]
  }

  return null
}

// Create a demo profile from a demo user
export function createDemoProfile(demoUser: DemoUser) {
  return {
    id: demoUser.id,
    username: demoUser.email.split("@")[0],
    full_name: demoUser.name,
    role: demoUser.role,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${demoUser.name.replace(" ", "")}`,
    bio: `This is a demo ${demoUser.role} account.`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    favorite_flavor:
      demoUser.role === "admin"
        ? "Rocky Road"
        : demoUser.role === "shop_owner"
          ? "Vanilla Bean"
          : "Mint Chocolate Chip",
  }
}
