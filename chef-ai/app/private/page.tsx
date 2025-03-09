"use client"

import { useRecipeStore } from "@/lib/store"
import { useState, useEffect, useMemo } from "react"
import Sidebar from "@/components/Sidebar"
import RecipeList from "@/components/RecipeList"
import RecipeDetail from "@/components/RecipeDetail"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, BookLock, Search, Plus, SlidersHorizontal, X, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ChefHat, LightbulbIcon } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Private() {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const store = useRecipeStore()

  const privateRecipes = useMemo(() => store.recipes.filter((recipe) => recipe.status === "private"), [store.recipes])

  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return privateRecipes;
    
    const query = searchQuery.toLowerCase();
    return privateRecipes.filter(recipe => 
      recipe.title.toLowerCase().includes(query) || 
      (recipe.description && recipe.description.toLowerCase().includes(query)) ||
      recipe.ingredients.some(ing => ing.toLowerCase().includes(query))
    );
  }, [privateRecipes, searchQuery]);

  const selectedRecipe = useMemo(
    () => privateRecipes.find((recipe) => recipe.id === selectedRecipeId) || null,
    [privateRecipes, selectedRecipeId],
  )

  useEffect(() => {
    store.fetchRecipes()
  }, [store])

  // Reset selected recipe when filtered recipes change
  useEffect(() => {
    if (selectedRecipeId && !filteredRecipes.some(r => r.id === selectedRecipeId)) {
      setSelectedRecipeId(null);
    }
  }, [filteredRecipes, selectedRecipeId]);

  if (store.isLoading) {
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
            
            <div className="flex items-center justify-center h-full p-4 pt-12 md:pt-4">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                <p className="text-gray-800 dark:text-gray-200 font-medium">Loading your private recipes...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (store.error) {
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
            
            <div className="p-4 pt-12 md:pt-4">
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="text-gray-800">{store.error}</AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    )
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
            <div className="flex flex-col md:flex-row h-full">
              <div className="w-full md:w-80 lg:w-96 flex flex-col border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden mb-4 md:mb-0 md:mr-4">
                {/* Search & Filter Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                      <BookLock className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Private Recipes
                    </h1>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-gray-500"
                      onClick={() => router.push('/generate-recipes')}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add Recipe</span>
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search your recipes..."
                      className="pl-9 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Clear search</span>
                      </button>
                    )}
                  </div>
                  
                  {searchQuery && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Found {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
                    </div>
                  )}
                </div>
                
                {/* Recipe List */}
                <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800">
                  <RecipeList
                    recipes={filteredRecipes}
                    onSelectRecipe={(recipe) => setSelectedRecipeId(recipe.id)}
                    selectedRecipe={selectedRecipe}
                  />
                </div>
              </div>
              
              {/* Main Content Area */}
              <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                {selectedRecipe ? (
                  <RecipeDetail recipe={selectedRecipe} />
                ) : (
                  <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
                    <CardHeader className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                      <CardTitle className="text-gray-900 dark:text-white">Your Private Recipe Collection</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Save and access your favorite recipes anytime, even offline
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                      {privateRecipes.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="bg-blue-50 dark:bg-blue-900/30 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookLock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No private recipes yet</h3>
                          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                            Save your favorite recipes to your private collection for quick access
                          </p>
                          <div className="space-y-6 max-w-md mx-auto">
                            <Button 
                              onClick={() => router.push('/generate-recipes')}
                              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Create New Recipe
                            </Button>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center mb-2">
                                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                                    <ChefHat className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  </div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">Generate recipes</h4>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Create custom recipes based on your preferences and available ingredients
                                </p>
                              </div>
                              
                              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center mb-2">
                                  <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                                    <LightbulbIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                  </div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">Save recipes</h4>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Mark recipes as private to keep them in your personal collection
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : filteredRecipes.length === 0 ? (
                        <div className="text-center py-8">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No recipes match your search</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search terms</p>
                          <Button 
                            variant="outline" 
                            onClick={() => setSearchQuery("")}
                            className="text-gray-800 dark:text-gray-200"
                          >
                            Clear Search
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a recipe</h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            Choose a recipe from the list to view details
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

