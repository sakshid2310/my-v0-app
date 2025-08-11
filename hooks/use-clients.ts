"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function useClients() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const fetchClients = async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError("User not authenticated")
        return
      }

      const { data, error: fetchError } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setClients(data || [])
    } catch (err) {
      console.error("Error fetching clients:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch clients")
    } finally {
      setLoading(false)
    }
  }

  const addClient = async (clientData: any) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("User not authenticated")
      }

      const { data, error } = await supabase
        .from("clients")
        .insert([
          {
            ...clientData,
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) {
        throw error
      }

      setClients((prev) => [data, ...prev])
      return data
    } catch (err) {
      console.error("Error adding client:", err)
      toast({
        title: "Error",
        description: "Failed to create client. Please try again.",
        variant: "destructive",
      })
      throw err
    }
  }

  const updateClient = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase.from("clients").update(updates).eq("id", id).select().single()

      if (error) {
        throw error
      }

      setClients((prev) => prev.map((client) => (client.id === id ? data : client)))
      return data
    } catch (err) {
      console.error("Error updating client:", err)
      toast({
        title: "Error",
        description: "Failed to update client. Please try again.",
        variant: "destructive",
      })
      throw err
    }
  }

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase.from("clients").delete().eq("id", id)

      if (error) {
        throw error
      }

      setClients((prev) => prev.filter((client) => client.id !== id))
      toast({
        title: "Success",
        description: "Client deleted successfully",
      })
    } catch (err) {
      console.error("Error deleting client:", err)
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      })
      throw err
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  return {
    clients,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    refetch: fetchClients,
  }
}
