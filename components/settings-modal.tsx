"use client"

import { useState, useEffect } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium rounded-lg"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating...
        </>
      ) : (
        "Update Profile"
      )}
    </Button>
  )
}

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

interface Profile {
  full_name: string
  email: string
  occupation: string
  phone_number: string
  avatar_url: string | null
}

async function updateProfile(prevState: any, formData: FormData) {
  const fullName = formData.get("fullName")
  const occupation = formData.get("occupation")
  const phoneNumber = formData.get("phoneNumber")

  if (!fullName) {
    return { error: "Full name is required" }
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "User not authenticated" }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.toString(),
        occupation: occupation?.toString() || "",
        phone_number: phoneNumber?.toString() || "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      console.error("Profile update error:", error)
      return { error: "Failed to update profile" }
    }

    return { success: "Profile updated successfully!" }
  } catch (error) {
    console.error("Update profile error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export function SettingsModal({ isOpen, onClose, user }: SettingsModalProps) {
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    email: "",
    occupation: "",
    phone_number: "",
    avatar_url: null,
  })
  const [loading, setLoading] = useState(true)
  const [state, formAction] = useActionState(updateProfile, null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !isOpen) return

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, email, occupation, phone_number, avatar_url")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Error fetching profile:", error)
        } else {
          setProfile({
            full_name: data.full_name || "",
            email: data.email || user.email || "",
            occupation: data.occupation || "",
            phone_number: data.phone_number || "",
            avatar_url: data.avatar_url,
          })
        }
      } catch (error) {
        console.error("Profile fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, isOpen])

  useEffect(() => {
    if (state?.success) {
      // Refresh the profile data after successful update
      const fetchUpdatedProfile = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, email, occupation, phone_number, avatar_url")
          .eq("id", user.id)
          .single()

        if (data) {
          setProfile({
            full_name: data.full_name || "",
            email: data.email || user.email || "",
            occupation: data.occupation || "",
            phone_number: data.phone_number || "",
            avatar_url: data.avatar_url,
          })
        }
      }

      fetchUpdatedProfile()
    }
  }, [state, user])

  const displayName = profile.full_name || user?.email?.split("@")[0] || "User"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center">Profile Settings</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Profile Avatar */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url || ""} alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                  disabled
                  title="Avatar upload coming soon"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <form action={formAction} className="space-y-4">
              {state?.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {state.error}
                </div>
              )}

              {state?.success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {state.success}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    defaultValue={profile.full_name}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed from here</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
                    Occupation
                  </label>
                  <Input
                    id="occupation"
                    name="occupation"
                    type="text"
                    defaultValue={profile.occupation}
                    placeholder="Freelancer, Designer, Developer..."
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    defaultValue={profile.phone_number}
                    placeholder="+1 (555) 123-4567"
                    className="w-full"
                  />
                </div>
              </div>

              <SubmitButton />
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
