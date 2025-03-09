"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, ListTodo, CalendarIcon, Star, AlertTriangle, X, ShoppingCart, ChevronDown, Heart, Check, Minus, Plus, Share, CalendarPlus, ExternalLink, Bookmark, CalendarRange, FolderPlus, Copy } from "lucide-react"
import Image from "next/image"
import { useState, useCallback, useEffect, useMemo } from "react"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from "@/components/ui/popover"
import { toast } from "sonner"
import { useRecipeStore } from "@/lib/store"
import RecipeRating from "./RecipeRating"
import type { Recipe, RecipeVariation, MealTime } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Clock, Users } from "lucide-react"
import RecipeFollowUp from "./RecipeFollowUp"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MEAL_TIME_LABELS } from "@/lib/types"
import AnimatedConfetti from "./AnimatedConfetti"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { usePathname } from "next/navigation"
import Link from "next/link"
import ShareRecipeDialog from "./ShareRecipeDialog"

interface RecipeDetailProps {
  recipe: Recipe
}

const RecipeDetail = ({ recipe }: RecipeDetailProps) => {
  const [date, setDate] = useState<Date>()
  const [activeRecipe, setActiveRecipe] = useState<Recipe>(recipe)
  const [showVariationDialog, setShowVariationDialog] = useState(false)
  const [pendingVariation, setPendingVariation] = useState<RecipeVariation | null>(null)
  const [isApplyingVariation, setIsApplyingVariation] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const [customServings, setCustomServings] = useState<number | null>(null)
  const [selectedMealTime, setSelectedMealTime] = useState<MealTime>("dinner")
  const [mounted, setMounted] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  
  const { updateRecipeStatus, getRecipeById, applyRecipeModification, rateRecipe } = useRecipeStore()
  const router = useRouter()

  // When recipe prop changes, update active recipe and reset custom servings
  if (recipe.id !== activeRecipe.id) {
    setActiveRecipe(recipe)
    setCustomServings(null)
  }
  
  // Get the effective servings - either custom or from recipe
  const effectiveServings = customServings || activeRecipe.servings || 1

  // Get the original (base) recipe before any variations
  const baseRecipe = useMemo(() => {
    // If no variation is applied, the active recipe is the base
    if (!activeRecipe.appliedVariationId) return activeRecipe

    // Create a copy of the recipe without variation changes
    const { variations, appliedVariationId, ...base } = activeRecipe
    return base as Recipe
  }, [activeRecipe])
  
  // Parse ingredient text and scale quantity based on serving size
  const parseAndScaleIngredient = (ingredient: string, originalServings: number, newServings: number) => {
    // Common units of measurement to avoid scaling things like "1 pinch of salt"
    const nonScalableUnits = ['pinch', 'pinches', 'dash', 'dashes', 'to taste', 'as needed']
    
    // If no scaling needed, return as is
    if (originalServings === newServings) return ingredient
    
    // Regex to match quantities in various formats (e.g., "2", "2.5", "1/2", "1 1/2")
    const quantityRegex = /^((\d+\s+)?(\d+\/\d+|\d+\.\d+|\d+))\s+/
    const match = ingredient.match(quantityRegex)
    
    // If no match found or contains non-scalable unit, return ingredient as is
    if (!match || nonScalableUnits.some(unit => ingredient.toLowerCase().includes(unit))) {
      return ingredient
    }
    
    // Extract the quantity and the rest of the ingredient
    const quantity = match[1]
    const restOfIngredient = ingredient.substring(match[0].length)
    
    // Calculate the scaling factor
    const scaleFactor = newServings / originalServings
    
    // Function to parse and scale fractions or decimals
    const scaleQuantity = (quantityStr: string) => {
      // Handle mixed numbers like "1 1/2"
      if (quantityStr.includes(' ')) {
        const [whole, fraction] = quantityStr.split(' ')
        const wholeNum = parseInt(whole)
        
        // Handle the fractional part
        if (fraction.includes('/')) {
          const [numerator, denominator] = fraction.split('/').map(Number)
          const decimal = wholeNum + numerator / denominator
          return formatQuantity(decimal * scaleFactor)
        }
      }
      // Handle simple fractions like "1/2"
      else if (quantityStr.includes('/')) {
        const [numerator, denominator] = quantityStr.split('/').map(Number)
        return formatQuantity((numerator / denominator) * scaleFactor)
      }
      // Handle decimals and integers
      else {
        return formatQuantity(parseFloat(quantityStr) * scaleFactor)
      }
    }
    
    // Format the scaled quantity for display
    const formatQuantity = (value: number) => {
      // For small values, try to convert to fractions for readability
      if (value < 1) {
        if (Math.abs(value - 0.25) < 0.05) return "1/4"
        if (Math.abs(value - 0.33) < 0.05) return "1/3"
        if (Math.abs(value - 0.5) < 0.05) return "1/2"
        if (Math.abs(value - 0.67) < 0.05) return "2/3"
        if (Math.abs(value - 0.75) < 0.05) return "3/4"
      }
      
      // Handle whole numbers
      if (Math.round(value) === value) {
        return value.toString()
      }
      
      // Handle value with fractional part
      const whole = Math.floor(value)
      const fraction = value - whole
      
      // Convert decimal to fraction representation for common values
      let fractionStr = ''
      if (Math.abs(fraction - 0.25) < 0.05) fractionStr = "1/4"
      else if (Math.abs(fraction - 0.33) < 0.05) fractionStr = "1/3"
      else if (Math.abs(fraction - 0.5) < 0.05) fractionStr = "1/2"
      else if (Math.abs(fraction - 0.67) < 0.05) fractionStr = "2/3"
      else if (Math.abs(fraction - 0.75) < 0.05) fractionStr = "3/4"
      else {
        // For other values, round to 1 decimal place
        return value.toFixed(1)
      }
      
      // Return mixed number format for whole + fraction
      return whole > 0 ? `${whole} ${fractionStr}` : fractionStr
    }
    
    // Scale and format the quantity
    const scaledQuantity = scaleQuantity(quantity)
    
    // Return the scaled ingredient
    return `${scaledQuantity} ${restOfIngredient}`
  }

  // Scale all ingredients based on custom serving size
  const getScaledIngredients = () => {
    if (!activeRecipe.ingredients) return []
    
    // If no custom servings set, return original ingredients
    if (!customServings || customServings === activeRecipe.servings) {
      return activeRecipe.ingredients
    }
    
    // Scale each ingredient
    return activeRecipe.ingredients.map(ingredient => 
      parseAndScaleIngredient(ingredient, activeRecipe.servings, customServings)
    )
  }

  // Get the scaled ingredients
  const scaledIngredients = getScaledIngredients()

  // After recipe updates, refresh from store
  const refreshRecipe = useCallback(() => {
    const freshRecipe = getRecipeById(activeRecipe.id)
    if (freshRecipe) {
      setActiveRecipe(freshRecipe)
    }
  }, [activeRecipe.id, getRecipeById])

  // Ensure recipe is updated when it changes
  useEffect(() => {
    if (recipe.id) {
      const storeRecipe = getRecipeById(recipe.id)
      if (storeRecipe) {
        setActiveRecipe(storeRecipe)
      }
    }
  }, [recipe.id, getRecipeById])

  const handleAddToPrivate = useCallback(() => {
    updateRecipeStatus(activeRecipe.id, "private")
    toast.success("The recipe has been added to your private collection.")
  }, [activeRecipe.id, updateRecipeStatus])

  const handleAddToTry = useCallback(() => {
    updateRecipeStatus(activeRecipe.id, "to-try")
    toast.success("The recipe has been added to your 'to try' list.")
  }, [activeRecipe.id, updateRecipeStatus])

  const handleAddToMealPlan = useCallback(() => {
    if (!date) {
      toast.error("Please select a date for the meal plan.")
      return
    }

    updateRecipeStatus(activeRecipe.id, "meal-plan", format(date, "yyyy-MM-dd"), selectedMealTime)
    toast.success(`The recipe has been added to your meal plan for ${format(date, "PPP")} (${MEAL_TIME_LABELS[selectedMealTime]}).`)
  }, [date, activeRecipe.id, updateRecipeStatus, selectedMealTime])

  const handleAddToShoppingList = useCallback(() => {
    const store = useRecipeStore.getState();
    store.addToShoppingList(activeRecipe.id, scaledIngredients);
    toast.success(`Added ingredients from "${activeRecipe.title}" to shopping list`, {
      action: {
        label: "View List",
        onClick: () => router.push("/shopping-list")
      }
    });
  }, [activeRecipe.id, activeRecipe.title, scaledIngredients, router]);

  const handleApplyVariation = useCallback((variation: RecipeVariation) => {
    setPendingVariation(variation)
    setShowVariationDialog(true)
  }, [])

  const confirmApplyVariation = useCallback(async () => {
    if (!pendingVariation) return
    
    setIsApplyingVariation(true)
    try {
      await applyRecipeModification(activeRecipe.id, pendingVariation.followUpId, pendingVariation)
      refreshRecipe() // Get the updated recipe from store
      toast.success(`Applied "${pendingVariation.name}" to recipe`)
      setShowVariationDialog(false)
      setPendingVariation(null)
    } catch (error) {
      toast.error('Failed to apply variation to recipe')
      console.error('Error applying variation:', error)
    } finally {
      setIsApplyingVariation(false)
    }
  }, [pendingVariation, activeRecipe.id, applyRecipeModification, refreshRecipe])

  // Check if the recipe is a variation that has been applied
  const isVariation = activeRecipe.variations && activeRecipe.variations.some(v => 
    v.id === activeRecipe.appliedVariationId
  )

  // Check if recipe image is a remote URL or local resource
  const isRemoteImage = recipe.image && !recipe.image.startsWith('/') && !recipe.image.startsWith('data:');

  // Function to handle rating updates
  const handleRating = (stars: number) => {
    const currentComment = activeRecipe.rating?.comment || "";
    rateRecipe(activeRecipe.id, stars, currentComment);
    
    // Update the local state to immediately reflect the change
    setActiveRecipe(prev => ({
      ...prev,
      rating: { stars, comment: currentComment }
    }));
    
    toast.success(`Rated ${stars} stars!`);
  }
  
  // Function to handle comment updates
  const handleComment = (comment: string) => {
    const currentStars = activeRecipe.rating?.stars || 5;
    rateRecipe(activeRecipe.id, currentStars, comment);
    
    // Update the local state to immediately reflect the change
    setActiveRecipe(prev => ({
      ...prev,
      rating: { stars: currentStars, comment }
    }));
    
    toast.success("Comment saved!");
    
    // Clear the comment input if it exists
    const commentInput = document.getElementById('comment-input') as HTMLTextAreaElement;
    if (commentInput) {
      commentInput.value = '';
    }
  }

  const handleShareRecipe = useCallback(() => {
    setShareDialogOpen(true)
  }, [])

  return (
    <div className="flex flex-col font-sans">
      {/* Share Recipe Dialog */}
      <ShareRecipeDialog 
        recipe={activeRecipe}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
      
      {/* Recipe header with image */}
      <div className="relative w-full">
        {activeRecipe.image && (
          <div className="relative w-full h-56 md:h-64 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
            <Image
              src={activeRecipe.image}
              alt={activeRecipe.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              unoptimized={activeRecipe.image.includes('oaidalleapiprodscus.blob.core.windows.net')}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-20">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-sm">
                {activeRecipe.title}
              </h1>
              {activeRecipe.description && (
                <p className="text-sm md:text-base text-gray-100 mb-2 line-clamp-2 max-w-3xl drop-shadow-sm">
                  {activeRecipe.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 rounded-full px-3 py-1 text-sm flex items-center shadow-sm">
                  <Users className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400" />
                  <span>{effectiveServings} {effectiveServings === 1 ? 'serving' : 'servings'}</span>
                </div>
                
                {activeRecipe.nutritionalValue?.calories && (
                  <div className="bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 rounded-full px-3 py-1 text-sm flex items-center shadow-sm">
                    <span>{Math.round((activeRecipe.nutritionalValue.calories / activeRecipe.servings) * effectiveServings)}</span>
                    <span className="ml-1 text-gray-600 dark:text-gray-400">calories</span>
                  </div>
                )}
                
                <div className="flex-grow"></div>
                
                {/* Rating stars */}
                {activeRecipe.rating ? (
                  <div className="flex items-center gap-1.5 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 rounded-full px-3 py-1 text-sm shadow-sm hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className="focus:outline-none"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => handleRating(star)}
                      >
                        <Star
                          className={cn(
                            "h-4 w-4 transition-all",
                            star <= (hoverRating || (activeRecipe.rating ? activeRecipe.rating.stars : 0))
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-400"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-1.5 shadow-sm hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className="focus:outline-none"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => handleRating(star)}
                      >
                        <Star
                          className={cn(
                            "h-4 w-4 transition-colors",
                            star <= hoverRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-400"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!activeRecipe.image && (
          <div className="w-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {activeRecipe.title}
            </h1>
            {activeRecipe.description && (
              <p className="text-base text-gray-700 dark:text-gray-300 mb-4 max-w-3xl">
                {activeRecipe.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full px-3 py-1 text-sm flex items-center shadow-sm">
                <Users className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400" />
                <span>{effectiveServings} {effectiveServings === 1 ? 'serving' : 'servings'}</span>
              </div>
              
              {activeRecipe.nutritionalValue?.calories && (
                <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full px-3 py-1 text-sm flex items-center shadow-sm">
                  <span>{Math.round((activeRecipe.nutritionalValue.calories / activeRecipe.servings) * effectiveServings)}</span>
                  <span className="ml-1 text-gray-600 dark:text-gray-400">calories</span>
                </div>
              )}
              
              <div className="flex-grow"></div>
              
              {/* Rating stars */}
              {activeRecipe.rating ? (
                <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full px-3 py-1 text-sm shadow-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="focus:outline-none"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRating(star)}
                    >
                      <Star
                        className={cn(
                          "h-4 w-4 transition-all",
                          star <= (hoverRating || (activeRecipe.rating ? activeRecipe.rating.stars : 0))
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-400"
                        )}
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-full px-3 py-1 text-sm flex items-center gap-1.5 shadow-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="focus:outline-none"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRating(star)}
                    >
                      <Star
                        className={cn(
                          "h-4 w-4 transition-colors",
                          star <= hoverRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-400"
                        )}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Card className="h-full overflow-hidden flex flex-col border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="p-0 flex-1 overflow-auto">
          <div className="p-4 md:p-6 space-y-4 text-gray-800 dark:text-gray-200">
            <div className="space-y-5 text-sm md:text-base">
              {activeRecipe.ingredients && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white">Ingredients</h3>
                    
                    {/* Serving size adjustment */}
                    {activeRecipe.servings > 0 && (
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5 border border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">Servings:</span>
                        <div className="flex items-center">
                          <button 
                            className="h-6 w-6 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => {
                              const newServings = Math.max(1, effectiveServings - 1);
                              setCustomServings(newServings);
                            }}
                            disabled={effectiveServings <= 1}
                            aria-label="Decrease servings"
                          >
                            <span className="text-sm font-bold">-</span>
                          </button>
                          
                          <div className="mx-2 min-w-[2rem] text-center text-sm font-medium text-gray-900 dark:text-white">
                            {effectiveServings}
                          </div>
                          
                          <button 
                            className="h-6 w-6 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => {
                              const newServings = effectiveServings + 1;
                              setCustomServings(newServings);
                            }}
                            aria-label="Increase servings"
                          >
                            <span className="text-sm font-bold">+</span>
                          </button>
                        </div>
                        
                        {customServings !== null && customServings !== activeRecipe.servings && (
                          <button 
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            onClick={() => setCustomServings(null)}
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                      {scaledIngredients.map((ingredient, index) => {
                        // Find the quantity part to highlight it
                        const quantityMatch = ingredient.match(/^((\d+\s+)?(\d+\/\d+|\d+\.\d+|\d+))\s+/);
                        
                        if (quantityMatch) {
                          const quantity = quantityMatch[1];
                          const restOfIngredient = ingredient.substring(quantityMatch[0].length);
                          
                          return (
                            <li key={index} className="flex items-start text-gray-700 dark:text-gray-300">
                              <span className="text-gray-400 mr-2">•</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{quantity}</span>
                              <span className="ml-1">{restOfIngredient}</span>
                            </li>
                          );
                        }
                        
                        // Fallback for ingredients without a clear quantity
                        return (
                          <li key={index} className="flex items-start text-gray-700 dark:text-gray-300">
                            <span className="text-gray-400 mr-2">•</span>
                            <span>{ingredient}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
              
              {activeRecipe.instructions && (
                <div>
                  <h3 className="font-semibold text-sm md:text-base mb-1.5 text-gray-900 dark:text-white">Instructions</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <ol className="list-decimal pl-5 space-y-3 text-gray-700 dark:text-gray-300">
                      {activeRecipe.instructions.map((instruction, index) => (
                        <li key={index} className="pl-1">
                          <p>{instruction}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
              
              {/* Nutritional Information */}
              {activeRecipe.nutritionalValue && (
                <div>
                  <h3 className="font-semibold text-sm md:text-base mb-1.5 text-gray-900 dark:text-white flex items-center">
                    <span className="mr-2">Nutritional Information</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-normal">(per serving)</span>
                  </h3>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Calculate scaled nutritional values */}
                      {[
                        { 
                          name: 'Calories', 
                          value: Math.round(activeRecipe.nutritionalValue.calories * (customServings !== null ? customServings / activeRecipe.servings : 1) / effectiveServings),
                          unit: 'kcal'
                        },
                        { 
                          name: 'Protein', 
                          value: parseFloat((activeRecipe.nutritionalValue.protein * (customServings !== null ? customServings / activeRecipe.servings : 1) / effectiveServings).toFixed(1)),
                          unit: 'g'
                        },
                        { 
                          name: 'Carbs', 
                          value: parseFloat((activeRecipe.nutritionalValue.carbs * (customServings !== null ? customServings / activeRecipe.servings : 1) / effectiveServings).toFixed(1)),
                          unit: 'g'
                        },
                        { 
                          name: 'Fat', 
                          value: parseFloat((activeRecipe.nutritionalValue.fat * (customServings !== null ? customServings / activeRecipe.servings : 1) / effectiveServings).toFixed(1)),
                          unit: 'g'
                        }
                      ].map((nutrient, index) => (
                        <div key={index} className="bg-white dark:bg-gray-700 rounded-md p-3 shadow-sm">
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{nutrient.name}</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {nutrient.value} <span className="text-xs font-normal">{nutrient.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {customServings !== null && customServings !== activeRecipe.servings && (
                      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 italic">
                        Nutritional information adjusted for {effectiveServings} servings. Original values are based on {activeRecipe.servings} servings.
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeRecipe.rating?.comment && (
                <div>
                  <h3 className="font-semibold text-sm md:text-base mb-1.5 text-gray-900 dark:text-white">Notes</h3>
                  <p className="text-gray-700 dark:text-gray-300">{activeRecipe.rating.comment}</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddToPrivate}
                className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 h-8 text-xs"
              >
                <Lock className="mr-1.5 h-3.5 w-3.5" />
                Save to Private
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShareRecipe}
                className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 h-8 text-xs"
              >
                <Share className="mr-1.5 h-3.5 w-3.5" />
                Share Recipe
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddToTry}
                className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 h-8 text-xs"
              >
                <ListTodo className="mr-1.5 h-3.5 w-3.5" />
                Save to Try
              </Button>

              <Button 
                size="sm" 
                onClick={handleAddToShoppingList}
                className="text-blue-700 border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 font-medium rounded-md h-8 px-3 text-xs shadow-sm dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-900/30"
              >
                <ShoppingCart className="h-3.5 w-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold">Add to Shopping List</span>
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    size="sm" 
                    className="text-green-700 border-green-300 bg-green-50 hover:bg-green-100 hover:text-green-800 font-medium rounded-md h-8 px-3 text-xs shadow-sm dark:bg-green-900/20 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900/30"
                  >
                    <CalendarPlus className="h-3.5 w-3.5 mr-1.5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold">Add to Meal Plan</span>
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-3" align="end">
                  <div className="flex flex-col gap-4 p-4">
                    <div className="bg-green-50/90 dark:bg-green-900/30 -mt-4 -mx-4 px-4 py-3 border-b border-green-200 dark:border-green-800 mb-2 relative">
                      <PopoverClose className="absolute right-3 top-3 h-6 w-6 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors">
                        <X className="h-3.5 w-3.5" />
                        <span className="sr-only">Close</span>
                      </PopoverClose>
                      <h3 className="font-bold text-green-800 dark:text-green-300 text-base">Add to Meal Plan</h3>
                      <p className="text-green-700 dark:text-green-400 text-xs mt-1">Select a date for this recipe</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 p-2">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        className="rounded-md"
                        classNames={{
                          day_selected: "bg-green-600 text-white hover:bg-green-700 hover:text-white",
                          day_today: "bg-green-100 text-green-900 font-bold",
                          caption_label: "font-bold text-gray-800 text-base",
                          day: "text-gray-800 font-medium hover:bg-green-50 hover:text-green-800 focus:bg-green-100 focus:text-green-900 h-9 w-9",
                          head_cell: "text-gray-700 font-semibold text-sm w-9 h-9 flex items-center justify-center",
                          table: "border-separate border-spacing-1",
                          cell: "p-0 relative focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-green-50",
                          nav_button: "bg-white text-gray-700 hover:bg-green-50 hover:text-green-800 border border-gray-200",
                          row: "flex w-full my-1 justify-center",
                          head_row: "flex w-full justify-center mb-1",
                          day_outside: "text-gray-400 opacity-50 hover:bg-gray-50 hover:text-gray-500",
                          day_disabled: "text-gray-300 opacity-40 hover:bg-white"
                        }}
                      />
                    </div>
                    
                    {/* Meal time selection */}
                    <div className="space-y-2">
                      <label htmlFor="meal-time" className="block text-sm font-medium text-green-800">
                        Select a meal time
                      </label>
                      <Select
                        value={selectedMealTime}
                        onValueChange={(value) => setSelectedMealTime(value as MealTime)}
                      >
                        <SelectTrigger id="meal-time" className="w-full border-green-200 focus:ring-green-500">
                          <SelectValue placeholder="Select a meal time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="morning-snack">Morning Snack</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="afternoon-snack">Afternoon Snack</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {date && (
                      <div className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-md border border-green-200">
                        <div className="text-sm font-medium text-green-800">
                          <div>
                            <span className="font-bold">{format(date, "MMM d, yyyy")}</span>
                          </div>
                          <div className="text-xs text-green-700">
                            {MEAL_TIME_LABELS[selectedMealTime]}
                          </div>
                        </div>
                        <Button 
                          onClick={handleAddToMealPlan}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold h-8 px-4 text-xs shadow-md rounded-md"
                        >
                          Confirm
                        </Button>
                      </div>
                    )}
                    
                    {!date && (
                      <Button 
                        onClick={handleAddToMealPlan}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold mt-1 h-9 text-sm shadow-md w-full"
                        disabled={!date}
                      >
                        Add to Meal Plan
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Rating Comment Section */}
            <div className="border-t border-gray-100 dark:border-gray-700 mt-6 pt-4">
              <h3 className="font-semibold text-sm md:text-base mb-3 text-gray-900 dark:text-white flex items-center">
                <Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500" />
                Rate This Recipe
              </h3>
              
              {activeRecipe.rating ? (
                <div className="space-y-3">
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <button 
                          key={index}
                          type="button"
                          onClick={() => {
                            const newRating = index + 1;
                            handleRating(newRating);
                          }}
                          onMouseEnter={() => setHoverRating(index + 1)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="focus:outline-none transition-all hover:scale-110 relative"
                          aria-label={`Rate ${index + 1} stars`}
                          data-rating={index + 1}
                        >
                          <Star 
                            className={`h-6 w-6 
                              ${(hoverRating > 0 && index < hoverRating) 
                                ? "text-yellow-500 fill-yellow-500" 
                                : (activeRecipe.rating && index < activeRecipe.rating.stars)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300"
                              } 
                              cursor-pointer transition-colors duration-150`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        {hoverRating > 0 ? `${hoverRating}/5` : activeRecipe.rating ? `${activeRecipe.rating.stars}/5` : '0/5'}
                      </span>
                    </div>
                  </div>
                  
                  {activeRecipe.rating.comment ? (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{activeRecipe.rating.comment}</p>
                      <Button 
                        variant="link" 
                        className="text-xs text-blue-600 dark:text-blue-400 p-0 h-auto mt-1"
                        onClick={() => {
                          // Open a comment editing dialog or functionality
                          const newComment = prompt("Update your comment:", activeRecipe.rating?.comment);
                          if (newComment !== null) {
                            handleComment(newComment);
                          }
                        }}
                      >
                        Edit comment
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Textarea 
                        placeholder="Add your thoughts about this recipe..."
                        className="h-24 text-sm text-gray-800 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 resize-none"
                        id="comment-input"
                      />
                      <Button 
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm"
                        onClick={() => {
                          const commentInput = document.getElementById('comment-input') as HTMLTextAreaElement;
                          const comment = commentInput.value;
                          if (comment.trim()) {
                            handleComment(comment);
                          }
                        }}
                      >
                        Save Comment
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    How would you rate this recipe? Click the stars above to rate it.
                  </p>
                </div>
              )}
            </div>
            
            {/* Add Recipe Follow-up Component with variation handling */}
            <div className="border-t border-gray-100 dark:border-gray-700 mt-6 pt-6">
              <RecipeFollowUp 
                recipeId={activeRecipe.id} 
                onApplyVariation={handleApplyVariation}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Applying Variations */}
      <AlertDialog open={showVariationDialog} onOpenChange={setShowVariationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Recipe Variation</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingVariation && (
                <div className="space-y-3 py-2">
                  <p>Are you sure you want to apply the &quot;{pendingVariation.name}&quot; variation to this recipe?</p>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-md p-3 text-sm flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-amber-800 dark:text-amber-300">
                      This will update the current recipe with modified ingredients and instructions. The original recipe data will not be lost and can be restored.
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApplyingVariation}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApplyVariation}
              disabled={isApplyingVariation}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isApplyingVariation ? "Applying..." : "Apply Variation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default RecipeDetail

