import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Upload } from "lucide-react"
import Image from "next/image"

interface Ingredient {
  id: string
  name: string
  details: string
  image: string | null
}

interface IngredientInputProps {
  onGenerateRecipes: (ingredients: Ingredient[]) => void
}

const IngredientInput: React.FC<IngredientInputProps> = ({ onGenerateRecipes }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ id: "1", name: "", details: "", image: null }])

  const addIngredient = () => {
    setIngredients([...ingredients, { id: Date.now().toString(), name: "", details: "", image: null }])
  }

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id))
  }

  const updateIngredient = (id: string, field: keyof Ingredient, value: string) => {
    setIngredients(ingredients.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing)))
  }

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateIngredient(id, "image", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    onGenerateRecipes(ingredients)
  }

  return (
    <div className="space-y-4">
      {ingredients.map((ingredient, index) => (
        <div key={ingredient.id} className="p-4 border rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Ingredient {index + 1}</h3>
            {ingredients.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => removeIngredient(ingredient.id)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`name-${ingredient.id}`}>Name</Label>
            <Input
              id={`name-${ingredient.id}`}
              value={ingredient.name}
              onChange={(e) => updateIngredient(ingredient.id, "name", e.target.value)}
              placeholder="Enter ingredient name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`details-${ingredient.id}`}>Details</Label>
            <Textarea
              id={`details-${ingredient.id}`}
              value={ingredient.details}
              onChange={(e) => updateIngredient(ingredient.id, "details", e.target.value)}
              placeholder="Enter any additional details (e.g., quantity, freshness)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`image-${ingredient.id}`}>Image</Label>
            <div className="flex items-center space-x-2">
              <Input
                id={`image-${ingredient.id}`}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(ingredient.id, e)}
                className="hidden"
              />
              <Button variant="outline" onClick={() => document.getElementById(`image-${ingredient.id}`)?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              {ingredient.image && (
                <div className="relative h-20 w-20">
                  <Image
                    src={ingredient.image || "/placeholder.svg"}
                    alt={ingredient.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      <Button onClick={addIngredient} variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Add Ingredient
      </Button>
      <Button onClick={handleSubmit} className="w-full">
        Generate Recipes
      </Button>
    </div>
  )
}

export default IngredientInput

