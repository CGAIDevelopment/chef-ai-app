"use client"

import { useEffect, useState, useMemo } from "react"
import { useRecipeStore } from "@/lib/store"
import RecipeList from "@/components/RecipeList"
import RecipeDetail from "@/components/RecipeDetail"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Recipe as RecipeType } from "@/lib/types"
import { ChefHat, BookOpen, Utensils, BookmarkPlus, Search, PlusCircle, ArrowLeft, ArrowRight, Filter, X, Sparkles, Coffee, Pizza } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import Sidebar from "@/components/Sidebar"
import { Input } from "@/components/ui/input"
import Logo from "@/components/Logo"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

export default function Home() {
  const { recipes, isLoading, error, fetchRecipes, updateRecipeStatus } = useRecipeStore()
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeType | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [showHeroAnimation, setShowHeroAnimation] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  
  // Always fetch recipes on initial load
  useEffect(() => {
    fetchRecipes();
    
    // Hide hero animation after 3 seconds
    const timer = setTimeout(() => {
      setShowHeroAnimation(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [fetchRecipes])

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    // Initial check
    checkMobile()
    
    // Add event listener
    window.addEventListener('resize', checkMobile)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Make sure recipes exist
  useEffect(() => {
    if (!isLoading && recipes.length === 0) {
      fetchRecipes();
    }
  }, [recipes.length, isLoading, fetchRecipes]);
  
  // Filter recipes based on search query
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        recipe.title.toLowerCase().includes(query) || 
        recipe.description?.toLowerCase().includes(query) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(query))
      );
    });
  }, [recipes, searchQuery]);
  
  useEffect(() => {
    // Select the first recipe by default if one exists and none is selected
    if (filteredRecipes.length > 0 && !selectedRecipe) {
      setSelectedRecipe(filteredRecipes[0])
    }
    
    // If the selected recipe is removed or no longer in the list, select the first recipe
    if (selectedRecipe && !filteredRecipes.find(r => r.id === selectedRecipe.id)) {
      if (filteredRecipes.length > 0) {
        setSelectedRecipe(filteredRecipes[0])
      } else {
        setSelectedRecipe(null)
      }
    }
  }, [filteredRecipes, selectedRecipe])

  const handleSelectRecipe = (recipe: RecipeType) => {
    setSelectedRecipe(recipe)
    // Scroll to the top of the recipe detail on mobile
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  
  const handleCreateRecipe = () => {
    router.push('/generate-recipes')
  }
  
  const handleSaveToTry = () => {
    if (selectedRecipe) {
      updateRecipeStatus(selectedRecipe.id, 'to-try')
      toast({
        title: "Recipe Saved",
        description: `${selectedRecipe.title} has been added to your "To Try" list`,
        duration: 3000,
      })
    }
  }

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  // Navigate to next or previous recipe
  const handleNavigate = (direction: 'next' | 'prev') => {
    if (!selectedRecipe || filteredRecipes.length <= 1) return;
    
    const currentIndex = filteredRecipes.findIndex(r => r.id === selectedRecipe.id);
    if (direction === 'next' && currentIndex < filteredRecipes.length - 1) {
      handleSelectRecipe(filteredRecipes[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      handleSelectRecipe(filteredRecipes[currentIndex - 1]);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="animate-pulse flex flex-col items-center"
        >
          <div className="h-20 w-20 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4 flex items-center justify-center relative">
            <ChefHat className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute -top-2 -right-2 h-6 w-6 bg-amber-400 dark:bg-amber-500 rounded-full"
            ></motion.div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-xl w-48"></div>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-red-50 to-white dark:from-gray-900 dark:to-gray-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="max-w-md w-full border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-red-600 dark:text-red-400 flex items-center">
                <X className="h-5 w-5 mr-2" />
                Error Loading Recipes
              </CardTitle>
              <CardDescription className="text-gray-700 dark:text-gray-300">We encountered a problem loading your recipes.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-800 dark:text-gray-200 mb-4">{error}</p>
              <Button 
                onClick={() => fetchRecipes()}
                className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800 shadow-sm"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Sidebar */}
      <div className="h-screen w-[var(--sidebar-width)] flex-shrink-0 fixed left-0 top-0 z-40 text-gray-800 dark:text-gray-200 border-r border-gray-100 dark:border-gray-800">
      <Sidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 ml-0 lg:ml-[var(--sidebar-width)] min-h-screen">
        {/* Hero Section - Only shown when there are no recipes or when the user first logs in */}
        {recipes.length === 0 && (
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white overflow-hidden relative"
          >
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                animate={{ 
                  y: [0, 10, 0],
                  opacity: [0.5, 0.7, 0.5] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 8,
                  ease: "easeInOut" 
                }}
                className="absolute top-10 left-20 w-20 h-20 rounded-full bg-blue-500/20 backdrop-blur-sm"
              ></motion.div>
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.3, 0.5, 0.3] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 10,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-blue-400/10 backdrop-blur-sm"
              ></motion.div>
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.4, 0.6, 0.4] 
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 6,
                  ease: "easeInOut" 
                }}
                className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-amber-500/20 backdrop-blur-sm"
              ></motion.div>
            </div>
            <div className="container mx-auto py-16 md:py-24 px-4 relative z-10">
              <div className="max-w-3xl mx-auto text-center">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center justify-center mb-6 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2 text-amber-300" />
                  <span className="text-sm font-medium">Welcome to ChefAI - Your AI-powered recipe assistant</span>
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white"
                >
                  Your Culinary Journey Starts Here
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto font-light"
                >
                  Create, organize, and discover delicious recipes tailored to your preferences
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap justify-center gap-4"
                >
                  <Button 
                    onClick={handleCreateRecipe} 
                    size="lg" 
                    className="bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:bg-white/90 dark:text-blue-800 dark:hover:bg-white transition-all shadow-lg hover:shadow-xl group"
                  >
                    <ChefHat className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Create Your First Recipe
                  </Button>
                  <Button 
                    onClick={() => router.push('/meal-plan')} 
                    size="lg" 
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all"
                  >
                    <Coffee className="mr-2 h-5 w-5" />
                    Explore Meal Planning
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Floating Recipe Stats - Show only when there are recipes */}
        <AnimatePresence>
          {recipes.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="container mx-auto px-4 md:px-6 pt-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="h-full"
                >
                  <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-sm border border-blue-100 dark:border-gray-700 transition-all hover:shadow-md h-full">
                    <CardContent className="p-6 flex items-center">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mr-4">
                        <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Recipes</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{recipes.length}</h3>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="h-full"
                >
                  <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-sm border border-amber-100 dark:border-gray-700 transition-all hover:shadow-md h-full">
                    <CardContent className="p-6 flex items-center">
                      <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full mr-4">
                        <Utensils className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">To Try</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {recipes.filter(r => r.status === 'to-try').length}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="h-full"
                >
                  <Card className="bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-sm border border-green-100 dark:border-gray-700 transition-all hover:shadow-md h-full">
                    <CardContent className="p-6 flex items-center">
                      <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mr-4">
                        <Pizza className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">Private Recipes</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {recipes.filter(r => r.status === 'private').length}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top header bar with title and search */}
        <motion.header 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`sticky top-0 z-30 backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-all ${recipes.length > 0 ? 'mt-6' : ''}`}
        >
          <div className="container mx-auto p-4 md:px-6">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  My Recipes
                </h1>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-0.5">
                  {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'} in your collection
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9 h-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  {searchQuery && (
                    <button 
                      onClick={handleClearSearch}
                      className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleCreateRecipe}
                    className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800 flex items-center shadow-sm hover:shadow transition-all"
                  >
                    <PlusCircle className="h-4 w-4 mr-1.5" />
                    <span className="hidden sm:inline">New Recipe</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main content */}
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="container mx-auto px-4 py-6 md:px-6 md:py-8"
        >
          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-gray-800 dark:text-gray-200">
            {/* Recipe list column */}
            {(!selectedRecipe || !isMobile) && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="lg:col-span-4 lg:max-h-[calc(100vh-14rem)] lg:overflow-auto"
              >
                {filteredRecipes.length > 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        {searchQuery ? (
                          <>
                            <Search className="h-4 w-4 mr-1.5 text-blue-500 dark:text-blue-400" />
                            Found {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
                          </>
                        ) : (
                          <>All Recipes</>
                        )}
                      </p>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                    <RecipeList
                      recipes={filteredRecipes}
                      onSelectRecipe={handleSelectRecipe}
                      selectedRecipe={selectedRecipe}
                    />
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                    {searchQuery ? (
                      <div className="flex flex-col items-center">
                        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 p-3 rounded-full mb-3">
                          <Search className="h-6 w-6" />
                        </div>
                        <p className="text-lg font-medium mb-2 text-gray-900 dark:text-white">No matching recipes found</p>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          We couldn't find any recipes matching "{searchQuery}"
                        </p>
                        <Button 
                          onClick={handleClearSearch}
                          variant="outline"
                          className="border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Clear Search
                        </Button>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                          <ChefHat className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Recipes Yet</h2>
                        <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-md">
                          Your recipe collection is empty. Create your first recipe to get started!
                        </p>
                        <Button 
                          onClick={handleCreateRecipe} 
                          className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800 shadow-sm hover:shadow transition-all"
                        >
                          <Utensils className="mr-2 h-5 w-5" />
                          Create Your First Recipe
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
            
            {/* Recipe detail column */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="lg:col-span-8"
            >
              {recipes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto p-6">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 w-full">
                    <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                      <ChefHat className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Recipes Yet</h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                      Your recipe collection is empty. Create your first recipe to get started!
                    </p>
                    <Button 
                      onClick={handleCreateRecipe} 
                      size="lg" 
                      className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800 shadow-md hover:shadow-lg transition-all"
                    >
                      <Utensils className="mr-2 h-5 w-5" />
                      Create Your First Recipe
                    </Button>
                  </div>
                </div>
              ) : selectedRecipe ? (
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={selectedRecipe.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    {isMobile && (
                      <div className="flex items-center justify-between mb-4 sticky top-0 z-10 bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 pt-2 pb-2">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedRecipe(null)}
                          className="text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm"
                        >
                          <ArrowLeft className="h-4 w-4 mr-1.5" />
                          Back to list
                        </Button>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={handleSaveToTry}
                            className="text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            size="sm"
                          >
                            <BookmarkPlus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-lg">
                      {!isMobile && (
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-800">
                          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center">
                            <Utensils className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                            Recipe Details
                          </h2>
                          <div className="flex gap-2">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button 
                                variant="outline" 
                                onClick={handleSaveToTry}
                                className="text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                size="sm"
                              >
                                <BookmarkPlus className="h-4 w-4 mr-1.5" />
                                Save to Try
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      )}
                      
                      <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
                        <RecipeDetail recipe={selectedRecipe} />
                      </div>
                      
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex flex-wrap justify-between items-center gap-3">
                          <Badge variant="outline" className="text-sm text-gray-700 dark:text-gray-300 font-medium bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm">
                            Recipe #{filteredRecipes.findIndex(r => r.id === selectedRecipe.id) + 1} of {filteredRecipes.length}
                          </Badge>
                          
                          <div className="flex gap-3">
                            <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={filteredRecipes.length <= 1 || filteredRecipes[0].id === selectedRecipe.id}
                                onClick={() => handleNavigate('prev')}
                                className={filteredRecipes.length <= 1 || filteredRecipes[0].id === selectedRecipe.id 
                                  ? "text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700" 
                                  : "text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"}
                              >
                                <ArrowLeft className="h-4 w-4 mr-1.5" />
                                Previous
                              </Button>
                            </motion.div>
                            
                            <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.95 }}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={filteredRecipes.length <= 1 || filteredRecipes[filteredRecipes.length - 1].id === selectedRecipe.id}
                                onClick={() => handleNavigate('next')}
                                className={filteredRecipes.length <= 1 || filteredRecipes[filteredRecipes.length - 1].id === selectedRecipe.id 
                                  ? "text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700" 
                                  : "text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"}
                              >
                                Next
                                <ArrowRight className="h-4 w-4 ml-1.5" />
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-8 text-center max-w-md w-full"
                  >
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-3 rounded-full inline-block mb-3">
                      <ArrowLeft className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-medium mb-2 text-gray-900 dark:text-white">Select a Recipe</h2>
                    <p className="text-gray-700 dark:text-gray-300">
                      Choose a recipe from the list to view its details, ingredients and instructions
                    </p>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.main>
        </div>
    </div>
  )
}

