"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const fetchTasks = async () => {
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
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setTasks(data || [])
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (taskData: any) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("User not authenticated")
      }

      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            ...taskData,
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (error) {
        throw error
      }

      setTasks((prev) => [data, ...prev])
      return data
    } catch (err) {
      console.error("Error adding task:", err)
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
      throw err
    }
  }

  const updateTask = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase.from("tasks").update(updates).eq("id", id).select().single()

      if (error) {
        throw error
      }

      setTasks((prev) => prev.map((task) => (task.id === id ? data : task)))
      return data
    } catch (err) {
      console.error("Error updating task:", err)
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id)

      if (error) {
        throw error
      }

      setTasks((prev) => prev.filter((task) => task.id !== id))
      toast({
        title: "Success",
        description: "Task deleted successfully",
      })
    } catch (err) {
      console.error("Error deleting task:", err)
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
      throw err
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  }
}
