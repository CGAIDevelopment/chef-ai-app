"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Sidebar from "@/components/Sidebar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRecipeStore } from "@/lib/store"
import { Recipe } from "@/lib/types"
import { 
  BarChart3, 
  PieChart, 
  ChefHat, 
  Clock, 
  Users, 
  Star, 
  ArrowUpRight, 
  Plus, 
  CheckSquare, 
  CalendarRange, 
  Sparkles, 
  TrendingUp,
  Utensils,
  BookOpen,
  Search,
  Menu
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function DashboardPage() {
  const router = useRouter()
  const { recipes, isLoading, error, fetchRecipes } = useRecipeStore()
  const [mounted, setMounted] = useState(false)
  
  // Fetch recipes on mount
  useEffect(() => {
    setMounted(true)
    fetchRecipes()
  }, [fetchRecipes])
  
  // Calculate statistics
  const stats = useMemo(() => {
    if (recipes.length === 0) {
      return {
        total: 0,
        private: 0,
        toTry: 0,
        mealPlan: 0,
        avgRating: 0,
        highestRated: null as Recipe | null,
        avgCalories: 0,
        avgCookTime: 30, // Default
        recentlyAdded: [] as Recipe[],
        mealPlanThisWeek: [] as Recipe[],
        toTryList: [] as Recipe[]
      }
    }
    
    // Count by status
    const privateRecipes = recipes.filter(r => r.status === "private")
    const toTryRecipes = recipes.filter(r => r.status === "to-try")
    const mealPlanRecipes = recipes.filter(r => r.status === "meal-plan")
    
    // Ratings
    const recipesWithRatings = recipes.filter(r => r.rating && r.rating.stars > 0)
    const avgRating = recipesWithRatings.length > 0 
      ? recipesWithRatings.reduce((sum, r) => sum + (r.rating?.stars || 0), 0) / recipesWithRatings.length 
      : 0
      
    // Find highest rated recipe
    const highestRated = [...recipesWithRatings].sort((a, b) => 
      (b.rating?.stars || 0) - (a.rating?.stars || 0)
    )[0] || null
    
    // Nutrition
    const avgCalories = recipes.reduce((sum, r) => sum + r.nutritionalValue.calories, 0) / recipes.length
    
    // Sort by newest first (assuming id is somewhat time-based, otherwise we'd need a timestamp)
    const recentlyAdded = [...recipes].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 3)
    
    // Get meal plan recipes for this week
    const today = new Date()
    const weekEnd = new Date(today)
    weekEnd.setDate(today.getDate() + 7)
    
    const mealPlanThisWeek = mealPlanRecipes
      .filter(r => {
        if (!r.mealPlanDate) return false
        const date = new Date(r.mealPlanDate)
        return date >= today && date <= weekEnd
      })
      .slice(0, 3)
    
    // Get to-try list
    const toTryList = toTryRecipes.slice(0, 3)
    
    return {
      total: recipes.length,
      private: privateRecipes.length,
      toTry: toTryRecipes.length,
      mealPlan: mealPlanRecipes.length,
      avgRating,
      highestRated,
      avgCalories,
      avgCookTime: 30, // Default since we don't have this in the schema
      recentlyAdded,
      mealPlanThisWeek,
      toTryList
    }
  }, [recipes])
  
  // Handle navigation
  const navigateTo = (path: string) => {
    router.push(path)
  }
  
  // Don't render until client-side hydration is complete
  if (!mounted) {
    return null
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden md:block h-screen fixed left-0 top-0 w-64 z-40">
        <Sidebar />
      </div>
      
      {/* Main content area - Full width on mobile, adjusted on desktop */}
      <div className="flex-1 md:ml-64 min-h-screen">
        <div className="flex h-full flex-col">
          {/* Mobile sidebar toggle */}
          <div className="block md:hidden absolute left-4 top-4 z-30">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 bg-background/50 backdrop-blur-sm" aria-label="Open sidebar menu">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <Sidebar />
              </SheetContent>
            </Sheet>
          </div>

          {/* Page Content */}
          <div className="flex-1 p-4 pt-12 md:pt-4">
            <header className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-gray-700 dark:text-gray-300 mt-1">Your cooking activity at a glance</p>
            </header>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Recipes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">To Try</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <CheckSquare className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.toTry}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Meal Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <CalendarRange className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.mealPlan}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-amber-500 dark:text-amber-400 mr-2" />
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.avgRating.toFixed(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Button 
                onClick={() => navigateTo('/generate-recipes')}
                className="h-auto py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Generate New Recipe
              </Button>
              
              <Button 
                onClick={() => navigateTo('/to-try')}
                variant="outline"
                className="h-auto py-3 px-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700"
              >
                <CheckSquare className="h-5 w-5 mr-2" />
                View To-Try List
              </Button>
              
              <Button 
                onClick={() => navigateTo('/meal-plan')}
                variant="outline"
                className="h-auto py-3 px-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700"
              >
                <CalendarRange className="h-5 w-5 mr-2" />
                View Meal Plan
              </Button>
            </div>
            
            {/* Main Content */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <TabsTrigger value="overview" className="text-gray-800 dark:text-gray-200 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Overview</TabsTrigger>
                <TabsTrigger value="activity" className="text-gray-800 dark:text-gray-200 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Recent Activity</TabsTrigger>
                <TabsTrigger value="meal-plan" className="text-gray-800 dark:text-gray-200 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">This Week</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Recipe Stats */}
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white flex items-center">
                          <BarChart3 className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                          Recipe Statistics
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          Your recipe collection breakdown
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Private Recipes</span>
                              <span className="text-gray-900 dark:text-white font-medium">{stats.private}</span>
                            </div>
                            <Progress value={stats.total ? (stats.private / stats.total) * 100 : 0} className="h-2 bg-gray-200 dark:bg-gray-700" />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">To Try List</span>
                              <span className="text-gray-900 dark:text-white font-medium">{stats.toTry}</span>
                            </div>
                            <Progress value={stats.total ? (stats.toTry / stats.total) * 100 : 0} className="h-2 bg-gray-200 dark:bg-gray-700" />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700 dark:text-gray-300">Meal Plan</span>
                              <span className="text-gray-900 dark:text-white font-medium">{stats.mealPlan}</span>
                            </div>
                            <Progress value={stats.total ? (stats.mealPlan / stats.total) * 100 : 0} className="h-2 bg-gray-200 dark:bg-gray-700" />
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Average Calories</p>
                              <p className="text-xl font-semibold text-gray-900 dark:text-white">{Math.round(stats.avgCalories)}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                              <p className="text-sm text-gray-600 dark:text-gray-400">Average Cook Time</p>
                              <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.avgCookTime} min</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Highest Rated Recipe */}
                    {stats.highestRated && (
                      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden">
                        <CardHeader className="pb-0">
                          <CardTitle className="text-gray-900 dark:text-white flex items-center">
                            <Star className="h-5 w-5 mr-2 text-amber-500" />
                            Highest Rated Recipe
                          </CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            Your top-rated recipe
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-4">
                            {stats.highestRated.image && (
                              <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                                <Image 
                                  src={stats.highestRated.image} 
                                  alt={stats.highestRated.title}
                                  width={96}
                                  height={96}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">{stats.highestRated.title}</h3>
                              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mt-1">
                                {stats.highestRated.description || stats.highestRated.ingredients.slice(0, 3).join(", ")}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${i < (stats.highestRated?.rating?.stars || 0) 
                                        ? "text-amber-500 fill-amber-500" 
                                        : "text-gray-300 dark:text-gray-600"}`} 
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {stats.highestRated?.rating?.stars || 0}/5
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            onClick={() => navigateTo(`/?recipe=${stats.highestRated?.id}`)}
                          >
                            View Recipe <ArrowUpRight className="h-4 w-4 ml-1" />
                          </Button>
                        </CardFooter>
                      </Card>
                    )}
                  </div>
                  
                  {/* Quick Access */}
                  <div className="space-y-6">
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                          Quick Access
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          Shortcuts to important features
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start h-auto py-3 px-4 rounded-none text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            onClick={() => navigateTo('/')}
                          >
                            <BookOpen className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                            Browse All Recipes
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start h-auto py-3 px-4 rounded-none text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            onClick={() => navigateTo('/generate-recipes')}
                          >
                            <Sparkles className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                            Generate New Recipe
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start h-auto py-3 px-4 rounded-none text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            onClick={() => navigateTo('/to-try')}
                          >
                            <CheckSquare className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                            To-Try List
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start h-auto py-3 px-4 rounded-none text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            onClick={() => navigateTo('/meal-plan')}
                          >
                            <CalendarRange className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                            Meal Planning
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start h-auto py-3 px-4 rounded-none text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            onClick={() => navigateTo('/search')}
                          >
                            <Search className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                            Search Recipes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Kitchen Tips */}
                    <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800 text-blue-900 dark:text-blue-100">
                      <CardHeader>
                        <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center">
                          <ChefHat className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                          Cooking Tip
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-blue-800 dark:text-blue-200">
                          Always let meat rest after cooking to retain juices and ensure maximum flavor.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              {/* Activity Tab */}
              <TabsContent value="activity">
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Recently Added Recipes</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Your most recently added recipes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.recentlyAdded.length > 0 ? (
                      <div className="space-y-4">
                        {stats.recentlyAdded.map((recipe) => (
                          <div key={recipe.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            {recipe.image && (
                              <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                <Image 
                                  src={recipe.image} 
                                  alt={recipe.title}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 dark:text-white">{recipe.title}</h3>
                              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1 mt-0.5">
                                {recipe.description || recipe.ingredients.slice(0, 3).join(", ")}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">
                                  <Users className="h-3 w-3 mr-1" />
                                  {recipe.servings} servings
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">
                                  <Clock className="h-3 w-3 mr-1" />
                                  30 mins
                                </Badge>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex-shrink-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                              onClick={() => navigateTo(`/?recipe=${recipe.id}`)}
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400">No recipes added yet</p>
                        <Button 
                          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" 
                          onClick={() => navigateTo('/generate-recipes')}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Recipe
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      onClick={() => navigateTo('/')}
                    >
                      View All Recipes <ArrowUpRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Meal Plan Tab */}
              <TabsContent value="meal-plan">
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">This Week's Meal Plan</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Your scheduled recipes for the upcoming week
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.mealPlanThisWeek.length > 0 ? (
                      <div className="space-y-4">
                        {stats.mealPlanThisWeek.map((recipe) => (
                          <div key={recipe.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            {recipe.image && (
                              <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                <Image 
                                  src={recipe.image} 
                                  alt={recipe.title}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 dark:text-white">{recipe.title}</h3>
                              {recipe.mealPlanDate && (
                                <p className="text-sm text-blue-600 dark:text-blue-400 mt-0.5">
                                  {new Date(recipe.mealPlanDate).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-1">
                                <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">
                                  <Users className="h-3 w-3 mr-1" />
                                  {recipe.servings} servings
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-white dark:bg-gray-800">
                                  <Clock className="h-3 w-3 mr-1" />
                                  30 mins
                                </Badge>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex-shrink-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                              onClick={() => navigateTo(`/?recipe=${recipe.id}`)}
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400">No recipes in your meal plan for this week</p>
                        <Button 
                          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" 
                          onClick={() => navigateTo('/meal-plan')}
                        >
                          <CalendarRange className="h-4 w-4 mr-2" />
                          Plan Your Meals
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      onClick={() => navigateTo('/meal-plan')}
                    >
                      View Full Meal Plan <ArrowUpRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
} 