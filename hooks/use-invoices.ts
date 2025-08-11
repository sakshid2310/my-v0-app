"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function useInvoices() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const fetchInvoices = async () => {
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
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setInvoices(data || [])
    } catch (err) {
      console.error("Error fetching invoices:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch invoices")
    } finally {
      setLoading(false)
    }
  }

  const addInvoice = async (invoiceData: any) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("User not authenticated")
      }

      const { data, error } = await supabase
        .from("invoices")
        .insert([
          {
            ...invoiceData,
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) {
        throw error
      }

      setInvoices((prev) => [data, ...prev])
      return data
    } catch (err) {
      console.error("Error adding invoice:", err)
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      })
      throw err
    }
  }

  const updateInvoice = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase.from("invoices").update(updates).eq("id", id).select().single()

      if (error) {
        throw error
      }

      setInvoices((prev) => prev.map((invoice) => (invoice.id === id ? data : invoice)))
      return data
    } catch (err) {
      console.error("Error updating invoice:", err)
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
        variant: "destructive",
      })
      throw err
    }
  }

  const deleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase.from("invoices").delete().eq("id", id)

      if (error) {
        throw error
      }

      setInvoices((prev) => prev.filter((invoice) => invoice.id !== id))
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      })
    } catch (err) {
      console.error("Error deleting invoice:", err)
      toast({
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
        variant: "destructive",
      })
      throw err
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  return {
    invoices,
    loading,
    error,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    refetch: fetchInvoices,
  }
}
