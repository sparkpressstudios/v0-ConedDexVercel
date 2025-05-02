import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

// Create a singleton instance for the Pages Router
let pagesClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function createPagesClient() {
  if (!pagesClient) {
    pagesClient = createClientComponentClient<Database>()
  }
  return pagesClient
}
