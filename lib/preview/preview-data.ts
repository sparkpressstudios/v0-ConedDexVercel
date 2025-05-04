// This file provides mock data for preview environments

export const previewUser = {
  id: "preview-user-id",
  email: "preview@example.com",
  name: "Preview User",
  role: "user",
  avatar_url: "/abstract-geometric-shapes.png",
  created_at: new Date().toISOString(),
}

export const previewShop = {
  id: "preview-shop-id",
  name: "Preview Ice Cream Shop",
  description: "This is a preview shop for demonstration purposes.",
  address: "123 Preview St, Demo City",
  latitude: 40.7128,
  longitude: -74.006,
  owner_id: previewUser.id,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  image_url: "/modern-ice-cream-shop.png",
  is_verified: true,
  rating: 4.5,
  website: "https://example.com",
  phone: "555-123-4567",
  hours: {
    monday: "9:00 AM - 9:00 PM",
    tuesday: "9:00 AM - 9:00 PM",
    wednesday: "9:00 AM - 9:00 PM",
    thursday: "9:00 AM - 9:00 PM",
    friday: "9:00 AM - 10:00 PM",
    saturday: "10:00 AM - 10:00 PM",
    sunday: "10:00 AM - 8:00 PM",
  },
}

export const previewFlavors = [
  {
    id: "preview-flavor-1",
    name: "Chocolate",
    description: "Rich and creamy chocolate ice cream.",
    image_url: "/chocolate-ice-cream-scoop.png",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "preview-flavor-2",
    name: "Vanilla",
    description: "Classic vanilla bean ice cream.",
    image_url: "/placeholder.svg?key=nd0nh",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "preview-flavor-3",
    name: "Strawberry",
    description: "Sweet strawberry ice cream with real fruit pieces.",
    image_url: "/strawberry-ice-cream-scoop.png",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "preview-flavor-4",
    name: "Mint Chocolate Chip",
    description: "Refreshing mint ice cream with chocolate chips.",
    image_url: "/mint-chocolate-chip-scoop.png",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const previewBadges = [
  {
    id: "preview-badge-1",
    name: "Ice Cream Explorer",
    description: "Tried 10 different flavors",
    image_url: "/fruit-ice-cream-badge.png",
    created_at: new Date().toISOString(),
  },
  {
    id: "preview-badge-2",
    name: "Shop Hopper",
    description: "Visited 5 different ice cream shops",
    image_url: "/placeholder.svg?key=fsxx3",
    created_at: new Date().toISOString(),
  },
]

export const previewTeams = [
  {
    id: "preview-team-1",
    name: "Ice Cream Enthusiasts",
    description: "A team of ice cream lovers",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    members: [previewUser],
  },
]

export const previewNotifications = [
  {
    id: "preview-notification-1",
    user_id: previewUser.id,
    title: "Welcome to ConeDex!",
    message: "Thanks for joining the ice cream revolution.",
    read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "preview-notification-2",
    user_id: previewUser.id,
    title: "New Badge Earned",
    message: "You earned the Ice Cream Explorer badge!",
    read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
]

// Function to get preview data based on the current path
export function getPreviewData(path: string) {
  if (path.includes("/shop/claim")) {
    return {
      user: previewUser,
      shop: null, // No shop claimed yet
    }
  }

  if (path.includes("/shop")) {
    return {
      user: previewUser,
      shop: previewShop,
    }
  }

  if (path.includes("/flavors")) {
    return {
      user: previewUser,
      flavors: previewFlavors,
    }
  }

  if (path.includes("/badges")) {
    return {
      user: previewUser,
      badges: previewBadges,
    }
  }

  if (path.includes("/teams")) {
    return {
      user: previewUser,
      teams: previewTeams,
    }
  }

  if (path.includes("/notifications")) {
    return {
      user: previewUser,
      notifications: previewNotifications,
    }
  }

  // Default data for dashboard
  return {
    user: previewUser,
    shop: previewShop,
    flavors: previewFlavors.slice(0, 3),
    badges: previewBadges.slice(0, 2),
    notifications: previewNotifications.slice(0, 1),
  }
}
