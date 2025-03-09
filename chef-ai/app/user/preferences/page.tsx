"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserPreferencesForm } from "@/components/UserPreferencesForm"
import { useUser } from "@/lib/userStore"
import Sidebar from "@/components/Sidebar"
import { Card, CardContent } from "@/components/ui/card"

export default function UserPreferencesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useUser()
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/user/login")
    }
  }, [isAuthenticated, router])
  
  if (!isAuthenticated) {
    return null
  }
  
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex flex-col space-y-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Your Cooking Preferences</h1>
            <p className="text-gray-600">
              Customize your experience by telling us about your dietary needs and cooking style.
              We'll use this information to provide you with tailored recipe recommendations.
            </p>
          </div>
          
          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <UserPreferencesForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 