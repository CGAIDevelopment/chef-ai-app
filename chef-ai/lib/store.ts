import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Recipe, RecipeStatus, FollowUpQA, RecipeVariation, ShoppingListItem, MealTime } from "./types"
import { generateSampleRecipes } from "./mock-data"
import * as React from "react"

interface RecipeStore {
  recipes: Recipe[]
  isLoading: boolean
  error: string | null
  lastFetchTime: number | null
  
  // Shopping List State
  shoppingList: ShoppingListItem[]
  
  // Recipe Actions
  addRecipe: (recipe: Recipe) => void
  updateRecipeStatus: (id: string, status: RecipeStatus, mealPlanDate?: string, mealTime?: MealTime) => void
  fetchRecipes: () => Promise<void>
  rateRecipe: (id: string, stars: number, comment: string) => void
  addFollowUpQuestion: (recipeId: string, question: string) => Promise<void>
  getRecipeById: (id: string) => Recipe | undefined
  applyRecipeModification: (recipeId: string, followUpId: string, modification: RecipeVariation) => void
  getRecipeVariations: (recipeId: string) => RecipeVariation[]
  
  // Shopping List Actions
  addToShoppingList: (recipeId: string, ingredients: string[]) => void
  removeFromShoppingList: (itemId: string) => void
  toggleShoppingListItem: (itemId: string) => void
  clearShoppingList: () => void
  clearCheckedItems: () => void
}

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set, get) => ({
      recipes: [],
      isLoading: false,
      error: null,
      lastFetchTime: null,
      
      // Initialize empty shopping list
      shoppingList: [],
      
      // Shopping List Actions
      addToShoppingList: (recipeId, ingredients) => set((state) => {
        const recipe = get().getRecipeById(recipeId);
        if (!recipe) return state;
        
        const newItems = ingredients.map(ingredient => ({
          id: `shopping-item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          ingredient,
          recipeId,
          recipeName: recipe.title,
          isChecked: false,
          addedAt: Date.now()
        }));
        
        return {
          shoppingList: [...state.shoppingList, ...newItems]
        };
      }),
      
      removeFromShoppingList: (itemId) => set((state) => ({
        shoppingList: state.shoppingList.filter(item => item.id !== itemId)
      })),
      
      toggleShoppingListItem: (itemId) => set((state) => ({
        shoppingList: state.shoppingList.map(item => 
          item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
        )
      })),
      
      clearShoppingList: () => set({ shoppingList: [] }),
      
      clearCheckedItems: () => set((state) => ({
        shoppingList: state.shoppingList.filter(item => !item.isChecked)
      })),
      
      // Existing methods
      addRecipe: (recipe) =>
        set((state) => {
          // Ensure the recipe has the 'all' status if not otherwise specified
          const newRecipe = { 
            ...recipe, 
            status: recipe.status || "all",
            id: recipe.id || `recipe-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          };
          
          console.log("Adding recipe:", newRecipe);
          return {
            recipes: [...state.recipes, newRecipe],
          };
        }),
      updateRecipeStatus: (id, status, mealPlanDate, mealTime) =>
        set((state) => {
          const updatedRecipes = state.recipes.map((recipe) =>
            recipe.id === id ? { ...recipe, status, mealPlanDate, mealTime } : recipe,
          )
          console.log("Updated recipes:", updatedRecipes) // Debug log
          return { recipes: updatedRecipes }
        }),
      fetchRecipes: async () => {
        // Get the current time
        const now = Date.now();
        // Get the last fetch time
        const lastFetch = get().lastFetchTime;
        
        // If we fetched recently (within 1 second), don't fetch again
        if (lastFetch && now - lastFetch < 1000) {
          return;
        }
        
        set({ isLoading: true, error: null, lastFetchTime: now })
        try {
          // This function doesn't actually fetch from an API, it just restores data from localStorage
          // Ensure we have at least one recipe in case local storage is empty
          const { recipes } = get();
          if (recipes.length === 0) {
            // Add sample recipes if none exist
            const sampleRecipes = generateSampleRecipes();
            set({ recipes: sampleRecipes });
          }
          
          set({ isLoading: false })
        } catch (error) {
          console.error("Error fetching recipes:", error);
          set({ error: "Failed to fetch recipes", isLoading: false })
        }
      },
      rateRecipe: (id, stars, comment) =>
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === id ? { ...recipe, rating: { stars, comment } } : recipe,
          ),
        })),
      // Get a recipe by its ID
      getRecipeById: (id) => {
        return get().recipes.find(recipe => recipe.id === id);
      },
      // Get variations for a specific recipe
      getRecipeVariations: (recipeId) => {
        const recipe = get().getRecipeById(recipeId);
        return recipe?.variations || [];
      },
      // Apply a recipe modification based on a follow-up question
      applyRecipeModification: (recipeId, followUpId, modification) => {
        set((state) => {
          // Update the recipes to include the new variation and link it to the follow-up
          const updatedRecipes = state.recipes.map(recipe => {
            if (recipe.id === recipeId) {
              // Add the variation to the recipe
              const variations = recipe.variations ? [...recipe.variations, modification] : [modification];
              
              // Update the follow-up to reference the applied modification
              const updatedFollowUps = recipe.followUps?.map(followUp =>
                followUp.id === followUpId
                  ? { ...followUp, appliedModificationId: modification.id }
                  : followUp
              ) || [];
              
              return { ...recipe, variations, followUps: updatedFollowUps };
            }
            return recipe;
          });
          
          return { recipes: updatedRecipes };
        });
      },
      // Add a follow-up question and answer
      addFollowUpQuestion: async (recipeId, question) => {
        set({ isLoading: true, error: null })
        try {
          // Get the recipe to provide a contextual answer
          const recipe = get().getRecipeById(recipeId);
          
          if (!recipe) {
            set({ 
              isLoading: false, 
              error: "Recipe not found. Please refresh and try again."
            });
            throw new Error("Recipe not found");
          }
          
          // Prepare the context with the recipe details for more accurate responses
          const recipeContext = {
            title: recipe.title,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            nutritionalValue: recipe.nutritionalValue,
            servings: recipe.servings
          };
          
          // Call the AI API endpoint to generate a response
          const response = await fetch('/api/recipe-questions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recipeId,
              question,
              recipeContext
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get AI response');
          }
          
          const data = await response.json();
          const { answer, shouldCreateVariation } = data;
          
          const followUpId = `followup-${Date.now()}`;
          
          // Create a new follow-up with the AI-generated answer
          const newFollowUp: FollowUpQA = {
            id: followUpId,
            question,
            answer,
            timestamp: Date.now()
          };
          
          set((state) => ({
            recipes: state.recipes.map((r) =>
              r.id === recipeId ? { 
                ...r, 
                followUps: r.followUps ? [...r.followUps, newFollowUp] : [newFollowUp] 
              } : r
            ),
            isLoading: false
          }));
          
          // If the AI suggests creating a variation, handle it
          // Note: In a real implementation, the AI would provide the variation details
          // For now, we'll keep the original variation creation logic for specific cases
          if (shouldCreateVariation) {
            let variationData = null;
            
            // Check if question is asking for specific modifications we can handle
            if (question.toLowerCase().includes('substitute') || question.toLowerCase().includes('replace')) {
              // Get a random ingredient to substitute
              const randomIngredient = recipe.ingredients[Math.floor(Math.random() * recipe.ingredients.length)];
              const ingredientName = randomIngredient.split(' ').slice(-1)[0];
              
              // Create a modified version of the recipe with the substitution
              const modifiedIngredients = recipe.ingredients.map(ingredient => {
                if (ingredient.includes(ingredientName)) {
                  return ingredient.replace(ingredientName, "almond milk");
                }
                return ingredient;
              });
              
              variationData = {
                id: `variation-${Date.now()}`,
                name: `${recipe.title} with Almond Milk`,
                description: `A version of ${recipe.title} with ${ingredientName} replaced by almond milk`,
                originalRecipeId: recipe.id,
                modifiedIngredients,
                modifiedInstructions: recipe.instructions,
                modifiedNutritionalValue: {
                  ...recipe.nutritionalValue,
                  calories: Math.max(recipe.nutritionalValue.calories - 20, 0)
                },
                createdAt: Date.now(),
                followUpId
              };
            } else if (question.toLowerCase().includes('vegan') || question.toLowerCase().includes('vegetarian')) {
              // Use existing vegan modification logic
              // Replace animal products with vegan alternatives
              const animalProducts = ['milk', 'cream', 'butter', 'cheese', 'egg', 'chicken', 'beef', 'pork', 'fish'];
              const veganReplacements = ['non-dairy milk', 'coconut cream', 'vegan butter', 'vegan cheese', 'flax egg (1 tbsp ground flaxseed + 3 tbsp water)', 'tofu', 'plant-based protein', 'tempeh', 'jackfruit'];
              
              const modifiedIngredients = recipe.ingredients.map(ingredient => {
                let modified = ingredient;
                animalProducts.forEach((animal, index) => {
                  if (ingredient.toLowerCase().includes(animal)) {
                    modified = ingredient.replace(new RegExp(animal, 'i'), veganReplacements[index]);
                  }
                });
                return modified;
              });
              
              // Update cooking instructions if needed
              const modifiedInstructions = recipe.instructions.map(instruction => {
                let modified = instruction;
                animalProducts.forEach((animal, index) => {
                  if (instruction.toLowerCase().includes(animal)) {
                    modified = instruction.replace(new RegExp(animal, 'i'), veganReplacements[index]);
                  }
                });
                return modified;
              });
              
              variationData = {
                id: `variation-${Date.now()}`,
                name: `Vegan ${recipe.title}`,
                description: `A fully vegan version of ${recipe.title}`,
                originalRecipeId: recipe.id,
                modifiedIngredients,
                modifiedInstructions,
                modifiedNutritionalValue: {
                  ...recipe.nutritionalValue,
                  calories: Math.max(recipe.nutritionalValue.calories - 30, 0),
                  protein: Math.max(recipe.nutritionalValue.protein - 5, 0),
                  fat: Math.max(recipe.nutritionalValue.fat - 3, 0)
                },
                createdAt: Date.now(),
                followUpId
              };
            } else if (question.toLowerCase().includes('spic') || question.toLowerCase().includes('heat')) {
              // Use existing spicy modification logic
              const spiceAdditions = [
                "red pepper flakes",
                "fresh jalapeño, finely chopped",
                "cayenne pepper"
              ];
              
              // Add spicy ingredients
              const modifiedIngredients = [
                ...recipe.ingredients,
                "1 tsp red pepper flakes",
                "1 fresh jalapeño, finely chopped",
                "1/2 tsp cayenne pepper"
              ];
              
              // Update cooking instructions
              const modifiedInstructions = recipe.instructions.map((instruction, index) => {
                // Add spice early in the cooking process
                if (index === 1 || index === 2) {
                  return instruction + " Add red pepper flakes, jalapeño, and cayenne pepper for heat.";
                }
                return instruction;
              });
              
              variationData = {
                id: `variation-${Date.now()}`,
                name: `Spicy ${recipe.title}`,
                description: `A spicier version of ${recipe.title} with added heat`,
                originalRecipeId: recipe.id,
                modifiedIngredients,
                modifiedInstructions,
                modifiedNutritionalValue: recipe.nutritionalValue, // Spice doesn't significantly change nutritional value
                createdAt: Date.now(),
                followUpId
              };
            } else if (question.toLowerCase().includes('double') || question.toLowerCase().includes('scale')) {
              // Use existing doubling modification logic
              // Double all ingredient quantities
              const modifiedIngredients = recipe.ingredients.map(ingredient => {
                // Extract number from ingredient if possible
                const matches = ingredient.match(/^([\d\/\.\s]+)/);
                if (matches && matches[1]) {
                  try {
                    const quantity = matches[1].trim();
                    // Handle fractions
                    if (quantity.includes('/')) {
                      const [numerator, denominator] = quantity.split('/').map(n => parseInt(n.trim()));
                      const decimal = numerator / denominator;
                      const doubled = (decimal * 2).toString();
                      return ingredient.replace(matches[1], doubled + " ");
                    } 
                    // Handle regular numbers
                    else {
                      const number = parseFloat(quantity);
                      const doubled = (number * 2).toString();
                      return ingredient.replace(matches[1], doubled + " ");
                    }
                  } catch (e) {
                    // If parsing fails, just return original
                    return ingredient;
                  }
                }
                return ingredient;
              });
              
              // Update cooking instructions for doubled recipe
              const modifiedInstructions = recipe.instructions.map(instruction => {
                // Adjust cooking times if mentioned
                let modified = instruction;
                const timeMatches = instruction.match(/(\d+)(-\d+)?\s+(minutes|mins|min|seconds|secs|sec|hours|hour|hr)/i);
                if (timeMatches && timeMatches[1]) {
                  const originalTime = parseInt(timeMatches[1]);
                  // Only increase time by about 25-50% for doubled recipes (not a full double)
                  const newTime = Math.round(originalTime * 1.3);
                  modified = instruction.replace(timeMatches[0], `${newTime} ${timeMatches[3]}`);
                }
                return modified;
              });
              
              variationData = {
                id: `variation-${Date.now()}`,
                name: `Double Batch ${recipe.title}`,
                description: `A doubled version of ${recipe.title} to serve ${recipe.servings * 2} people`,
                originalRecipeId: recipe.id,
                modifiedIngredients,
                modifiedInstructions,
                modifiedNutritionalValue: recipe.nutritionalValue, // Per serving stays the same
                createdAt: Date.now(),
                followUpId
              };
            }
            
            // If we have variation data, apply the modification
            if (variationData) {
              get().applyRecipeModification(recipeId, followUpId, variationData);
            }
          }
        } catch (error) {
          console.error('Error adding follow-up question:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
          });
        }
      },
    }),
    {
      name: "recipe-storage",
    },
  ),
)

export const useRecipesByStatus = (status: RecipeStatus) => {
  const store = useRecipeStore()
  
  // Ensure recipes are loaded
  React.useEffect(() => {
    if (store.recipes.length === 0) {
      store.fetchRecipes();
    }
  }, [store]);
  
  const filteredRecipes = Array.isArray(store.recipes)
    ? store.recipes.filter((recipe) => {
        if (status === "all") {
          // Return all recipes regardless of status when "all" is selected
          return true;
        }
        return recipe.status === status
      })
    : []
    
  return {
    recipes: filteredRecipes,
    isLoading: store.isLoading,
    error: store.error,
    fetchRecipes: store.fetchRecipes,
  }
}

