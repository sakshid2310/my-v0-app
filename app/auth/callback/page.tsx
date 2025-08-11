"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()

      // Handle the auth callback from email confirmation
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Auth callback error:", error)
        router.push("/landing?error=auth_failed")
        return
      }

      if (data.session) {
        // User is authenticated, redirect to main app
        router.push("/")
      } else {
        // No session, redirect back to landing
        router.push("/landing")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Completing authentication...</p>
        <p className="mt-2 text-sm text-gray-500">Please wait while we sign you in</p>
      </div>
    </div>
  )
}
