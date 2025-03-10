import { v4 as uuidv4 } from 'uuid';
import { Recipe, FollowUpQA, RecipeVariation } from './types';

/**
 * Ask a follow-up question about a recipe
 * @param recipeId The ID of the recipe to ask about
 * @param question The question to ask
 * @returns A promise resolving to the created FollowUpQA object
 */
export const askFollowUpQuestion = async (
  recipeId: string,
  question: string
): Promise<FollowUpQA> => {
  // In a real app, this would make an API call to OpenAI
  // For now, we'll mock the response based on the question

  // Wait to simulate network request
  await new Promise(resolve => setTimeout(resolve, 2000));

  let answer = '';
  let variation: RecipeVariation | null = null;

  // Check if the question is about ingredient substitution
  const substitutionKeywords = [
    'substitute', 'replace', 'instead of', 'alternative',
    'swap', 'change', 'different', 'without'
  ];

  const isSubstitutionQuestion = substitutionKeywords.some(keyword => 
    question.toLowerCase().includes(keyword)
  );

  if (isSubstitutionQuestion) {
    // Try to identify the ingredient to substitute
    const ingredients = [
      'flour', 'sugar', 'butter', 'eggs', 'milk', 'cheese',
      'chicken', 'beef', 'pork', 'onion', 'garlic', 'tomato',
      'rice', 'pasta', 'potato', 'carrot', 'broccoli', 'spinach'
    ];

    let targetIngredient = '';
    for (const ingredient of ingredients) {
      if (question.toLowerCase().includes(ingredient)) {
        targetIngredient = ingredient;
        break;
      }
    }

    if (targetIngredient) {
      const substitutions: Record<string, string[]> = {
        'flour': ['almond flour', 'coconut flour', 'oat flour', 'gluten-free flour blend'],
        'sugar': ['honey', 'maple syrup', 'coconut sugar', 'stevia'],
        'butter': ['coconut oil', 'olive oil', 'avocado', 'applesauce'],
        'eggs': ['flax egg', 'chia egg', 'applesauce', 'mashed banana'],
        'milk': ['almond milk', 'soy milk', 'oat milk', 'coconut milk'],
        'cheese': ['nutritional yeast', 'vegan cheese', 'tofu'],
        'chicken': ['tofu', 'tempeh', 'seitan', 'mushrooms'],
        'beef': ['impossible meat', 'beyond meat', 'lentils', 'mushrooms'],
        'pork': ['jackfruit', 'tempeh', 'tofu'],
        'onion': ['shallots', 'leeks', 'green onions', 'onion powder'],
        'garlic': ['garlic powder', 'shallots', 'asafoetida'],
        'tomato': ['red bell peppers', 'pumpkin', 'carrots'],
        'rice': ['quinoa', 'cauliflower rice', 'bulgur', 'barley'],
        'pasta': ['zucchini noodles', 'spaghetti squash', 'chickpea pasta'],
        'potato': ['sweet potato', 'cauliflower', 'turnips', 'parsnips'],
        'carrot': ['parsnip', 'sweet potato', 'butternut squash'],
        'broccoli': ['cauliflower', 'brussels sprouts', 'green beans'],
        'spinach': ['kale', 'swiss chard', 'collard greens', 'arugula']
      };

      const alternatives = substitutions[targetIngredient] || ['an alternative ingredient'];
      const mainAlternative = alternatives[0];
      const otherAlternatives = alternatives.slice(1);

      answer = `You can substitute ${targetIngredient} with ${mainAlternative}. `;
      
      if (otherAlternatives.length > 0) {
        answer += `Other alternatives include ${otherAlternatives.join(', ')}. `;
      }
      
      answer += `When substituting ${targetIngredient} with ${mainAlternative}, `;
      
      if (targetIngredient === 'flour') {
        answer += `you might need to adjust the quantity slightly as alternative flours absorb liquid differently. Start with 3/4 the amount and adjust as needed.`;
      } else if (['sugar', 'honey', 'maple syrup'].includes(targetIngredient)) {
        answer += `you might need to reduce the amount as some substitutes are sweeter than regular sugar. Also, if using a liquid sweetener like honey, reduce other liquids in the recipe slightly.`;
      } else if (['butter', 'oil'].includes(targetIngredient)) {
        answer += `the texture might be slightly different. For baking, using oil instead of butter will result in a more moist but less fluffy texture.`;
      } else {
        answer += `keep in mind that the flavor and texture may be slightly different, but the recipe should still work well.`;
      }

      // Create a variation
      variation = {
        id: uuidv4(),
        name: `${mainAlternative.charAt(0).toUpperCase() + mainAlternative.slice(1)} Version`,
        description: `Recipe variation using ${mainAlternative} instead of ${targetIngredient}`,
        originalRecipeId: recipeId,
        modifiedIngredients: [
          `Use ${mainAlternative} instead of ${targetIngredient}`
        ],
        modifiedInstructions: [
          `Follow the same instructions, replacing ${targetIngredient} with ${mainAlternative}`
        ],
        modifiedNutritionalValue: {
          calories: Math.floor(Math.random() * 50) + 250,
          protein: Math.floor(Math.random() * 5) + 10,
          carbs: Math.floor(Math.random() * 10) + 30,
          fat: Math.floor(Math.random() * 5) + 10
        },
        createdAt: Date.now(),
        followUpId: uuidv4() // This will be replaced with the actual follow-up ID
      };
    } else {
      answer = `I'd be happy to suggest substitutions, but I'm not sure which ingredient you want to replace. Could you please specify which ingredient you'd like to substitute?`;
    }
  } else if (question.toLowerCase().includes('how long')) {
    answer = `The cooking time can vary based on your oven/stove and the specific ingredients used. The recipe suggests the optimal cooking time, but you should also use visual cues: for baked goods, check if it's golden brown and a toothpick comes out clean; for meat, use a meat thermometer to ensure proper internal temperature; for pasta, taste to check if it's al dente. If you find the suggested time isn't working for you, note the actual time needed for future reference.`;
  } else if (question.toLowerCase().includes('store') || question.toLowerCase().includes('keep')) {
    answer = `For storing this dish: refrigerate leftovers in an airtight container for 3-4 days. For longer storage, you can freeze portions in freezer-safe containers for up to 3 months. To reheat, thaw in the refrigerator if frozen, then warm in a microwave or on the stovetop. Add a splash of water or broth when reheating to restore moisture. Some dishes (like those with crispy elements) are best consumed fresh as texture may change after storage.`;
  } else if (question.toLowerCase().includes('spicy') || question.toLowerCase().includes('heat')) {
    answer = `To adjust the spiciness: For more heat, you can add red pepper flakes, fresh chopped chili peppers, a dash of hot sauce, or cayenne pepper to taste. Start with a small amount and add more gradually. For less heat, reduce or omit the spicy ingredients, remove seeds from peppers, add dairy products like yogurt or cream to balance the heat, or include more of the non-spicy ingredients to dilute the spiciness. Remember that spices bloom when cooked, so adding them earlier intensifies the heat throughout the dish.`;
  } else {
    // Generic response for other questions
    answer = `Thank you for your question about this recipe. To address "${question}": This would depend on your specific preferences and cooking environment. I'd recommend experimenting with small adjustments based on your taste preferences. If you're trying this recipe for the first time, follow it closely, then make notes about what you might change for next time. Cooking is both a science and an art, so don't be afraid to make it your own once you're comfortable with the basic technique.`;
  }

  // Create follow-up QA object
  const followUpQA: FollowUpQA = {
    id: uuidv4(),
    question,
    answer,
    timestamp: Date.now(),
    appliedModificationId: undefined
  };

  // If we generated a variation, update its followUpId
  if (variation) {
    variation.followUpId = followUpQA.id;
  }

  return followUpQA;
};

