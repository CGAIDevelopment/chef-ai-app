export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  image: string;
  nutritionalValue: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  servings: number;
  status: 'all' | 'favorites' | 'recent';
  followUps?: FollowUpQA[];
  variations?: RecipeVariation[];
  appliedVariationId?: string;
}

export interface MealPlan {
  id: string;
  name: string;
  days: MealPlanDay[];
}

export interface MealPlanDay {
  id: string;
  name: string;
  breakfast: string | null;
  lunch: string | null;
  dinner: string | null;
  snacks: string[];
}

export interface FollowUpQA {
  id: string;
  question: string;
  answer: string;
  timestamp: number;
  appliedModificationId?: string;
}

export interface RecipeVariation {
  id: string;
  name: string;
  description: string;
  originalRecipeId: string;
  modifiedIngredients: string[];
  modifiedInstructions: string[];
  modifiedNutritionalValue?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  createdAt: number;
  followUpId: string;
}

export type RecipeStatus = "all" | "private" | "to-try" | "meal-plan";

export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  createdAt: number;
  preferences: UserPreferences;
  avatar?: string;
}

export interface UserPreferences {
  dietaryRestrictions: DietaryRestriction[];
  allergies: string[];
  cookingSkillLevel: SkillLevel;
  kitchenEquipment: KitchenEquipment[];
  servingSizePreference: number;
  flavorPreferences: string[];
  cuisinePreferences: string[];
}

export type DietaryRestriction = 
  | "vegetarian" 
  | "vegan" 
  | "gluten-free" 
  | "dairy-free" 
  | "keto" 
  | "paleo" 
  | "low-carb" 
  | "low-fat" 
  | "pescatarian"
  | "none"
  | string;

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export interface KitchenEquipment {
  name: string;
  available: boolean;
}

export interface ShoppingListItem {
  id: string;
  ingredient: string;
  recipeId: string;
  recipeName: string;
  isChecked: boolean;
  addedAt: number;
}

export type MealTime = "breakfast" | "lunch" | "dinner" | "morning-snack" | "afternoon-snack" | "other";

export const MEAL_TIME_LABELS: Record<MealTime, string> = {
  "breakfast": "Breakfast",
  "lunch": "Lunch",
  "dinner": "Dinner",
  "morning-snack": "Morning Snack",
  "afternoon-snack": "Afternoon Snack",
  "other": "Other"
};

export const MEAL_TIME_ORDER: MealTime[] = [
  "breakfast",
  "morning-snack",
  "lunch",
  "afternoon-snack",
  "dinner",
  "other"
];

export const COMMON_EQUIPMENT = [
  "Oven",
  "Stovetop",
  "Microwave",
  "Blender",
  "Food processor",
  "Stand mixer",
  "Slow cooker",
  "Pressure cooker",
  "Air fryer",
  "Grill",
  "Sous vide",
  "Rice cooker",
  "Cast iron skillet",
  "Dutch oven",
  "Baking sheets",
  "Instant Pot"
];

export const CUISINE_TYPES = [
  "Italian",
  "Chinese",
  "Mexican",
  "Japanese",
  "Indian",
  "Thai",
  "French",
  "Mediterranean",
  "American",
  "Middle Eastern",
  "Korean",
  "Spanish",
  "Greek",
  "Vietnamese"
]; 