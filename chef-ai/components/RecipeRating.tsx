"use client"

import type React from "react"
import { useState } from "react"
import { Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useRecipeStore } from "@/lib/store"

interface RecipeRatingProps {
  recipeId: string
  initialRating?: { stars: number; comment: string }
}

const RecipeRating: React.FC<RecipeRatingProps> = ({ recipeId, initialRating }) => {
  const [rating, setRating] = useState(initialRating?.stars || 0)
  const [comment, setComment] = useState(initialRating?.comment || "")
  const rateRecipe = useRecipeStore((state) => state.rateRecipe)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating)
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    rateRecipe(recipeId, rating, comment)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none"
          >
            {star <= rating ? (
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            ) : (
              <Star className="h-6 w-6 text-gray-300" />
            )}
          </button>
        ))}
      </div>
      <Textarea
        placeholder="Add your comments about this recipe"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="h-24 text-black bg-white border-gray-300 text-base"
      />
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="text-white bg-blue-600 hover:bg-blue-700"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Rating'
        )}
      </Button>
    </div>
  )
}

export default RecipeRating