/**
 * Apply a recipe variation to create a modified version of the recipe
 * @param recipe The original recipe
 * @param followUpId The ID of the follow-up question
 * @param variationId The ID of the variation to apply
 * @returns The modified recipe with the variation applied
 */
export const applyRecipeVariation = (
  recipe: Recipe,
  followUpId: string,
  variationId: string = ''
): Recipe => {
  // Find the follow-up question
  const followUp = recipe.followUps?.find(fq => fq.id === followUpId);
  
  if (!followUp) {
    return recipe;
  }

  // If no variations exist yet, initialize the array
  if (!recipe.variations) {
    recipe.variations = [];
  }

  // Create a variation if one doesn't exist
  let variation: RecipeVariation;
  
  if (variationId) {
    const existingVariation = recipe.variations.find(v => v.id === variationId);
    if (!existingVariation) {
      return recipe; // Variation not found
    }
    variation = existingVariation;
  } else {
    // Create a simple variation based on the follow-up
    const substitutionRegex = /substitute (.*?) with (.*?)[.,]/i;
    const match = followUp.answer.match(substitutionRegex);
    
    if (match) {
      const [, original, replacement] = match;
      
      variation = {
        id: uuidv4(),
        name: `${replacement.charAt(0).toUpperCase() + replacement.slice(1)} Version`,
        description: `Recipe variation using ${replacement} instead of ${original}`,
        originalRecipeId: recipe.id,
        modifiedIngredients: [
          `Use ${replacement} instead of ${original}`
        ],
        modifiedInstructions: [
          `Follow the same instructions, replacing ${original} with ${replacement}`
        ],
        modifiedNutritionalValue: {
          calories: Math.floor(Math.random() * 50) + 250,
          protein: Math.floor(Math.random() * 5) + 10,
          carbs: Math.floor(Math.random() * 10) + 30,
          fat: Math.floor(Math.random() * 5) + 10
        },
        createdAt: Date.now(),
        followUpId: followUp.id
      };
      
      recipe.variations.push(variation);
    } else {
      // If no substitution found, we can't create a variation
      return recipe;
    }
  }

  // Mark the follow-up as applied
  followUp.appliedModificationId = variation.id;
  
  // Apply the variation to the recipe
  const updatedRecipe: Recipe = {
    ...recipe,
    appliedVariationId: variation.id,
    ingredients: applyIngredientModifications(recipe.ingredients, variation.modifiedIngredients),
    instructions: applyInstructionModifications(recipe.instructions, variation.modifiedInstructions),
    nutritionalValue: variation.modifiedNutritionalValue || recipe.nutritionalValue
  };
  
  return updatedRecipe;
};

/**
 * Helper function to apply ingredient modifications
 */
const applyIngredientModifications = (
  originalIngredients: string[],
  modifications: string[]
): string[] => {
  // This is a simplified version. In a real app, you'd need more sophisticated
  // parsing and substitution logic
  
  // For now, just append the modifications to the ingredients list
  return [...originalIngredients, '---', ...modifications];
};

/**
 * Helper function to apply instruction modifications
 */
const applyInstructionModifications = (
  originalInstructions: string[],
  modifications: string[]
): string[] => {
  // This is a simplified version. In a real app, you'd need more sophisticated
  // parsing and substitution logic
  
  // For now, just append the modifications to the instructions list
  return [...originalInstructions, '---', ...modifications];
}; 