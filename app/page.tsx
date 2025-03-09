"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, ChefHat, Utensils, Calendar, ShoppingCart } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-5xl w-full flex flex-col items-center gap-8 text-center">
        <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full">
          <ChefHat className="h-5 w-5" />
          <span className="text-sm font-medium">ChefAI App</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
          Your AI-Powered <span className="text-blue-600 dark:text-blue-400">Recipe Assistant</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl">
          Generate personalized recipes, plan your meals, and simplify your cooking experience.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                <Utensils className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI Recipe Generation</h3>
              <p className="text-gray-600 dark:text-gray-300">Get personalized recipes based on your preferences and available ingredients.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Meal Planning</h3>
              <p className="text-gray-600 dark:text-gray-300">Organize your weekly meals and plan ahead with an easy-to-use calendar.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Smart Shopping Lists</h3>
              <p className="text-gray-600 dark:text-gray-300">Automatically generate shopping lists with consolidated ingredients across recipes.</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 flex gap-4">
          <Link href="/generate-recipes" passHref>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard" passHref>
            <Button variant="outline">
              View Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}