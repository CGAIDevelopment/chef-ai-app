"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRecipeStore } from "@/lib/store"
import { Loader2, MessageCircle, HelpCircle, ArrowDown, ArrowUp, MessagesSquare, ChefHat, Check, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { FollowUpQA, RecipeVariation } from "@/lib/types"

interface RecipeFollowUpProps {
  recipeId: string
  onApplyVariation?: (variation: RecipeVariation) => void
}

const RecipeFollowUp = ({ recipeId, onApplyVariation }: RecipeFollowUpProps) => {
  const [question, setQuestion] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAllFollowUps, setShowAllFollowUps] = useState(false)
  
  const { addFollowUpQuestion, getRecipeById, getRecipeVariations, fetchRecipes } = useRecipeStore()
  
  // Ensure recipes are loaded
  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])
  
  const recipe = getRecipeById(recipeId)
  const followUps = recipe?.followUps || []
  const variations = getRecipeVariations(recipeId)
  
  // Sort follow-ups with most recent first
  const sortedFollowUps = [...followUps].sort((a, b) => b.timestamp - a.timestamp)
  
  // Only show the most recent follow-up if showAllFollowUps is false
  const displayedFollowUps = showAllFollowUps 
    ? sortedFollowUps 
    : sortedFollowUps.slice(0, 1)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Check if recipe exists before submitting
      if (!recipe) {
        throw new Error("Recipe not found. Please refresh and try again.")
      }
      
      await addFollowUpQuestion(recipeId, question.trim())
      setQuestion("")
    } catch (err) {
      setError(typeof err === 'object' && err !== null && 'message' in err 
        ? String(err.message) 
        : "Failed to submit question. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Suggested follow-up questions
  const suggestedQuestions = [
    "How can I make this recipe vegan?",
    "Can I make this recipe ahead of time?",
    "What can I substitute for dairy in this recipe?",
    "How can I make this spicier?",
    "How should I store leftovers?",
    "What would pair well with this dish?"
  ]
  
  const handleSuggestedQuestion = (q: string) => {
    setQuestion(q)
  }
  
  // Find a variation associated with a follow-up
  const getVariationForFollowUp = (followUpId: string) => {
    return variations.find(v => v.followUpId === followUpId);
  }
  
  const handleRefreshRecipe = () => {
    setError(null)
    fetchRecipes()
  }
  
  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white flex items-center">
          <HelpCircle className="mr-1.5 h-4 w-4 text-blue-500" />
          Recipe Questions & Modifications
        </h3>
        {followUps.length > 1 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAllFollowUps(!showAllFollowUps)}
            className="h-8 px-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            {showAllFollowUps ? (
              <>
                <ArrowUp className="h-3.5 w-3.5 mr-1" />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <ArrowDown className="h-3.5 w-3.5 mr-1" />
                <span>Show All ({followUps.length})</span>
              </>
            )}
          </Button>
        )}
      </div>
      
      {/* Follow-up question form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <MessageCircle className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="text"
            placeholder="Ask about modifications, substitutions, or cooking tips..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="pl-9 pr-4 h-10 w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500 rounded-md"
            disabled={isSubmitting}
          />
        </div>
        <Button 
          type="submit"
          disabled={!question.trim() || isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 rounded-md transition-all"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>Ask</span>
              <ChefHat className="ml-1.5 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
      
      {/* Error message */}
      {error && (
        <div className="p-3 text-sm bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700 dark:text-red-300">{error}</p>
              {error.includes("Recipe not found") && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefreshRecipe}
                  className="mt-2 h-8 bg-white dark:bg-transparent text-red-600 border-red-300 hover:bg-red-50"
                >
                  Refresh Recipe Data
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Modification tips */}
      {followUps.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md p-3 mb-2">
          <div className="flex items-start">
            <ChefHat className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Ask questions to modify this recipe or get cooking tips. The AI can create variations like vegan alternatives, 
              spicier versions, doubled portions, or ingredient substitutions.
            </p>
          </div>
        </div>
      )}
      
      {/* Suggested questions */}
      {followUps.length === 0 && (
        <div className="mt-2 space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
              <HelpCircle className="h-4 w-4 mr-1.5 text-blue-500 dark:text-blue-400" />
              Ask questions about this recipe
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-400 mb-3">
              You can ask about modifications, ingredient substitutions, cooking techniques, or any other questions about this recipe.
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <Badge
                  key={i}
                  className="cursor-pointer bg-white dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 px-2.5 py-1 text-xs hover:shadow-sm transition-all"
                  onClick={() => handleSuggestedQuestion(q)}
                >
                  {q}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Display follow-up Q&A with variations */}
      {followUps.length > 0 && (
        <div className="space-y-4 mt-3">
          <div className="flex items-center mb-1">
            <div className="h-1 flex-grow bg-gray-100 dark:bg-gray-800 rounded-full"></div>
            <span className="px-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
              {followUps.length} {followUps.length === 1 ? 'Question' : 'Questions'}
            </span>
            <div className="h-1 flex-grow bg-gray-100 dark:bg-gray-800 rounded-full"></div>
          </div>
          {displayedFollowUps.map((followUp) => {
            const variation = getVariationForFollowUp(followUp.id);
            return (
              <div key={followUp.id} className="space-y-2 transition-all hover:translate-y-[-2px] duration-300">
                <FollowUpItem followUp={followUp} />
                
                {/* Show variation if available */}
                {variation && (
                  <div className="ml-8 mt-2">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                            <ChefHat className="h-3 w-3 text-green-600 dark:text-green-400" />
                          </div>
                          <h5 className="text-sm font-medium text-green-800 dark:text-green-300">{variation.name}</h5>
                        </div>
                        {onApplyVariation && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2.5 text-xs font-medium bg-white dark:bg-transparent text-green-600 dark:text-green-400 border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/40"
                            onClick={() => onApplyVariation(variation)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            <span>Apply Change</span>
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-xs text-green-700 dark:text-green-400 mb-2">
                        {variation.description}
                      </p>
                      
                      {/* Show changes summary */}
                      <div className="text-xs text-green-600 dark:text-green-500 mt-1.5 space-y-1">
                        <p className="font-medium">Changes include:</p>
                        {variation.modifiedIngredients.length !== recipe?.ingredients.length && (
                          <p>• Modified ingredients ({variation.modifiedIngredients.length})</p>
                        )}
                        {variation.modifiedInstructions.some((inst, i) => inst !== (recipe?.instructions[i] || '')) && (
                          <p>• Updated cooking instructions</p>
                        )}
                        {variation.modifiedNutritionalValue && variation.modifiedNutritionalValue.calories !== recipe?.nutritionalValue.calories && (
                          <p>• Adjusted nutritional values</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}

// Component for individual follow-up items
const FollowUpItem = ({ followUp }: { followUp: FollowUpQA }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Parse the answer to extract and format as point-form response
  const formatAnswer = (answer: string) => {
    // Always format responses in point form
    
    // First, clean and normalize the answer text
    const cleanedAnswer = answer.trim();
    
    // If the answer already has numbered points (1., 2., etc), bullet points (• or -), 
    // or natural line breaks, use those to split into points
    let points: string[] = [];
    
    // Check for numbered points pattern: "1. text" or "1) text"
    if (/\d+[\.\)]\s/.test(cleanedAnswer)) {
      points = cleanedAnswer.split(/\d+[\.\)]\s+/)
                           .filter(point => point.trim().length > 0);
    }
    // Check for bullet points
    else if (cleanedAnswer.includes('•') || cleanedAnswer.includes('-')) {
      points = cleanedAnswer.split(/[•\-]\s+/)
                           .filter(point => point.trim().length > 0);
    }
    // Check for natural paragraph breaks
    else if (cleanedAnswer.includes('\n')) {
      points = cleanedAnswer.split('\n')
                           .filter(point => point.trim().length > 0);
    }
    // If no structure is detected, try to break into reasonable points
    // For unstructured text, aim for 2-3 sentence chunks or split by common separators
    else {
      // Try to split by semicolons or periods followed by spaces
      const sentences = cleanedAnswer.split(/(?<=[.;])\s+/);
      
      // If we have multiple sentences, use those as points
      if (sentences.length > 1) {
        points = sentences.filter(point => point.trim().length > 0);
      } else {
        // If all else fails, just use the whole answer as a single point
        points = [cleanedAnswer];
      }
    }
    
    // Limit preview to 3 points when not expanded
    const displayPoints = isExpanded ? points : points.slice(0, Math.min(3, points.length));
    const hasMorePoints = points.length > 3;
    
    return (
      <>
        <div className="space-y-2">
          <ul className="list-disc pl-5 space-y-1.5">
            {displayPoints.map((point, idx) => (
              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                {point.trim().replace(/^[•\-]\s*/, '')}
              </li>
            ))}
          </ul>
          
          {!isExpanded && hasMorePoints && (
            <button 
              onClick={() => setIsExpanded(true)}
              className="text-xs text-blue-600 dark:text-blue-400 mt-2 hover:underline flex items-center"
            >
              <ChevronDown className="h-3 w-3 mr-1" />
              Show {points.length - 3} more options
            </button>
          )}
          
          {isExpanded && hasMorePoints && (
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-xs text-blue-600 dark:text-blue-400 mt-2 hover:underline flex items-center"
            >
              <ChevronUp className="h-3 w-3 mr-1" />
              Show less
            </button>
          )}
        </div>
      </>
    );
  };

  return (
    <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
      <div className="bg-gray-50 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <HelpCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{followUp.question}</h4>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(followUp.timestamp, { addSuffix: true })}
          </span>
        </div>
      </div>
      <div className="p-3 bg-white dark:bg-gray-900">
        <div className="flex gap-2">
          <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ChefHat className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            {formatAnswer(followUp.answer)}
            
            {/* Indicate if this follow-up has a modification */}
            {followUp.appliedModificationId && (
              <div className="mt-2 flex items-center">
                <Badge className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs border-0">
                  <Check className="h-3 w-3 mr-1" />
                  Recipe variation available
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default RecipeFollowUp 