"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Settings, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { signOut } from "@/lib/actions"

interface UserProfileProps {
  user: any
  onOpenSettings: () => void
}

interface Profile {
  full_name: string | null
  email: string | null
  occupation: string | null
  phone_number: string | null
  avatar_url: string | null
}

export function UserProfile({ user, onOpenSettings }: UserProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, email, occupation, phone_number, avatar_url")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Error fetching profile:", error)
          // If no profile exists, create one with basic info
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
              email: user.email,
              occupation: user.user_metadata?.occupation || "",
              phone_number: user.user_metadata?.phone_number || "",
            })
            .select("full_name, email, occupation, phone_number, avatar_url")
            .single()

          if (insertError) {
            console.error("Error creating profile:", insertError)
          } else {
            setProfile(newProfile)
          }
        } else {
          setProfile(data)
        }
      } catch (error) {
        console.error("Profile fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="p-4 border-t border-white/20 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="p-4 border-t border-white/20 dark:border-gray-700 space-y-3">
      {/* User Info */}
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile?.avatar_url || ""} alt={displayName} />
          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{displayName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{profile?.email}</p>
          {profile?.occupation && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{profile.occupation}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          size="sm"
          variant="outline"
          className="w-full justify-start text-left bg-transparent"
          onClick={onOpenSettings}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-full justify-start text-left text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
