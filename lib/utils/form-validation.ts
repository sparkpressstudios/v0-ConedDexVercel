// Define the schema for flavor log form
export const flavorLogFormSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 500,
  },
  rating: {
    required: true,
    min: 1,
    max: 10,
  },
  notes: {
    required: false,
    maxLength: 1000,
  },
  shopId: {
    required: true,
  },
}

// Validate form data against a schema
export const validateForm = (schema: any, data: any): { success: boolean; errors?: Record<string, string> } => {
  const errors: Record<string, string> = {}

  // Check each field against schema rules
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field]

    // Required check
    if (rules.required && (!value || (typeof value === "string" && value.trim() === ""))) {
      errors[field] = `${field} is required`
      continue
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) continue

    // String validations
    if (typeof value === "string") {
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = `${field} must be at least ${rules.minLength} characters`
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = `${field} must be no more than ${rules.maxLength} characters`
      }

      if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
        errors[field] = `${field} has an invalid format`
      }
    }

    // Number validations
    if (typeof value === "number") {
      if (rules.min !== undefined && value < rules.min) {
        errors[field] = `${field} must be at least ${rules.min}`
      }

      if (rules.max !== undefined && value > rules.max) {
        errors[field] = `${field} must be no more than ${rules.max}`
      }
    }
  }

  return {
    success: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  }
}

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
export const isStrongPassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" }
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" }
  }

  return { valid: true }
}

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
}
