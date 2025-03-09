import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export const maxDuration = 30 // Set maximum duration to 30 seconds

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
  }

  try {
    const body = await req.json()
    const { recipeId, question, recipeContext } = body

    if (!question) {
      return NextResponse.json({ error: "No question provided" }, { status: 400 })
    }

    if (!recipeContext) {
      return NextResponse.json({ error: "No recipe context provided" }, { status: 400 })
    }

    console.log("Received question:", { recipeId, question })

    // Construct a prompt with recipe context for better answers
    const systemPrompt = `You are a helpful culinary assistant that provides detailed, expert-level advice about recipes. 
You'll be given a question about a specific recipe along with the recipe's context.
Provide informative, practical answers about cooking techniques, ingredient substitutions, modifications, and culinary tips.
If asked for modifications like making it spicier, healthier, vegan, etc., provide specific guidance on how to adapt the recipe.
Always tailor your response to the specific recipe provided in the context.`

    // Extract recipe details to format as context
    const { title, ingredients, instructions, nutritionalValue, servings } = recipeContext

    // Format ingredients and instructions for better readability
    const formattedIngredients = ingredients.map((i: string) => `- ${i}`).join('\n')
    const formattedInstructions = instructions.map((i: string, idx: number) => `${idx + 1}. ${i}`).join('\n')

    // Construct the recipe context
    const recipeDetailsPrompt = `
RECIPE: ${title}
SERVINGS: ${servings}

INGREDIENTS:
${formattedIngredients}

INSTRUCTIONS:
${formattedInstructions}

NUTRITIONAL INFO (per serving):
- Calories: ${nutritionalValue.calories}
- Protein: ${nutritionalValue.protein}g
- Carbs: ${nutritionalValue.carbs}g
- Fat: ${nutritionalValue.fat}g

QUESTION: ${question}
`

    console.log("Sending prompt to AI model with recipe context")

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: recipeDetailsPrompt
        }
      ],
      maxTokens: 800,
      temperature: 0.7,
    })

    if (!text) {
      return NextResponse.json({ error: "No text generated from the model" }, { status: 500 })
    }

    console.log("AI response received")

    // Check for modification requests to inform the client
    const isModificationRequest = 
      question.toLowerCase().includes('make it') || 
      question.toLowerCase().includes('modify') || 
      question.toLowerCase().includes('change') || 
      question.toLowerCase().includes('substitute') || 
      question.toLowerCase().includes('without') ||
      question.toLowerCase().includes('version') ||
      question.toLowerCase().includes('adapt') ||
      question.toLowerCase().includes('spicy') ||
      question.toLowerCase().includes('vegan') ||
      question.toLowerCase().includes('double') ||
      question.toLowerCase().includes('scale');

    return NextResponse.json({ 
      answer: text,
      shouldCreateVariation: isModificationRequest 
    })
  } catch (error) {
    console.error("Error in recipe-questions:", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
} 