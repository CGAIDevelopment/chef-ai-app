import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { UserPreferences } from "@/lib/types"

export const maxDuration = 60 // Set maximum duration to 60 seconds

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
  }

  try {
    const body = await req.json()
    const { name, description, images, userPreferences } = body

    if (!images || images.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 })
    }

    console.log("Received request:", { name, description, imageCount: images.length, hasPreferences: !!userPreferences })

    // Create a prompt that incorporates user preferences if available
    let promptDetails = "";
    
    if (userPreferences) {
      // Format dietary restrictions
      if (userPreferences.dietaryRestrictions?.length > 0 && !userPreferences.dietaryRestrictions.includes("none")) {
        promptDetails += `\nDietary Restrictions: ${userPreferences.dietaryRestrictions.join(", ")}.`;
      }
      
      // Format allergies to avoid
      if (userPreferences.allergies?.length > 0) {
        promptDetails += `\nAllergies (AVOID these ingredients): ${userPreferences.allergies.join(", ")}.`;
      }
      
      // Format cooking skill level
      if (userPreferences.cookingSkillLevel) {
        promptDetails += `\nCooking Skill Level: ${userPreferences.cookingSkillLevel} (adjust complexity accordingly).`;
      }
      
      // Format kitchen equipment
      const availableEquipment = userPreferences.kitchenEquipment
        ?.filter((e: { name: string; available: boolean }) => e.available)
        .map((e: { name: string; available: boolean }) => e.name);
        
      if (availableEquipment?.length > 0) {
        promptDetails += `\nAvailable Kitchen Equipment: ${availableEquipment.join(", ")}.`;
      }
      
      // Format serving size preference
      if (userPreferences.servingSizePreference) {
        promptDetails += `\nPreferred Serving Size: ${userPreferences.servingSizePreference} people.`;
      }
      
      // Format cuisine preferences
      if (userPreferences.cuisinePreferences?.length > 0) {
        promptDetails += `\nPreferred Cuisines: ${userPreferences.cuisinePreferences.join(", ")}.`;
      }
      
      // Format flavor preferences
      if (userPreferences.flavorPreferences?.length > 0) {
        promptDetails += `\nPreferred Flavors: ${userPreferences.flavorPreferences.join(", ")}.`;
      }
    }

    const prompt = `Create a recipe using the ingredients in the provided images. ${name ? `The prompt/idea is: "${name}". ` : ""}${description ? `Additional instructions: ${description}. ` : ""}${promptDetails}\nFormat the response as JSON with title (a creative and appealing name for the recipe based on the prompt and ingredients), ingredients (array), instructions (array), nutritionalValue (object with calories, protein, carbs, fat), and servings (number).`

    console.log("Sending prompt to AI model:", prompt)

    // Convert image URLs to the format expected by the AI SDK
    const imageContents = images.map((image: string) => ({
      type: "image",
      image: new URL(image)
    }));

    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates recipes based on ingredients in images and user preferences. Consider dietary restrictions, allergies, cooking skill level, available equipment, and taste preferences when crafting recipes. Always generate a creative and fitting recipe title based on the user's prompt and the ingredients identified in the images. The title should be descriptive, appealing, and reflect what makes the recipe special. Respond in JSON format only."
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            ...imageContents
          ]
        }
      ],
      maxTokens: 1200,
    })

    if (!text) {
      return NextResponse.json({ error: "No text generated from the model" }, { status: 500 })
    }

    console.log("Raw model response:", text)

    let recipeData
    try {
      // Extract JSON from markdown code blocks if present
      let jsonString = text;
      
      // Check if the response is wrapped in code blocks
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        jsonString = codeBlockMatch[1].trim();
      }
      
      recipeData = JSON.parse(jsonString)
      
      // Ensure we have a reasonable recipe title based on the prompt
      if (!recipeData.title || recipeData.title === "Recipe Title" || recipeData.title === name) {
        // If AI didn't generate a good title, create one based on key ingredients and cooking method
        const ingredients = recipeData.ingredients || [];
        const mainIngredients = ingredients.slice(0, 3).map((ing: string) => {
          // Extract just the ingredient name without measurements
          return ing.replace(/^[\d\s\/]+(?:cup|tablespoon|teaspoon|oz|ounce|g|gram|pound|lb|ml|liter|can|package|bunch|piece|slice|clove)s?\s+of\s+/i, '')
            .replace(/^[\d\s\/]+(?:cup|tablespoon|teaspoon|oz|ounce|g|gram|pound|lb|ml|liter)s?\s+/i, '')
            .replace(/,.*$/, '')
            .trim();
        });
        
        // Extract potential cooking method from instructions
        let cookingMethod = '';
        if (recipeData.instructions && recipeData.instructions.length > 0) {
          const methods = ['grilled', 'roasted', 'baked', 'fried', 'sautéed', 'steamed', 'stir-fried', 'slow-cooked'];
          for (const method of methods) {
            if (recipeData.instructions.join(' ').toLowerCase().includes(method)) {
              cookingMethod = method;
              break;
            }
          }
        }
        
        // Create a title from ingredients and method
        if (mainIngredients.length > 0) {
          recipeData.title = `${cookingMethod ? cookingMethod + ' ' : ''}${mainIngredients.join(' & ')} ${
            recipeData.title && recipeData.title !== name ? recipeData.title : cookingMethod ? '' : 'Recipe'
          }`.trim();
        } else if (name) {
          // Just use the user's prompt if we can't extract ingredients
          recipeData.title = name;
        }
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError)
      return NextResponse.json(
        {
          error: "Failed to parse AI response",
          rawResponse: text,
        },
        { status: 500 },
      )
    }

    if ("error" in recipeData) {
      console.warn("Recipe generation warning:", recipeData.error)
      return NextResponse.json({ error: recipeData.error }, { status: 422 })
    }

    console.log("Successfully parsed recipe data:", recipeData)

    return NextResponse.json({ recipes: [recipeData] })
  } catch (error) {
    console.error("Error in generate-recipes:", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

