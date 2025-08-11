import { supabase } from "@/lib/supabase/client"

// Rate limiting for authentication attempts
const authAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_AUTH_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

export function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const attempts = authAttempts.get(identifier)

  if (!attempts) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now })
    return true
  }

  // Reset if lockout period has passed
  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    authAttempts.set(identifier, { count: 1, lastAttempt: now })
    return true
  }

  // Check if max attempts exceeded
  if (attempts.count >= MAX_AUTH_ATTEMPTS) {
    return false
  }

  // Increment attempt count
  attempts.count++
  attempts.lastAttempt = now
  return true
}

export function getRemainingLockoutTime(identifier: string): number {
  const attempts = authAttempts.get(identifier)
  if (!attempts || attempts.count < MAX_AUTH_ATTEMPTS) {
    return 0
  }

  const now = Date.now()
  const timeRemaining = LOCKOUT_DURATION - (now - attempts.lastAttempt)
  return Math.max(0, timeRemaining)
}

// Validate user permissions for data access
export async function validateUserAccess(resourceUserId: string): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return false
    }

    return user.id === resourceUserId
  } catch (error) {
    console.error("Access validation error:", error)
    return false
  }
}

// Sanitize user input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim()
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number format
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-$$$$]/g, ""))
}

// Generate secure random string for tokens
export function generateSecureToken(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
