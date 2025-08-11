"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  task?: any
}

export function TaskModal({ isOpen, onClose, task }: TaskModalProps) {
  const { addTask, updateTask, clients } = useAppStore()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    clientId: "",
    deadline: "",
    price: "",
    priority: "medium",
    status: "pending",
  })

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        clientId: task.clientId,
        deadline: task.deadline,
        price: task.price.toString(),
        priority: task.priority,
        status: task.status,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        clientId: "",
        deadline: "",
        price: "",
        priority: "medium",
        status: "pending",
      })
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.clientId || !formData.deadline) {
      toast({
        title: "Error",
        description: "Title, client, and deadline are required",
        variant: "destructive",
      })
      return
    }

    const taskData = {
      ...formData,
      price: Number.parseFloat(formData.price) || 0,
    }

    if (task) {
      updateTask(task.id, taskData)
      toast({
        title: "Success",
        description: "Task updated successfully",
      })
    } else {
      addTask(taskData)
      toast({
        title: "Success",
        description: "Task added successfully",
      })
    }

    onClose()
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text">{task ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="glass-card border-white/20"
              placeholder="Task title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="glass-card border-white/20"
              placeholder="Task description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client" className="text-sm font-medium">
              Client *
            </Label>
            <Select value={formData.clientId} onValueChange={(value) => handleChange("clientId", value)}>
              <SelectTrigger className="glass-card border-white/20">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-sm font-medium">
                Deadline *
              </Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleChange("deadline", e.target.value)}
                className="glass-card border-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                Price (₹)
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                className="glass-card border-white/20"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">
                Priority
              </Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              {task ? "Update" : "Add"} Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
