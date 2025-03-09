"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import RecipeList from "@/components/RecipeList"
import RecipeDetail from "@/components/RecipeDetail"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Search, X, PlusCircle, SlidersHorizontal, ChefHat, BookOpen } from "lucide-react"
import { Recipe } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRecipesByStatus, useRecipeStore } from "@/lib/store"

export default function ToTryPage() {
  const router = useRouter();
  const { recipes = [], isLoading, error, fetchRecipes } = useRecipesByStatus("to-try");
  const updateRecipeStatus = useRecipeStore((state) => state.updateRecipeStatus);
  
  // Simple client-side state
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  
  // Client-side only initialization
  useEffect(() => {
    setMounted(true);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    fetchRecipes();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); 
  
  // Filter recipes without any state updates inside effect
  const filteredRecipes = mounted && recipes ? recipes.filter(recipe => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      recipe.title.toLowerCase().includes(query) || 
      recipe.description?.toLowerCase().includes(query) ||
      recipe.ingredients.some(ing => ing.toLowerCase().includes(query))
    );
  }) : [];
  
  // Set initial selection once when filtered recipes change
  useEffect(() => {
    if (filteredRecipes.length > 0 && !selectedRecipeId) {
      setSelectedRecipeId(filteredRecipes[0].id);
    } else if (filteredRecipes.length === 0) {
      setSelectedRecipeId(null);
    } else if (selectedRecipeId && !filteredRecipes.some(r => r.id === selectedRecipeId)) {
      setSelectedRecipeId(filteredRecipes[0].id);
    }
  }, [filteredRecipes.length, selectedRecipeId]);
  
  // Derive selected recipe from ID - not state
  const selectedRecipe = selectedRecipeId
    ? recipes?.find(r => r.id === selectedRecipeId) || null
    : null;
  
  // Event handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);
  
  const handleSelectRecipe = useCallback((recipe: Recipe) => {
    setSelectedRecipeId(recipe.id);
  }, []);
  
  const handleBackToList = useCallback(() => {
    setSelectedRecipeId(null);
  }, []);
  
  const handleRemoveFromTry = useCallback((recipeId: string) => {
    updateRecipeStatus(recipeId, "all");
    setSelectedRecipeId(null);
    toast.success("Recipe removed from your 'To Try' list");
  }, [updateRecipeStatus]);
  
  const handleBrowseRecipes = useCallback(() => {
    router.push('/');
  }, [router]);
  
  // Don't render on server
  if (!mounted) {
    return null;
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="h-screen w-[var(--sidebar-width)] flex-shrink-0 fixed left-0 top-0 z-40 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <Sidebar />
      </div>
      
      {/* Main content with proper margin to accommodate sidebar */}
      <div className="flex-1 ml-0 lg:ml-[var(--sidebar-width)] min-h-screen">
        <div className="h-full">
          {/* Header with search */}
          <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm px-4 py-3 md:px-6 md:py-4">
            <div className="flex flex-col gap-3 max-w-screen-xl mx-auto">
              <div className="flex items-center justify-between">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Recipes To Try
                </h1>
                
                {selectedRecipe && isMobile && (
                  <Button
                    variant="outline"
                    onClick={handleBackToList}
                    className="text-blue-700 dark:text-blue-400 bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-gray-700 font-medium h-9 px-3 rounded-md"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1.5" />
                    <span className="font-medium">Back to list</span>
                  </Button>
                )}

                {!selectedRecipe || !isMobile ? (
                  <Button 
                    onClick={handleBrowseRecipes}
                    className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800 shadow-sm h-9"
                  >
                    <PlusCircle className="h-4 w-4 mr-1.5" />
                    <span>Find Recipes</span>
                  </Button>
                ) : null}
              </div>
              
              {(!selectedRecipe || !isMobile) && (
                <div className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      placeholder="Search your recipes to try..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="pl-9 pr-9 h-10 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus-visible:ring-blue-500"
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
                  <Button variant="outline" className="h-10 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <span>Sort</span>
                  </Button>
                </div>
              )}
            </div>
          </header>
          
          {/* Main content */}
          <main className="p-4 md:p-6 max-w-screen-xl mx-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-8 mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-800 dark:text-gray-200 font-medium">Loading your recipes to try...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4 text-center">
                <p className="text-red-800 dark:text-red-300 font-medium">{error}</p>
                <Button 
                  onClick={fetchRecipes}
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column: Recipe list (hidden on mobile when recipe is selected) */}
                {(!selectedRecipe || !isMobile) && (
                  <div className="lg:col-span-1">
                    {filteredRecipes.length > 0 ? (
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'Recipe' : 'Recipes'}
                          </p>
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
                              className="border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                            >
                              Clear Search
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-3 rounded-full mb-3">
                              <BookOpen className="h-6 w-6" />
                            </div>
                            <p className="text-lg font-medium mb-2 text-gray-900 dark:text-white">No recipes in your "To Try" list</p>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                              When you find recipes you want to try later, they'll appear here
                            </p>
                            <Button 
                              onClick={handleBrowseRecipes}
                              className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800"
                            >
                              Find Recipes to Try
                            </Button>
                            
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 grid md:grid-cols-2 gap-4 text-left">
                              <div className="flex gap-3">
                                <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-2 rounded-full h-10 w-10 flex items-center justify-center">
                                  <ChefHat className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-900 dark:text-white">Browse Recipes</h3>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">Explore recipes and save the ones you want to try</p>
                                </div>
                              </div>
                              
                              <div className="flex gap-3">
                                <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-2 rounded-full h-10 w-10 flex items-center justify-center">
                                  <BookOpen className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-900 dark:text-white">Save for Later</h3>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">Click "Add to Try" on any recipe to save it to this list</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Right column: Recipe detail */}
                {selectedRecipe ? (
                  <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900 dark:text-white">Recipe Details</h2>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRemoveFromTry(selectedRecipe.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Remove from "To Try"
                        </Button>
                      </div>
                      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                        <RecipeDetail recipe={selectedRecipe} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="hidden lg:block lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 h-full flex items-center justify-center">
                      <div className="text-center max-w-md mx-auto">
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-3 rounded-full inline-block mb-3">
                          <ChevronLeft className="h-6 w-6" />
                        </div>
                        <p className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Select a recipe</p>
                        <p className="text-gray-700 dark:text-gray-300">
                          Choose a recipe from the list to view its details, ingredients and instructions
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

