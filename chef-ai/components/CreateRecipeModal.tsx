"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Loader2, Share, Upload, X, Camera, Info, SparklesIcon } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useUser } from "@/lib/userStore"
import { toast } from "sonner"

interface CreateRecipeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { 
    name: string; 
    description: string; 
    images: string[];
    userPreferences?: any; 
  }) => void
  isLoading?: boolean
}

export function CreateRecipeModal({ isOpen, onClose, onSubmit, isLoading }: CreateRecipeModalProps) {
  const [recipeName, setRecipeName] = useState("")
  const [description, setDescription] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const { user } = useUser()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return
      if (file.size > 5 * 1024 * 1024) return // 5MB limit

      const reader = new FileReader()
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async () => {
    if (!recipeName.trim()) {
      toast.error("Please enter a name for your recipe")
      return
    }
    
    if (images.length === 0) {
      toast.error("Please upload at least one image of your ingredients")
      return
    }
    
    // Get user preferences if user is authenticated
    const userPreferences = user?.preferences || null;
    
    onSubmit({
      name: recipeName.trim(),
      description: description.trim(),
      images,
      userPreferences
    })
    
    onClose()
  }

  const handleClose = () => {
    setRecipeName("")
    setDescription("")
    setImages([])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <DialogHeader className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <SparklesIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">Generate New Recipe</DialogTitle>
          </div>
          <DialogDescription className="text-gray-700 dark:text-gray-300 mt-2">
            Create a custom AI-generated recipe based on your preferences and ingredients
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 space-y-5 max-h-[calc(85vh-80px)] overflow-y-auto">
          <div className="space-y-2">
            <label htmlFor="recipe-name" className="block text-sm font-medium text-gray-800 dark:text-gray-200">
              Recipe Name or Prompt
            </label>
            <Input
              id="recipe-name"
              placeholder="Enter a recipe name or prompt, e.g. 'Vegan chocolate cake' or 'Quick dinner with chicken and rice'"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-700 dark:text-gray-400 mt-1">
              Pro tip: Include ingredients using phrases like "with spinach" or "using chicken"
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-800 dark:text-gray-200">
              Additional Details (Optional)
            </label>
            <Textarea
              id="description"
              placeholder="Add more details like dietary preferences, ingredients to include/exclude, cooking method, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[100px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-700 dark:text-gray-400 mt-1">
              Example: "Using fresh tomatoes and basil. Should be gluten-free and take less than 30 minutes to prepare."
            </p>
          </div>
          
          {/* Ingredient Highlighting */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">AI-Powered Recipe Creation</h4>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  Our system uses OpenAI's GPT-4o-mini model to analyze your images and generate custom recipes. 
                  The AI can identify ingredients in your photos and create tailored recipes based on your prompt.
                  For best results, upload clear photos of your ingredients.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                Add Ingredient Photos
              </p>
              <Badge variant="outline" className="text-xs font-normal text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                Recommended
              </Badge>
            </div>
            <div 
              className={cn(
                "border-2 border-dashed rounded-lg p-4 transition-colors text-center",
                isDragging 
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                  : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center py-4 text-gray-700 dark:text-gray-300">
                <Upload className="h-10 w-10 text-gray-500 dark:text-gray-400 mb-2" />
                <p className="mb-1 font-medium text-gray-800 dark:text-gray-200">Drag photos here or click to upload</p>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  Upload photos of ingredients or similar recipes for better results
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={isLoading}
                />
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className="mt-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-600"
                  disabled={isLoading}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Select Photos
                </Button>
              </div>
            </div>
          </div>
          
          {/* Info box with tips */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-1 flex">
            <Camera className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <p className="font-medium">For best recipes from your ingredients:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-xs">
                <li>Upload photos of ingredients you want to use</li>
                <li>Take clear, well-lit photos of individual ingredients</li>
                <li>Include all main ingredients you want in your recipe</li>
                <li>Photos + text descriptions give the best results</li>
              </ul>
            </div>
          </div>
          
          {/* Preview of uploaded images */}
          {images.length > 0 && (
            <div className="mt-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                {images.length} {images.length === 1 ? 'image' : 'images'} uploaded
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden shadow-sm group">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Ingredient ${index + 1}`}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform group-hover:scale-105"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-1 top-1 h-7 w-7 bg-white/90 dark:bg-gray-800/90 hover:bg-white hover:dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500 rounded-full shadow-sm transition-all"
                      onClick={() => setImages(images.filter((_, i) => i !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-row-reverse gap-2">
          <Button
            type="button"
            disabled={isLoading}
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="mr-2 h-4 w-4" />
                Generate Recipe
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

