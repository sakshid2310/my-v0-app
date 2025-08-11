"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { EarningsChart } from "@/components/earnings-chart"
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  IndianRupee,
  CreditCard,
  AlertCircle,
  Zap,
  MessageCircle,
  Mail,
  ArrowRight,
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface DashboardProps {
  onNavigateToPayments?: () => void
  onNavigateToTasks?: () => void
  onNavigateToInvoices?: () => void
  onNavigateToClients?: () => void
}

interface DashboardData {
  clients: any[]
  tasks: any[]
  invoices: any[]
  payments: any[]
}

export function Dashboard({
  onNavigateToPayments,
  onNavigateToTasks,
  onNavigateToInvoices,
  onNavigateToClients,
}: DashboardProps) {
  const [data, setData] = useState<DashboardData>({
    clients: [],
    tasks: [],
    invoices: [],
    payments: [],
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Fetch all data in parallel
        const [clientsResult, tasksResult, invoicesResult, paymentsResult] = await Promise.all([
          supabase.from("clients").select("*").eq("user_id", user.id),
          supabase.from("tasks").select("*").eq("user_id", user.id),
          supabase.from("invoices").select("*").eq("user_id", user.id),
          supabase.from("payments").select("*").eq("user_id", user.id),
        ])

        setData({
          clients: clientsResult.data || [],
          tasks: tasksResult.data || [],
          invoices: invoicesResult.data || [],
          payments: paymentsResult.data || [],
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  const { clients, tasks, invoices, payments } = data

  // Calculate comprehensive metrics
  const totalRevenue = payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthEarnings = payments
    .filter((p) => {
      const paymentDate = new Date(p.payment_date)
      return (
        p.status === "completed" && paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
      )
    })
    .reduce((sum, p) => sum + p.amount, 0)

  const pendingPayments = invoices
    .filter((i) => i.status === "pending" || i.status === "partially-paid")
    .reduce(
      (sum, i) =>
        sum +
        (i.total -
          payments
            .filter((p) => p.invoice_id === i.id && p.status === "completed")
            .reduce((pSum, p) => pSum + p.amount, 0)),
      0,
    )

  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const pendingTasks = tasks.filter(
    (t) => t.status === "in-progress" || t.status === "todo" || t.status === "pending",
  ).length
  const activeClients = clients.filter((c) => c.status === "active").length
  const openTasksCount = tasks.filter((t) => t.status !== "completed").length

  // Overdue tasks
  const today = new Date()
  const overdueTasks = tasks.filter((t) => new Date(t.due_date) < today && t.status !== "completed")

  // Unpaid invoices
  const unpaidInvoices = invoices.filter((i) => i.status !== "paid")
  const unpaidInvoicesAmount = unpaidInvoices.reduce((sum, i) => {
    const paidAmount = payments
      .filter((p) => p.invoice_id === i.id && p.status === "completed")
      .reduce((pSum, p) => pSum + p.amount, 0)
    return sum + (i.total - paidAmount)
  }, 0)

  // Previous month comparison for revenue
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
  const lastMonthEarnings = payments
    .filter((p) => {
      const paymentDate = new Date(p.payment_date)
      return (
        p.status === "completed" && paymentDate.getMonth() === lastMonth && paymentDate.getFullYear() === lastMonthYear
      )
    })
    .reduce((sum, p) => sum + p.amount, 0)

  const revenueGrowth = lastMonthEarnings > 0 ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 : 0

  // Upcoming tasks (next 3 days)
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(today.getDate() + 3)
  const upcomingTasks = tasks
    .filter((t) => {
      const taskDate = new Date(t.due_date)
      return taskDate >= today && taskDate <= threeDaysFromNow && t.status !== "completed"
    })
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5)

  // Payment status calculations
  const pendingInvoices = invoices.filter((i) => i.status === "pending")
  const partiallyPaidInvoices = invoices.filter((i) => i.status === "partially-paid")
  const paidPayments = invoices.filter((i) => i.status === "paid")

  const pendingAmount = pendingInvoices.reduce((sum, i) => sum + i.total, 0)
  const partiallyPaidAmount = partiallyPaidInvoices.reduce((sum, i) => {
    const paidAmount = payments
      .filter((p) => p.invoice_id === i.id && p.status === "completed")
      .reduce((pSum, p) => pSum + p.amount, 0)
    return sum + (i.total - paidAmount)
  }, 0)
  const completedAmount = paidPayments.reduce((sum, i) => sum + i.total, 0)

  // Tasks due today
  const todayString = today.toDateString()
  const dueTodayTasks = tasks.filter(
    (t) => new Date(t.due_date).toDateString() === todayString && t.status !== "completed",
  )

  // Overdue invoices
  const overdueInvoices = invoices
    .filter((i) => new Date(i.due_date) < today && i.status !== "paid")
    .map((invoice) => {
      const client = clients.find((c) => c.id === invoice.client_id)
      const paidAmount = payments
        .filter((p) => p.invoice_id === invoice.id && p.status === "completed")
        .reduce((sum, p) => sum + p.amount, 0)
      const remainingAmount = invoice.total - paidAmount
      const daysOverdue = Math.ceil((today.getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24))

      return {
        ...invoice,
        client,
        remainingAmount,
        daysOverdue,
      }
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleTaskClick = (taskId: string) => {
    onNavigateToTasks?.()
  }

  const handlePaymentCardClick = (status: string) => {
    onNavigateToPayments?.()
  }

  const handleSendReminder = async (invoiceId: string, method: "whatsapp" | "email") => {
    toast({
      title: "Reminder Sent",
      description: `Payment reminder sent via ${method}`,
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your business overview.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"
          >
            <Zap className="w-3 h-3 mr-1" />
            All Systems Active
          </Badge>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              This Month Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100 animate-count-up">
              {formatCurrency(thisMonthEarnings)}
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className={`h-4 w-4 mr-1 ${revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`} />
              <span className={`text-sm font-medium ${revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                {revenueGrowth >= 0 ? "+" : ""}
                {revenueGrowth.toFixed(1)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-800/20 cursor-pointer hover:shadow-xl transition-all duration-300"
          onClick={() => onNavigateToInvoices?.()}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100 animate-count-up">
              {formatCurrency(pendingPayments)}
            </div>
            <div className="flex items-center mt-2">
              <IndianRupee className="h-4 w-4 text-orange-600 mr-1" />
              <span className="text-sm text-orange-600 font-medium">{unpaidInvoices.length} invoices pending</span>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-800/20 cursor-pointer hover:shadow-xl transition-all duration-300"
          onClick={() => onNavigateToClients?.()}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Active Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 animate-count-up">{activeClients}</div>
            <div className="flex items-center mt-2">
              <Users className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-sm text-blue-600 font-medium">{clients.length} total clients</span>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-800/20 cursor-pointer hover:shadow-xl transition-all duration-300"
          onClick={() => onNavigateToTasks?.()}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Open Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 animate-count-up">
              {openTasksCount}
            </div>
            <div className="flex items-center mt-2">
              <Clock className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-sm text-purple-600 font-medium">{overdueTasks.length} overdue</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-800/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-amber-700 dark:text-amber-300">
            Upcoming Deadlines (Next 3 Days)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.map((task) => {
                const client = clients.find((c) => c.id === task.client_id)
                const taskDate = new Date(task.due_date)
                const isToday = taskDate.toDateString() === todayString
                const isOverdue = taskDate < today

                let colorClass = "border-yellow-200 bg-yellow-50 text-yellow-800"
                let urgencyText = "Due Soon"

                if (isOverdue) {
                  colorClass = "border-red-200 bg-red-50 text-red-800"
                  urgencyText = "Overdue"
                } else if (isToday) {
                  colorClass = "border-orange-200 bg-orange-50 text-orange-800"
                  urgencyText = "Due Today"
                }

                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border-2 ${colorClass} cursor-pointer hover:shadow-md transition-all duration-200`}
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate mb-1">{task.title}</div>
                        <div className="text-xs opacity-75 truncate">{client?.name}</div>
                      </div>
                      <div className="text-right ml-3">
                        <div className="text-xs font-bold mb-1">{urgencyText}</div>
                        <div className="text-xs">{taskDate.toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-amber-600">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No upcoming deadlines in the next 3 days</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold gradient-text">Payment Overview</h2>
          <Badge
            variant="outline"
            className="text-xs bg-muted/50 text-muted-foreground border-border/50 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => onNavigateToInvoices?.()}
          >
            {invoices.length} total invoices
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card
            className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-800/20 cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => handlePaymentCardClick("pending")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100 animate-count-up">
                {formatCurrency(pendingAmount)}
              </div>
              <div className="flex items-center mt-2">
                <AlertCircle className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-sm text-red-600 font-medium">{pendingInvoices.length} invoices</span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-800/20 cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => handlePaymentCardClick("partial")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Partially Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100 animate-count-up">
                {formatCurrency(partiallyPaidAmount)}
              </div>
              <div className="flex items-center mt-2">
                <CreditCard className="h-4 w-4 text-orange-600 mr-1" />
                <span className="text-sm text-orange-600 font-medium">{partiallyPaidInvoices.length} invoices</span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => handlePaymentCardClick("completed")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Completed Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100 animate-count-up">
                {formatCurrency(completedAmount)}
              </div>
              <div className="flex items-center mt-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">{paidPayments.length} invoices</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tasks Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold gradient-text">Tasks Overview</h2>
          <Badge
            variant="outline"
            className="text-xs bg-muted/50 text-muted-foreground border-border/50 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => onNavigateToTasks?.()}
          >
            {tasks.length} total tasks
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-900/20 dark:to-orange-800/20 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Due Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100 animate-count-up">
                {dueTodayTasks.length}
              </div>
              <div className="flex items-center mt-2">
                <Clock className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-sm text-red-600 font-medium">Tasks due today</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-800/20 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 animate-count-up">
                {overdueTasks.length}
              </div>
              <div className="flex items-center mt-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mr-1" />
                <span className="text-sm text-yellow-600 font-medium">Tasks overdue</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100 animate-count-up">
                {completedTasks}
              </div>
              <div className="flex items-center mt-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600 font-medium">Tasks completed</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Overdue Payments Section */}
      {overdueInvoices.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-800/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-red-700 dark:text-red-300 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Overdue Payments ({overdueInvoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueInvoices.slice(0, 5).map((invoice) => (
              <div
                key={invoice.id}
                className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-red-200/50 dark:border-red-700/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                      {invoice.client?.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{invoice.invoice_number}</div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="font-bold text-sm text-red-700 dark:text-red-300">
                      {formatCurrency(invoice.remainingAmount)}
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400">{invoice.daysOverdue} days overdue</div>
                  </div>
                  <div className="ml-3 flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 bg-green-100 hover:bg-green-200 text-green-700 border-green-300 p-1"
                      onClick={() => handleSendReminder(invoice.id, "whatsapp")}
                    >
                      <MessageCircle className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300 p-1"
                      onClick={() => handleSendReminder(invoice.id, "email")}
                    >
                      <Mail className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {overdueInvoices.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateToInvoices?.()}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 text-xs h-8"
              >
                View all {overdueInvoices.length} overdue invoices
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Revenue Trend Chart */}
      <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold gradient-text">Revenue Trend</span>
            </div>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              Last 6 Months
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EarningsChart />
        </CardContent>
      </Card>
    </div>
  )
}
