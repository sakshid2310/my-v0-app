"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  client?: any
  onSuccess?: () => void
}

export function ClientModal({ isOpen, onClose, client, onSuccess }: ClientModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
  })

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        company: client.company || "",
      })
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        company: "",
      })
    }
  }, [client])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (client) {
        // Update existing client
        const { error } = await supabase
          .from("clients")
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            company: formData.company,
            updated_at: new Date().toISOString(),
          })
          .eq("id", client.id)
          .eq("user_id", user.id)

        if (error) {
          console.error("Error updating client:", error)
          toast({
            title: "Error",
            description: "Failed to update client",
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        toast({
          title: "Success",
          description: "Client updated successfully",
        })
      } else {
        // Add new client
        const { error } = await supabase.from("clients").insert({
          user_id: user.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          company: formData.company,
        })

        if (error) {
          console.error("Error adding client:", error)
          toast({
            title: "Error",
            description: "Failed to add client",
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        toast({
          title: "Success",
          description: "Client added successfully",
        })
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("Client operation error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text">{client ? "Edit Client" : "Add New Client"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="glass-card border-white/20"
              placeholder="Client name"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="glass-card border-white/20"
              placeholder="client@example.com"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium">
              Company
            </Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleChange("company", e.target.value)}
              className="glass-card border-white/20"
              placeholder="Company name"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="glass-card border-white/20"
              placeholder="+91 9876543210"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Address
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="glass-card border-white/20"
              placeholder="Client address"
              rows={3}
              disabled={loading}
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {client ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>{client ? "Update" : "Add"} Client</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
