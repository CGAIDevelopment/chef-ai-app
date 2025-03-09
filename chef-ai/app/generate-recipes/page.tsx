"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import Sidebar from "@/components/Sidebar"
import RecipeList from "@/components/RecipeList"
import RecipeDetail from "@/components/RecipeDetail"
import { CreateRecipeModal } from "@/components/CreateRecipeModal"
import { Recipe } from "@/lib/types"
import { Search, PlusCircle, FilterIcon, ChevronLeft, History, Bookmark, RefreshCw, CheckCircle, Loader2, SparklesIcon, Utensils, Clock, Users, InfoIcon, X } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { useRecipeStore } from "@/lib/store"
import confetti from 'canvas-confetti'
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecipeGenerationSteps, ImageGenerationIndicator } from "@/app/loading-states"

export default function GenerateRecipesPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([])
  const [generationHistory, setGenerationHistory] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingPrompt, setGeneratingPrompt] = useState("")
  const [generationStep, setGenerationStep] = useState(1)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const { addRecipe } = useRecipeStore()
  
  // Client-side initialization
  useEffect(() => {
    setMounted(true)
    
    // Handle responsive layout detection
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    
    // Load generation history from localStorage
    const history = localStorage.getItem("generationHistory")
    if (history) {
      setGenerationHistory(JSON.parse(history))
    }
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Save generation prompt to history
  const saveToHistory = useCallback((prompt: string) => {
    const updatedHistory = [prompt, ...generationHistory.filter(item => item !== prompt)].slice(0, 10)
    setGenerationHistory(updatedHistory)
    localStorage.setItem("generationHistory", JSON.stringify(updatedHistory))
  }, [generationHistory])

  // Handle recipe creation
  const handleCreateRecipe = useCallback(async (data: { name: string; description: string; images: string[] }) => {
    try {
      setIsCreateModalOpen(false)
      setIsGenerating(true)
      setGeneratingPrompt(`${data.name}${data.description ? ` - ${data.description}` : ""}`)
      
      // Save prompt to history
      if (data.name) {
        saveToHistory(data.name)
      }

      // Call the AI API to generate the recipe
      const response = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          images: data.images
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate recipe');
      }

      const responseData = await response.json();
      let newRecipe = responseData.recipes[0];
      
      // Generate an AI image of the recipe
      try {
        const imageResponse = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipeTitle: newRecipe.title,
            ingredients: newRecipe.ingredients.map((ing: any) => 
              typeof ing === 'string' ? ing : ing.name || ing.ingredient
            ).filter(Boolean)
          }),
        });
        
        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          if (imageData.imageUrl) {
            // Use the AI-generated image for the recipe
            newRecipe.image = imageData.imageUrl;
            newRecipe.aiGeneratedImage = true;
          }
        } else {
          console.warn("Could not generate recipe image, using default image");
        }
      } catch (imageError) {
        console.error("Error generating recipe image:", imageError);
        // Continue with the recipe creation even if image generation fails
      }
      
      // Add original prompt as a description if none exists
      if (!newRecipe.description && data.name) {
        newRecipe.description = `Created from prompt: "${data.name}"${data.description ? ` with details: ${data.description}` : ''}`;
      }
      
      // Ensure the recipe has all the necessary properties
      newRecipe = {
        ...newRecipe,
        id: `recipe-${Date.now()}`,
        image: newRecipe.image || (data.images.length > 0 ? data.images[0] : "/placeholder.svg"),
        status: "all"
      };
      
      // Add the recipe to the local state
      setGeneratedRecipes(prev => [newRecipe, ...prev])
      setSelectedRecipe(newRecipe)
      
      // Add the recipe to the global store to ensure it appears in all recipes
      addRecipe(newRecipe)
      
      // Trigger confetti celebration effect
      triggerConfetti();
      
      toast.success(
        <div>
          <p className="font-semibold">Recipe generated successfully!</p>
          <p className="text-sm mt-1">You can now ask follow-up questions about this recipe.</p>
          {newRecipe.aiGeneratedImage && (
            <p className="text-xs mt-1 italic">We've also created an AI-generated image of your dish!</p>
          )}
        </div>
      )
    } catch (error) {
      console.error("Error generating recipe:", error)
      toast.error("Failed to generate recipe. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }, [saveToHistory, addRecipe])

  // Confetti celebration effect
  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    function randomInRange(min: number, max: number): number {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Since particles fall down, make them burst from the middle-top
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.3, 0.7), y: randomInRange(0.1, 0.3) }
      });
    }, 250);
  };

  // Handle recipe selection
  const handleSelectRecipe = useCallback((recipe: Recipe) => {
    setSelectedRecipe(recipe)
  }, [])

  // Handle back to list navigation
  const handleBackToList = useCallback(() => {
    setSelectedRecipe(null)
  }, [])

  // Filter recipes based on search query
  const filteredRecipes = generatedRecipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // History prompt selection handler
  const handleHistoryPromptSelect = useCallback((prompt: string) => {
    setIsCreateModalOpen(true)
    setGeneratingPrompt(prompt)
  }, [])

  // Update generation step over time to simulate progress
  useEffect(() => {
    // Only run this effect when isGenerating is true
    if (isGenerating) {
      const stepTimer = setTimeout(() => {
        if (generationStep < 4) {
          setGenerationStep(prev => prev + 1);
        }
      }, 3000);
      
      return () => clearTimeout(stepTimer);
    } else {
      // Reset the steps when not generating
      setGenerationStep(1);
      setIsGeneratingImage(false);
    }
  }, [generationStep, isGenerating]);
  
  // Set image generation phase
  useEffect(() => {
    if (isGenerating && generationStep === 3) {
      setIsGeneratingImage(true);
    }
  }, [generationStep, isGenerating]);

  // Don't render until client-side hydration is complete
  if (!mounted) {
    return null
  }

  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-gray-900">
      {/* Sidebar with fixed position */}
      <div className="fixed left-0 top-0 h-screen z-40 w-[var(--sidebar-width)] bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <Sidebar />
      </div>
      
      {/* Main content area with margin to accommodate sidebar */}
      <div className="flex flex-col w-full min-h-screen ml-0 lg:ml-[var(--sidebar-width)]">
        {/* Header/Navigation - Fixed at top */}
        <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm p-4 md:p-6 w-full">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">AI Recipe Generator</h1>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 hidden md:block">Create personalized recipes using AI</p>
              </div>
              
              {selectedRecipe && (
                <Button
                  variant="outline"
                  onClick={handleBackToList}
                  className="md:hidden text-blue-700 dark:text-blue-400 bg-white dark:bg-gray-800 border-blue-300 dark:border-gray-700 hover:bg-blue-50 hover:dark:bg-gray-700 font-medium h-9 px-3 rounded-md shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1.5" />
                  <span className="font-medium">Back to list</span>
                </Button>
              )}
            </div>
            
            {!selectedRecipe && (
              <div className="flex gap-3 flex-col md:flex-row">
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium h-10 px-4 shadow-sm order-first md:order-last md:flex-shrink-0"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Generate New Recipe
                </Button>

                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    placeholder="Search generated recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-10 w-full dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-700 dark:placeholder-gray-400"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-1 top-1 h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Main content with proper spacing */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Recipe list (hidden on mobile when recipe is selected) */}
            {(!selectedRecipe || !isMobile) && (
              <div className="lg:col-span-1">
                {/* Recipe generation history */}
                {generationHistory.length > 0 && (
                  <Card className="w-full mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <History className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Recent Prompts</CardTitle>
                        </div>
                        <Badge variant="outline" className="text-xs font-normal text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600">
                          {generationHistory.length} {generationHistory.length === 1 ? 'prompt' : 'prompts'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="space-y-2">
                        {generationHistory.slice(0, 5).map((prompt, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="w-full justify-start text-sm py-1.5 px-3 h-auto font-normal text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-700 dark:hover:text-blue-300 transition-colors"
                            onClick={() => handleHistoryPromptSelect(prompt)}
                          >
                            {prompt}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {filteredRecipes.length > 0 ? (
                  <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <CardHeader className="pb-2 pt-4 px-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Generated Recipes</CardTitle>
                        <Badge variant="outline" className="text-xs font-normal text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600">
                          {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <RecipeList
                      recipes={filteredRecipes}
                      onSelectRecipe={handleSelectRecipe}
                      selectedRecipe={selectedRecipe}
                    />
                  </Card>
                ) : (
                  <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                        <Bookmark className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <CardTitle className="text-xl font-medium mb-2 text-gray-900 dark:text-white">No recipes generated yet</CardTitle>
                      <CardDescription className="text-gray-700 dark:text-gray-300 mb-6 max-w-md">
                        Get started by generating your first AI recipe using the button below
                      </CardDescription>
                      <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Generate New Recipe
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            )}
            
            {/* Right column: Recipe detail */}
            {selectedRecipe && (
              <div className="lg:col-span-2">
                <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <CardHeader className="p-4 md:p-5 border-b border-gray-200 dark:border-gray-700 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recipe Details</CardTitle>
                    {!isGenerating && !isMobile && (
                      <Button
                        variant="outline"
                        onClick={handleBackToList}
                        className="text-blue-700 dark:text-blue-400 bg-white dark:bg-gray-800 border-blue-300 dark:border-gray-700 hover:bg-blue-50 hover:dark:bg-gray-700 font-medium h-9 px-3 rounded-md shadow-sm"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1.5" />
                        <span className="font-medium">Back to list</span>
                      </Button>
                    )}
                  </CardHeader>
                  <div className="max-h-[calc(100vh-200px)] overflow-y-auto text-gray-800 dark:text-gray-200">
                    <RecipeDetail recipe={selectedRecipe} />
                  </div>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      <CreateRecipeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRecipe}
        isLoading={isGenerating}
      />
      
      {/* Loading card when generating a recipe */}
      {isGenerating && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 shadow-lg rounded-xl">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="mb-2 p-3 bg-blue-100 dark:bg-blue-900 rounded-full shadow-inner">
                <SparklesIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Chef at Work</h2>
              <p className="text-gray-800 dark:text-gray-200 mt-1">
                Creating your custom recipe with OpenAI's advanced model
              </p>
            </div>
            
            <RecipeGenerationSteps currentStep={generationStep} />
            
            <div className="mt-8 px-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recipe Preview</h3>
                
                <div className="flex items-center mb-4">
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mr-4 shadow-inner"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Ingredients</h4>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Instructions</h4>
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                    ))}
                  </div>
                </div>
                
                {isGeneratingImage && <ImageGenerationIndicator />}
              </div>
            </div>
            
            <div className="mt-6 bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Did you know?</h4>
              <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                Our AI analyzes thousands of recipes and culinary techniques to create unique dishes tailored to your ingredients and preferences!
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

