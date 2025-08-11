"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  payment?: any
}

export function PaymentModal({ isOpen, onClose, payment }: PaymentModalProps) {
  const { addPayment, updatePayment, updateInvoice, clients, invoices } = useAppStore()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    clientId: "",
    invoiceId: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    method: "upi",
  })

  const [availableInvoices, setAvailableInvoices] = useState<any[]>([])

  useEffect(() => {
    if (payment) {
      setFormData({
        clientId: payment.clientId,
        invoiceId: payment.invoiceId,
        amount: payment.amount.toString(),
        date: payment.date,
        method: payment.method,
      })
    } else {
      setFormData({
        clientId: "",
        invoiceId: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        method: "upi",
      })
    }
  }, [payment])

  useEffect(() => {
    if (formData.clientId) {
      // Only show invoices that exist in the invoices list and belong to the selected client
      const clientInvoices = invoices.filter(
        (invoice) => invoice.clientId === formData.clientId && invoice.status !== "paid",
      )
      setAvailableInvoices(clientInvoices)
    } else {
      setAvailableInvoices([])
    }
  }, [formData.clientId, invoices])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.clientId || !formData.amount || !formData.date) {
      toast({
        title: "Error",
        description: "Client, amount, and date are required",
        variant: "destructive",
      })
      return
    }

    const paymentData = {
      clientId: formData.clientId,
      invoiceId: formData.invoiceId || null,
      amount: Number.parseFloat(formData.amount),
      date: formData.date,
      method: formData.method,
    }

    if (payment) {
      updatePayment(payment.id, paymentData)
      toast({
        title: "Success",
        description: "Payment updated successfully",
      })
    } else {
      addPayment(paymentData)

      // Update invoice status to paid if invoice is selected and payment covers full amount
      if (formData.invoiceId) {
        const invoice = invoices.find((i) => i.id === formData.invoiceId)
        if (invoice && Number.parseFloat(formData.amount) >= invoice.total) {
          updateInvoice(formData.invoiceId, { status: "paid" })
        }
      }

      toast({
        title: "Success",
        description: "Payment added successfully",
      })
    }

    onClose()
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const selectedInvoice = availableInvoices.find((i) => i.id === formData.invoiceId)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text">{payment ? "Edit Payment" : "Add New Payment"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {availableInvoices.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="invoice" className="text-sm font-medium">
                Invoice (Optional)
              </Label>
              <Select value={formData.invoiceId} onValueChange={(value) => handleChange("invoiceId", value)}>
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue placeholder="Select invoice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-invoice">No specific invoice</SelectItem>
                  {availableInvoices.map((invoice) => (
                    <SelectItem key={invoice.id} value={invoice.id}>
                      {invoice.invoiceNumber} - ₹{invoice.total}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : formData.clientId ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                No unpaid invoices available for this client
              </Label>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount (₹) *
              </Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                className="glass-card border-white/20"
                placeholder={selectedInvoice ? selectedInvoice.total.toString() : "0"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="glass-card border-white/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method" className="text-sm font-medium">
              Payment Method
            </Label>
            <Select value={formData.method} onValueChange={(value) => handleChange("method", value)}>
              <SelectTrigger className="glass-card border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              {payment ? "Update" : "Add"} Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
