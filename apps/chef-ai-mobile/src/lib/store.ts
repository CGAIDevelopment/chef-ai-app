import { create } from 'zustand';
import { Recipe, RecipeStatus, ShoppingListItem, RecipeVariation } from './types';
import { v4 as uuidv4 } from 'uuid';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Key for storing recipes in AsyncStorage
const RECIPES_STORAGE_KEY = 'chef_ai_recipes';

// Sample data for development
const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Spaghetti Carbonara',
    ingredients: [
      '400g spaghetti',
      '200g pancetta or guanciale, diced',
      '4 large eggs',
      '50g pecorino cheese, grated',
      '50g parmesan, grated',
      'Freshly ground black pepper',
      'Salt'
    ],
    instructions: [
      'Bring a large pot of salted water to boil and cook the spaghetti until al dente.',
      'While the pasta is cooking, heat a large frying pan and cook the pancetta until crispy.',
      'In a bowl, whisk together the eggs, grated cheeses, and black pepper.',
      'Drain the pasta, reserving a cup of the pasta water.',
      'Working quickly, add the hot pasta to the pan with the pancetta, then remove from heat.',
      'Add the egg and cheese mixture, stirring constantly to create a creamy sauce. Add splash of pasta water if needed.',
      'Season with salt and additional black pepper to taste.',
      'Serve immediately, garnished with extra grated cheese.'
    ],
    image: 'https://example.com/carbonara.jpg',
    description: 'A classic Italian pasta dish from Rome made with eggs, hard cheese, cured pork, and black pepper.',
    nutritionalValue: {
      calories: 650,
      protein: 25,
      carbs: 65,
      fat: 30
    },
    servings: 4,
    status: 'all'
  },
  {
    id: '2',
    title: 'Vegetable Stir Fry',
    ingredients: [
      '2 tbsp vegetable oil',
      '1 onion, sliced',
      '2 garlic cloves, minced',
      '1 bell pepper, sliced',
      '1 carrot, julienned',
      '1 cup broccoli florets',
      '1 cup snow peas',
      '2 tbsp soy sauce',
      '1 tbsp rice vinegar',
      '1 tsp sesame oil',
      '1 tsp honey or maple syrup',
      'Fresh ginger, grated'
    ],
    instructions: [
      'Heat the vegetable oil in a wok or large frying pan over high heat.',
      'Add the onion and garlic, stir fry for 1 minute until fragrant.',
      'Add the bell pepper, carrot, and broccoli. Stir fry for 3-4 minutes.',
      'Add the snow peas and continue stir frying for 2 minutes.',
      'In a small bowl, mix the soy sauce, rice vinegar, sesame oil, honey, and grated ginger.',
      'Pour the sauce over the vegetables and stir to coat evenly.',
      'Cook for another 1-2 minutes until the vegetables are crisp-tender.',
      'Serve hot over rice or noodles.'
    ],
    image: 'https://example.com/stirfry.jpg',
    description: 'A quick and healthy vegetable stir fry with an Asian-inspired sauce.',
    nutritionalValue: {
      calories: 220,
      protein: 5,
      carbs: 25,
      fat: 12
    },
    servings: 4,
    status: 'all'
  }
];

interface RecipeStore {
  // Recipe State
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number | null;
  
  // Shopping List State
  shoppingList: ShoppingListItem[];
  
  // Recipe Actions
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  updateRecipeStatus: (id: string, status: RecipeStatus, mealPlanDate?: string, mealTime?: string) => void;
  fetchRecipes: () => Promise<void>;
  rateRecipe: (id: string, stars: number, comment: string) => void;
  addFollowUpQuestion: (recipeId: string, question: string) => Promise<void>;
  getRecipeById: (id: string) => Recipe | undefined;
  applyRecipeModification: (recipeId: string, followUpId: string, modification: RecipeVariation) => void;
  getRecipeVariations: (recipeId: string) => RecipeVariation[];
  
