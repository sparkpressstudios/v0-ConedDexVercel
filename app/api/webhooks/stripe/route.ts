import { type NextRequest, NextResponse } from "next/server"
import { StripeService } from "@/lib/services/stripe-service"

export async function POST(req: NextRequest) {
  try {
    // Get the request body as text
    const payload = await req.text()

    // Get the Stripe signature from the headers
    const signature = req.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 })
    }

    // Handle the webhook event
    const result = await StripeService.handleWebhookEvent(signature, payload)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error handling Stripe webhook:", error)

    return NextResponse.json({ error: "Failed to process webhook" }, { status: 400 })
  }
}

// Disable body parsing for this route
export const config = {
  api: {
    bodyParser: false,
  },
}
