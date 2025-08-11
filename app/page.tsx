"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dashboard } from "@/components/dashboard"
import { Clients } from "@/components/clients"
import { Tasks } from "@/components/tasks"
import { Invoices } from "@/components/invoices"
import { Payments } from "@/components/payments"
import { Analytics } from "@/components/analytics"
import { Sidebar } from "@/components/sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { ClientModal } from "@/components/client-modal"
import { TaskModal } from "@/components/task-modal"
import { InvoiceModal } from "@/components/invoice-modal"
import { PaymentModal } from "@/components/payment-modal"
import { SettingsModal } from "@/components/settings-modal"
import { AuthGuard } from "@/components/auth-guard"
import { useMobile } from "@/hooks/use-mobile"
import { supabase } from "@/lib/supabase/client"

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [user, setUser] = useState(null)
  const isMobile = useMobile()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleNavigateToPayments = () => {
    setActiveTab("payments")
  }

  const handleNavigateToTasks = () => {
    setActiveTab("tasks")
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onNavigateToPayments={handleNavigateToPayments} onNavigateToTasks={handleNavigateToTasks} />
      case "clients":
        return <Clients />
      case "tasks":
        return <Tasks />
      case "invoices":
        return <Invoices />
      case "payments":
        return <Payments />
      case "analytics":
        return <Analytics />
      default:
        return <Dashboard onNavigateToPayments={handleNavigateToPayments} onNavigateToTasks={handleNavigateToTasks} />
    }
  }

  return (
    // Wrapped entire app in AuthGuard for security
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenClientModal={() => setIsClientModalOpen(true)}
          onOpenTaskModal={() => setIsTaskModalOpen(true)}
          onOpenInvoiceModal={() => setIsInvoiceModalOpen(true)}
          onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
          isMobile={isMobile}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          user={user}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />

        <div className={`flex-1 flex flex-col ${isMobile ? "" : "ml-64"}`}>
          {isMobile && (
            <MobileHeader
              activeTab={activeTab}
              onMenuClick={() => setIsSidebarOpen(true)}
              onOpenClientModal={() => setIsClientModalOpen(true)}
              onOpenTaskModal={() => setIsTaskModalOpen(true)}
              onOpenInvoiceModal={() => setIsInvoiceModalOpen(true)}
            />
          )}

          <main className="flex-1 overflow-auto p-6">{renderContent()}</main>
        </div>

        <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} />
        <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
        <InvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} />
        <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} />
        <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} user={user} />
      </div>
    </AuthGuard>
  )
}
