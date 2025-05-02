import { z } from "zod"

// Common validation schemas
export const emailSchema = z.string().min(1, "Email is required").email("Invalid email address")

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")

export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be less than 50 characters")

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be less than 30 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")

// Login form schema
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
})

// Registration form schema
export const registrationFormSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Profile form schema
export const profileFormSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
  website: z.string().url("Invalid URL").or(z.literal("")).optional(),
})

// Flavor log form schema
export const flavorLogFormSchema = z.object({
  name: z
    .string()
    .min(2, "Flavor name must be at least 2 characters")
    .max(100, "Flavor name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
  shopId: z.string().min(1, "Shop is required"),
})

// Helper function to validate form data
export function validateForm<T>(
  schema: z.ZodType<T>,
  data: unknown,
): {
  success: boolean
  data?: T
  errors?: Record<string, string>
} {
  try {
    const validData = schema.parse(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}

      error.errors.forEach((err) => {
        const path = err.path.join(".")
        errors[path] = err.message
      })

      return { success: false, errors }
    }

    return {
      success: false,
      errors: { _form: "An unexpected error occurred" },
    }
  }
}
