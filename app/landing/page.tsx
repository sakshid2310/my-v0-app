"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LoginModal } from "@/components/login-modal"
import { SignUpModal } from "@/components/signup-modal"
import { BarChart3, Users, FileText, CreditCard, TrendingUp, CheckCircle } from "lucide-react"

export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">HustlePro</span>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setIsLoginModalOpen(true)} className="px-6 py-2">
                Login
              </Button>
              <Button onClick={() => setIsSignUpModalOpen(true)} className="px-6 py-2 bg-blue-600 hover:bg-blue-700">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Manage Your Freelance Business
            <span className="text-blue-600"> Like a Pro</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline client management, track projects, create professional invoices, and get paid faster. Everything
            you need to run your freelance business in one powerful platform.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              size="lg"
              onClick={() => setIsSignUpModalOpen(true)}
              className="px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700"
            >
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => setIsLoginModalOpen(true)} className="px-8 py-4 text-lg">
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-lg text-gray-600">
              Powerful features designed specifically for freelancers and small businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Client Management</h3>
              <p className="text-gray-600">
                Keep all your client information organized and easily accessible in one place.
              </p>
            </div>

            <div className="text-center p-6">
              <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Task Tracking</h3>
              <p className="text-gray-600">
                Track project progress, set deadlines, and never miss important deliverables.
              </p>
            </div>

            <div className="text-center p-6">
              <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Invoicing</h3>
              <p className="text-gray-600">Create beautiful, professional invoices with automated tax calculations.</p>
            </div>

            <div className="text-center p-6">
              <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Tracking</h3>
              <p className="text-gray-600">Monitor payment status and send automated reminders to get paid faster.</p>
            </div>

            <div className="text-center p-6">
              <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Business Analytics</h3>
              <p className="text-gray-600">
                Get insights into your business performance with detailed analytics and reports.
              </p>
            </div>

            <div className="text-center p-6">
              <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Overview</h3>
              <p className="text-gray-600">
                See all your important business metrics at a glance with our intuitive dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Take Your Business to the Next Level?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of freelancers who trust HustlePro to manage their business.
          </p>
          <Button
            size="lg"
            onClick={() => setIsSignUpModalOpen(true)}
            className="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100"
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-blue-400" />
            <span className="ml-2 text-2xl font-bold">HustlePro</span>
          </div>
          <p className="text-gray-400">© 2024 HustlePro. All rights reserved. Empowering freelancers worldwide.</p>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <SignUpModal isOpen={isSignUpModalOpen} onClose={() => setIsSignUpModalOpen(false)} />
    </div>
  )
}
