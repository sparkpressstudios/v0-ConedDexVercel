export interface NavigationLink {
  label: string
  href: string
  status: "functional" | "broken" | "missing" | "incomplete"
  issue?: string
  solution?: string
}

export const adminNavigationAudit: NavigationLink[] = [
  {
    label: "Dashboard",
    href: "/dashboard/admin",
    status: "functional",
  },
  {
    label: "Users",
    href: "/dashboard/admin/users",
    status: "functional",
  },
  {
    label: "Shops",
    href: "/dashboard/admin/shops",
    status: "functional",
  },
  {
    label: "Badges",
    href: "/dashboard/admin/badges",
    status: "functional",
  },
  {
    label: "Moderation",
    href: "/dashboard/admin/moderation",
    status: "functional",
  },
  {
    label: "Verification",
    href: "/dashboard/admin/verification",
    status: "missing",
    issue: "The verification page does not exist",
    solution: "Create a verification page at /dashboard/admin/verification",
  },
  {
    label: "Subscriptions",
    href: "/dashboard/admin/subscriptions",
    status: "functional",
  },
  {
    label: "Stripe Mapping",
    href: "/dashboard/admin/stripe-mapping",
    status: "functional",
  },
  {
    label: "Analytics",
    href: "/dashboard/admin/analytics",
    status: "functional",
  },
  {
    label: "Audit Logs",
    href: "/dashboard/admin/audit-logs",
    status: "functional",
  },
  {
    label: "Settings",
    href: "/dashboard/admin/settings",
    status: "functional",
  },
  {
    label: "Database",
    href: "/dashboard/admin/database",
    status: "functional",
  },
  {
    label: "Roles",
    href: "/dashboard/admin/roles",
    status: "missing",
    issue: "The roles page exists but is not linked in the sidebar",
    solution: "Add the roles page to the sidebar navigation",
  },
  {
    label: "Testing",
    href: "/dashboard/admin/testing",
    status: "functional",
    issue: "The testing page exists but is not linked in the sidebar",
    solution: "Add the testing page to the sidebar navigation",
  },
  {
    label: "Newsletters",
    href: "/dashboard/admin/newsletters",
    status: "functional",
    issue: "The newsletters page exists but is not linked in the sidebar",
    solution: "Add the newsletters page to the sidebar navigation",
  },
]
