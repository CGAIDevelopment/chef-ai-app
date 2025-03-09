import { NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import type { Recipe } from "@/lib/types"

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
  }

  try {
    const { recipes, userPreferences } = await req.json()
    
    if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
      return NextResponse.json({ error: "No recipes provided" }, { status: 400 })
    }
    
    if (!userPreferences) {
      return NextResponse.json({ error: "User preferences are required" }, { status: 400 })
    }
    
    console.log("Analyzing recipes for user with preferences:", {
      dietaryRestrictions: userPreferences.dietaryRestrictions,
      allergies: userPreferences.allergies?.length || 0,
      cookingSkillLevel: userPreferences.cookingSkillLevel,
      equipment: userPreferences.kitchenEquipment?.length || 0,
      cuisinePreferences: userPreferences.cuisinePreferences?.length || 0
    })
    
    // Format user preferences for the prompt
    const dietaryRestrictions = userPreferences.dietaryRestrictions?.length > 0 && 
      !userPreferences.dietaryRestrictions.includes("none")
      ? userPreferences.dietaryRestrictions.join(", ") 
      : "No specific dietary restrictions";
    
    const allergies = userPreferences.allergies?.length > 0 
      ? userPreferences.allergies.join(", ") 
      : "No allergies";
    
    const availableEquipment = userPreferences.kitchenEquipment
      ?.filter((e: { name: string; available: boolean }) => e.available)
      .map((e: { name: string; available: boolean }) => e.name)
      .join(", ") || "Basic kitchen equipment";
    
    const cuisinePreferences = userPreferences.cuisinePreferences?.length > 0 
      ? userPreferences.cuisinePreferences.join(", ") 
      : "No specific cuisine preferences";
    
    const flavorPreferences = userPreferences.flavorPreferences?.length > 0 
      ? userPreferences.flavorPreferences.join(", ") 
      : "No specific flavor preferences";
    
    // Format recipes for the prompt
    const recipesList = recipes.map((recipe: Recipe, index: number) => {
      return `Recipe ${index + 1}: ${recipe.title}
Ingredients: ${recipe.ingredients.join(", ")}
Description: ${recipe.description || "No description"}
Cooking Complexity: ${getCookingComplexity(recipe)}
Equipment Needs: ${getRequiredEquipment(recipe.instructions.join(' '))}
Cuisine Type: ${detectCuisineType(recipe)}
`;
    }).join("\n");
    
    const userPrompt = `As an AI cooking assistant, I need to recommend recipes from the following list that match this user's preferences:

USER PREFERENCES:
- Dietary Restrictions: ${dietaryRestrictions}
- Allergies: ${allergies}
- Cooking Skill Level: ${userPreferences.cookingSkillLevel}
- Available Equipment: ${availableEquipment}
- Cuisine Preferences: ${cuisinePreferences}
- Flavor Preferences: ${flavorPreferences}
- Serving Size Preference: ${userPreferences.servingSizePreference} people

AVAILABLE RECIPES:
${recipesList}

Based on the user's preferences, provide me with:
1. The top 3 most suitable recipes from the list (by number)
2. A brief explanation for each recommendation
3. Any modifications that would make these recipes better match the user's preferences

Please format your response as JSON with the following structure:
{
  "recommendations": [
    {
      "recipeIndex": number,
      "suitabilityScore": number (1-10),
      "explanation": "string",
      "suggestedModifications": "string"
    }
  ]
}`;

    console.log("Sending prompt to AI model for personalized recipe recommendations");

    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "system",
          content: "You are a helpful AI chef assistant that analyzes recipes and user preferences to make personalized recommendations. You always respond in the requested JSON format."
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      maxTokens: 1200,
    });

    if (!text) {
      return NextResponse.json({ error: "No recommendations generated" }, { status: 500 })
    }

    console.log("Generated recommendations successfully");

    // Parse the JSON response
    let recommendationsData;
    try {
      // Handle cases where the response might include markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
      const jsonText = jsonMatch[1] ? jsonMatch[1].trim() : text.trim();
      recommendationsData = JSON.parse(jsonText);
    } catch (error) {
      console.error("Failed to parse recommendations:", error);
      return NextResponse.json(
        { error: "Failed to parse recommendations", rawResponse: text },
        { status: 500 }
      )
    }

    // Map the recipe indices to actual recipe IDs
    const recommendationsWithRecipeIds = recommendationsData.recommendations.map(
      (rec: { recipeIndex: number, suitabilityScore: number, explanation: string, suggestedModifications: string }) => ({
        ...rec,
        recipeId: recipes[rec.recipeIndex - 1]?.id,
        recipeTitle: recipes[rec.recipeIndex - 1]?.title,
      })
    );

    return NextResponse.json({
      recommendations: recommendationsWithRecipeIds
    })

  } catch (error) {
    console.error("Error in recipe-suggestions:", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// Helper function to estimate cooking complexity based on recipe data
function getCookingComplexity(recipe: Recipe): string {
  const instructionText = recipe.instructions.join(' ');
  const ingredientCount = recipe.ingredients.length;
  
  // Complex cooking techniques that indicate higher difficulty
  const complexTechniques = [
    'sous vide', 'braise', 'deglaze', 'emulsify', 'reduce', 'temper', 
    'flambe', 'broil', 'marinate', 'proof', 'render', 'sear', 
    'blanch', 'caramelize', 'fold', 'whip', 'knead'
  ];
  
  // Check for complex techniques
  const hasTechniques = complexTechniques.some(technique => 
    instructionText.toLowerCase().includes(technique)
  );
  
  // Time-intensive steps
  const hasLongPrep = instructionText.toLowerCase().includes('hour') || 
                      instructionText.toLowerCase().includes('overnight');
  
  // Determine complexity
  if (ingredientCount > 12 || hasTechniques && hasLongPrep) {
    return "Advanced";
  } else if (ingredientCount > 8 || hasTechniques) {
    return "Intermediate";
  } else {
    return "Beginner";
  }
}

// Helper function to extract required equipment from recipe instructions
function getRequiredEquipment(instructionText: string): string {
  const commonEquipment = [
    'oven', 'stovetop', 'microwave', 'blender', 'food processor', 
    'stand mixer', 'slow cooker', 'pressure cooker', 'air fryer', 
    'grill', 'sous vide', 'rice cooker', 'cast iron', 'dutch oven', 
    'baking sheet', 'instant pot', 'skillet', 'knife', 'cutting board',
    'pan', 'pot', 'bowl', 'whisk'
  ];
  
  const foundEquipment = commonEquipment.filter(equipment => 
    instructionText.toLowerCase().includes(equipment)
  );
  
  return foundEquipment.length > 0 ? foundEquipment.join(', ') : 'Basic kitchen tools';
}

// Helper function to detect cuisine type from recipe
function detectCuisineType(recipe: Recipe): string {
  const text = `${recipe.title} ${recipe.description || ''} ${recipe.ingredients.join(' ')}`.toLowerCase();
  
  const cuisineSignatures: Record<string, string[]> = {
    'Italian': ['pasta', 'pizza', 'risotto', 'parmesan', 'mozzarella', 'basil', 'tomato sauce'],
    'Mexican': ['taco', 'tortilla', 'salsa', 'guacamole', 'cilantro', 'jalapeño', 'chipotle'],
    'Chinese': ['soy sauce', 'ginger', 'wok', 'tofu', 'stir fry', 'rice wine', 'sesame oil'],
    'Indian': ['curry', 'masala', 'garam', 'turmeric', 'cumin', 'coriander', 'naan'],
    'Japanese': ['sushi', 'miso', 'teriyaki', 'wasabi', 'seaweed', 'dashi', 'matcha'],
    'Thai': ['coconut milk', 'fish sauce', 'lemongrass', 'thai basil', 'galangal', 'pad thai'],
    'French': ['baguette', 'croissant', 'roux', 'coq au vin', 'boeuf', 'confit', 'deglaze'],
    'Mediterranean': ['olive oil', 'feta', 'hummus', 'tahini', 'pita', 'tzatziki', 'greek'],
  };
  
  for (const [cuisine, signatures] of Object.entries(cuisineSignatures)) {
    if (signatures.some(term => text.includes(term))) {
      return cuisine;
    }
  }
  
  return 'International';
} 