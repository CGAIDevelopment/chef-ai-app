"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import Image from "next/image"
import { Recipe } from "@/lib/types"
import { Menu, X, ChevronRight, MoveRight, Clock, Users, Star, StarHalf, Tag, ChefHat, Plus, Coffee, Sparkles, LightbulbIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface RecipeListProps {
  recipes: Recipe[]
  onSelectRecipe: (recipe: Recipe) => void
  selectedRecipe: Recipe | null
}

const RecipeList = React.memo(({ recipes, onSelectRecipe, selectedRecipe }: RecipeListProps) => {
  const [isMobile, setIsMobile] = useState(false)
  const [listVisible, setListVisible] = useState(true)
  const [hoveredRecipeId, setHoveredRecipeId] = useState<string | null>(null)
  
  const cookingTips = [
    "Always preheat your oven for consistent results",
    "Let meat rest after cooking to retain juices",
    "Use a kitchen scale for more accurate measurements",
    "Sharp knives are safer than dull ones",
    "Taste as you go and adjust seasonings",
    "Pat meat dry before searing for better browning",
    "Rest your dough for better texture and flavor",
    "Salt your pasta water for more flavorful pasta"
  ]
  
  const [tipIndex, setTipIndex] = useState(0)
  
  // Rotate cooking tips
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % cookingTips.length)
    }, 20000)
    
    return () => clearInterval(interval)
  }, [cookingTips.length])
  
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
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg overflow-hidden">
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 border-b border-blue-100 dark:border-blue-800/70">
        <div className="px-4 py-3 flex items-center">
          <LightbulbIcon className="h-4 w-4 text-amber-500 dark:text-amber-400 mr-2.5 flex-shrink-0" />
          <p className="text-sm text-blue-800 dark:text-blue-200 font-medium overflow-hidden">
            <span className="font-semibold">Tip:</span> {cookingTips[tipIndex]}
          </p>
        </div>
      </div>
      
      {recipes.length > 0 ? (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700/70 flex-1 overflow-auto">
          {recipes.map((recipe) => (
            <li 
              key={recipe.id}
              className={cn(
                "transition-all duration-200 hover:-translate-y-0.5",
                selectedRecipe?.id === recipe.id 
                  ? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400" 
                  : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent"
              )}
              onMouseEnter={() => setHoveredRecipeId(recipe.id)}
              onMouseLeave={() => setHoveredRecipeId(null)}
            >
              <button 
                className="w-full text-left px-4 py-4 flex gap-4 items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset focus:bg-blue-50 dark:focus:bg-blue-900/20 rounded-sm"
                onClick={() => onSelectRecipe(recipe)}
                aria-selected={selectedRecipe?.id === recipe.id}
              >
                {recipe.image && (
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-md overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700 shadow-sm transition-transform group-hover:scale-105">
                    {recipe.image.startsWith('data:') || recipe.image.startsWith('/') ? (
                      // Local images or data URLs
                      <Image 
                        src={recipe.image} 
                        alt={recipe.title} 
                        width={80} 
                        height={80} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      // Remote images - using next/image with optimized loading
                      <div className="relative h-full w-full">
                        <Image 
                          src={recipe.image} 
                          alt={recipe.title} 
                          fill
                          sizes="(max-width: 640px) 64px, 80px"
                          className="object-cover"
                          unoptimized={recipe.image.includes('oaidalleapiprodscus.blob.core.windows.net')}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium truncate text-gray-900 dark:text-white text-base sm:text-lg">
                    {recipe.title}
                  </h3>
                  
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2.5">
                    {recipe.description || recipe.ingredients.slice(0, 2).join(", ")}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2.5">
                    {recipe.servings && (
                      <Badge variant="outline" className="h-6 px-2 text-xs bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                        <Users className="h-3 w-3 mr-1 text-gray-600 dark:text-gray-400" />
                        <span>{recipe.servings}</span>
                      </Badge>
                    )}
                    
                    {recipe.nutritionalValue?.calories && (
                      <Badge variant="outline" className="h-6 px-2 text-xs bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700">
                        <span>{recipe.nutritionalValue.calories}</span>
                        <span className="ml-1 text-gray-600 dark:text-gray-400">cal</span>
                      </Badge>
                    )}
                    
                    {recipe.rating && (
                      <Badge variant="outline" className="h-6 px-2 text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/50">
                        <Star className="h-3.5 w-3.5 mr-1 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
                        <span>{recipe.rating.stars}</span>
                      </Badge>
                    )}
                  </div>
                </div>
                
                <ChevronRight className={cn(
                  "h-5 w-5 flex-shrink-0 transition-all", 
                  selectedRecipe?.id === recipe.id || hoveredRecipeId === recipe.id 
                    ? "opacity-100 text-blue-600 dark:text-blue-400 translate-x-0" 
                    : "opacity-0 text-gray-400 dark:text-gray-500 -translate-x-2"
                )} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-5">
            <ChefHat className="h-10 w-10 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No recipes found</h3>
          <p className="text-base text-gray-700 dark:text-gray-300 max-w-md">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  )
})

RecipeList.displayName = "RecipeList"

export default RecipeList

