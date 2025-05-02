export type ApiError = {
  status: number
  message: string
  details?: any
}

/**
 * Handles API errors consistently across the application
 * @param error The error object caught in a try/catch block
 * @param defaultMessage Default message to show if error doesn't have one
 * @returns Formatted ApiError object
 */
export function handleApiError(error: any, defaultMessage = "An unexpected error occurred"): ApiError {
  console.error("API Error:", error)

  // If it's already an ApiError, return it
  if (error && typeof error === "object" && "status" in error && "message" in error) {
    return error as ApiError
  }

  // Handle Stripe errors
  if (error && error.type && error.type.startsWith("Stripe")) {
    return {
      status: error.statusCode || 500,
      message: error.message || defaultMessage,
      details: {
        type: error.type,
        code: error.code,
        param: error.param,
      },
    }
  }

  // Handle standard HTTP errors
  if (error instanceof Response) {
    return {
      status: error.status,
      message: error.statusText || defaultMessage,
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      status: 500,
      message: error.message || defaultMessage,
      details: error.stack,
    }
  }

  // Default case
  return {
    status: 500,
    message: defaultMessage,
    details: error,
  }
}

/**
 * Logs an error to the audit log and console
 * @param error The error to log
 * @param context Additional context about where the error occurred
 * @param userId Optional user ID of who triggered the error
 */
export async function logErrorToAudit(error: any, context: string, userId?: string) {
  const formattedError = handleApiError(error)

  try {
    // Log to database audit log
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = createClient()

    await supabase.from("admin_audit_logs").insert({
      action: "ERROR",
      resource_type: context,
      details: {
        error: formattedError,
        timestamp: new Date().toISOString(),
      },
      user_id: userId || "system",
    })
  } catch (logError) {
    // If we can't log to the database, at least log to console
    console.error("Failed to log error to audit log:", logError)
    console.error("Original error:", formattedError)
  }
}

/**
 * Returns a user-friendly error message based on the API error
 * @param error The API error
 * @returns A user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: ApiError): string {
  // Map common error codes to user-friendly messages
  switch (error.status) {
    case 400:
      return "The request was invalid. Please check your input and try again."
    case 401:
      return "You need to be logged in to perform this action."
    case 403:
      return "You don't have permission to perform this action."
    case 404:
      return "The requested resource was not found."
    case 409:
      return "This operation couldn't be completed due to a conflict with existing data."
    case 429:
      return "Too many requests. Please try again later."
    case 500:
    case 502:
    case 503:
    case 504:
      return "We're experiencing technical difficulties. Please try again later."
    default:
      // For Stripe-specific errors
      if (error.details?.type?.startsWith("Stripe")) {
        switch (error.details.code) {
          case "card_declined":
            return "Your card was declined. Please try another payment method."
          case "expired_card":
            return "Your card has expired. Please try another card."
          case "incorrect_cvc":
            return "The security code (CVC) is incorrect. Please check and try again."
          case "processing_error":
            return "An error occurred while processing your card. Please try again."
          default:
            return error.message || "There was an issue with the payment processor."
        }
      }

      return error.message || "An unexpected error occurred. Please try again."
  }
}