  // Shopping List Actions
  addToShoppingList: (recipeId: string, ingredients: string[]) => void;
  removeFromShoppingList: (itemId: string) => void;
  toggleShoppingListItem: (itemId: string) => void;
  clearShoppingList: () => void;
  clearCheckedItems: () => void;
}

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set, get) => ({
      // Recipe State
      recipes: mockRecipes,
      isLoading: false,
      error: null,
      lastFetchTime: null,
      
      // Shopping List State
      shoppingList: [],
      
      // Recipe Actions
      addRecipe: (recipe) => {
        // Add the recipe to the state
        set((state) => ({
          recipes: [...state.recipes, recipe]
        }));
        
        // Also update in AsyncStorage directly to ensure persistence
        try {
          const updatedRecipes = [...get().recipes, recipe];
          AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(updatedRecipes))
            .catch(error => console.error('Error saving new recipe to storage:', error));
          
          // Log success for debugging
          console.log('Recipe added and saved to AsyncStorage:', recipe.title);
        } catch (error) {
          console.error('Error in addRecipe when updating AsyncStorage:', error);
        }
      },
      
      updateRecipe: (updatedRecipe) => {
        set((state) => ({
          recipes: state.recipes.map((recipe) => 
            recipe.id === updatedRecipe.id ? updatedRecipe : recipe
          )
        }));
        
        // Also update in AsyncStorage directly for redundancy
        const recipes = get().recipes;
        AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes))
          .catch(error => console.error('Error saving updated recipe to storage:', error));
      },
      
      updateRecipeStatus: (id, status, mealPlanDate, mealTime) => {
        set((state) => ({
          recipes: state.recipes.map((recipe) => 
            recipe.id === id 
              ? { 
                  ...recipe, 
                  status, 
                  ...(mealPlanDate && { mealPlanDate }), 
                  ...(mealTime && { mealTime: mealTime as any })
                } 
              : recipe
          )
        }));
      },
      
      fetchRecipes: async () => {
        console.log('Fetching recipes from AsyncStorage...');
        set({ isLoading: true, error: null });
        
        try {
          // Use the correct storage key - make sure it matches what's used in addRecipe
          const storedRecipes = await AsyncStorage.getItem(RECIPES_STORAGE_KEY);
          console.log('Stored recipes retrieved from AsyncStorage:', storedRecipes ? 'Found' : 'Not found');
          
          if (storedRecipes) {
            try {
              const parsedRecipes = JSON.parse(storedRecipes);
              console.log(`Successfully parsed ${parsedRecipes.length} recipes`);
              
              // Check if recipes array is valid and has items
              if (Array.isArray(parsedRecipes) && parsedRecipes.length > 0) {
                set({ recipes: parsedRecipes, isLoading: false, lastFetchTime: Date.now() });
              } else {
                console.warn('Stored recipes array is empty or invalid, using sample recipes');
                createAndStoreSampleRecipes();
              }
            } catch (parseError) {
              console.error('Failed to parse stored recipes JSON:', parseError);
              createAndStoreSampleRecipes();
            }
          } else {
            console.log('No recipes found in storage, creating sample recipes');
            createAndStoreSampleRecipes();
          }
        } catch (error) {
          console.error('Error fetching recipes from AsyncStorage:', error);
          set({ 
            error: 'Failed to fetch recipes: ' + (error instanceof Error ? error.message : String(error)),
            isLoading: false 
          });
          
          // Fall back to sample recipes on error
          createAndStoreSampleRecipes();
        }
        
        // Helper function to create and store sample recipes
        async function createAndStoreSampleRecipes() {
          // Create sample recipes array
          const sampleRecipes: Recipe[] = [
            {
              id: '1',
              title: 'Spaghetti Carbonara',
              ingredients: [
                '400g spaghetti',
                '200g pancetta or guanciale, diced',
                '4 large eggs',
                '100g Pecorino Romano cheese, grated',
                '100g Parmesan cheese, grated',
                'Freshly ground black pepper',
                'Salt to taste'
              ],
              instructions: [
                'Bring a large pot of salted water to boil and cook the spaghetti until al dente.',
                'While the pasta is cooking, heat a large skillet over medium heat. Add the pancetta and cook until crispy, about 5-7 minutes.',
                'In a bowl, whisk together the eggs, grated cheeses, and a generous amount of freshly ground black pepper.',
                'Drain the pasta, reserving about 1/2 cup of pasta water.',
                'Working quickly, add the hot pasta to the skillet with the pancetta. Remove from heat.',
                'Pour the egg and cheese mixture over the pasta, stirring constantly to create a creamy sauce. Add pasta water as needed to achieve desired consistency.',
                'Serve immediately, topped with additional grated cheese and black pepper.'
              ],
              image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80',
              description: 'A classic Italian pasta dish from Rome made with eggs, cheese, pancetta, and black pepper.',
              nutritionalValue: {
                calories: 550,
                protein: 25,
                carbs: 65,
                fat: 22
              },
              servings: 4,
              status: 'all'
            },
            // Keep other sample recipes
          ];
          
          // Set sample recipes in store
          set({ 
            recipes: sampleRecipes, 
            isLoading: false,
            lastFetchTime: Date.now()
          });
          
          // Also save sample recipes to AsyncStorage
          try {
            await AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(sampleRecipes));
            console.log('Sample recipes saved to AsyncStorage');
          } catch (saveError) {
            console.error('Error saving sample recipes to AsyncStorage:', saveError);
          }
        }
      },
      
      rateRecipe: (id, stars, comment) => {
        set((state) => ({
          recipes: state.recipes.map((recipe) => 
            recipe.id === id 
              ? { ...recipe, rating: { stars, comment } } 
              : recipe
          )
        }));
      },
      
      addFollowUpQuestion: async (recipeId, question) => {
        const recipes = get().recipes;
        const recipe = recipes.find(r => r.id === recipeId);
        
        if (!recipe) return;
        
        const newFollowUp = {
          id: uuidv4(),
          question,
          answer: 'This is a simulated answer to your follow-up question.',
          timestamp: Date.now()
        };
        
        const followUps = recipe.followUps ? [...recipe.followUps, newFollowUp] : [newFollowUp];
        
        set((state) => ({
          recipes: state.recipes.map((r) => 
            r.id === recipeId 
              ? { ...r, followUps } 
              : r
          )
        }));
      },
      
      getRecipeById: (id) => {
        return get().recipes.find(recipe => recipe.id === id);
      },
      
      applyRecipeModification: (recipeId, followUpId, modification) => {
        set((state) => ({
          recipes: state.recipes.map((recipe) => 
            recipe.id === recipeId 
              ? { 
                  ...recipe, 
                  appliedVariationId: modification.id,
                  variations: recipe.variations 
                    ? [...recipe.variations, modification]
                    : [modification],
                  followUps: recipe.followUps?.map(fu => 
                    fu.id === followUpId 
                      ? { ...fu, appliedModificationId: modification.id }
                      : fu
                  )
                } 
              : recipe
          )
        }));
      },
      
      getRecipeVariations: (recipeId) => {
        const recipe = get().recipes.find(r => r.id === recipeId);
        return recipe?.variations || [];
      },
      
      // Shopping List Actions
      addToShoppingList: (recipeId, ingredients) => {
        const recipe = get().recipes.find(r => r.id === recipeId);
        if (!recipe) return;
        
        const newItems = ingredients.map(ingredient => ({
          id: uuidv4(),
          ingredient,
          recipeId,
          recipeName: recipe.title,
          isChecked: false,
          addedAt: Date.now()
        }));
        
        set((state) => ({
          shoppingList: [...state.shoppingList, ...newItems]
        }));
      },
      
      removeFromShoppingList: (itemId) => {
        set((state) => ({
          shoppingList: state.shoppingList.filter(item => item.id !== itemId)
        }));
      },
      
      toggleShoppingListItem: (itemId) => {
        set((state) => ({
          shoppingList: state.shoppingList.map(item => 
            item.id === itemId 
              ? { ...item, isChecked: !item.isChecked } 
              : item
          )
        }));
      },
      
      clearShoppingList: () => {
        set({ shoppingList: [] });
      },
      
      clearCheckedItems: () => {
        set((state) => ({
          shoppingList: state.shoppingList.filter(item => !item.isChecked)
        }));
      }
    }),
    {
      name: 'chef-ai-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper hook to get recipes by status
export const useRecipesByStatus = (status: RecipeStatus = 'all') => {
  return useRecipeStore(state => ({
    recipes: state.recipes.filter(recipe => 
      status === 'all' ? true : recipe.status === status
    ),
    isLoading: state.isLoading
  }));
}; 