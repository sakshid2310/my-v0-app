"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { signIn } from "@/lib/actions"
import { checkRateLimit, getRemainingLockoutTime, isValidEmail, sanitizeInput } from "@/lib/auth-utils"

function SubmitButton({ isLocked }: { isLocked: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending || isLocked}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium rounded-lg disabled:opacity-50"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : isLocked ? (
        "Account Temporarily Locked"
      ) : (
        "Sign In"
      )}
    </Button>
  )
}

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(signIn, null)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTime, setLockoutTime] = useState(0)
  const [clientIP, setClientIP] = useState("")

  useEffect(() => {
    // Get client IP for rate limiting (simplified)
    setClientIP(window.location.hostname)
  }, [])

  useEffect(() => {
    if (clientIP) {
      const remaining = getRemainingLockoutTime(clientIP)
      setLockoutTime(remaining)
      setIsLocked(remaining > 0)

      if (remaining > 0) {
        const timer = setInterval(() => {
          const newRemaining = getRemainingLockoutTime(clientIP)
          setLockoutTime(newRemaining)
          setIsLocked(newRemaining > 0)

          if (newRemaining <= 0) {
            clearInterval(timer)
          }
        }, 1000)

        return () => clearInterval(timer)
      }
    }
  }, [clientIP, state])

  useEffect(() => {
    if (state?.success) {
      onClose()
      router.push("/")
      router.refresh()
    }
  }, [state, router, onClose])

  const handleSubmit = async (formData: FormData) => {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Client-side validation
    if (!email || !password) {
      return
    }

    if (!isValidEmail(email)) {
      return
    }

    // Check rate limiting
    if (!checkRateLimit(clientIP)) {
      setIsLocked(true)
      return
    }

    // Sanitize inputs
    formData.set("email", sanitizeInput(email))
    formData.set("password", password) // Don't sanitize password as it might contain special chars

    return formAction(formData)
  }

  const formatLockoutTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center">Welcome Back</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              {state.error}
            </div>
          )}

          {isLocked && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              Too many failed attempts. Try again in {formatLockoutTime(lockoutTime)}.
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full"
                disabled={isLocked}
                maxLength={254} // RFC 5321 limit
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="w-full"
                disabled={isLocked}
                maxLength={128} // Reasonable password length limit
              />
            </div>
          </div>

          <SubmitButton isLocked={isLocked} />
        </form>
      </DialogContent>
    </Dialog>
  )
}
