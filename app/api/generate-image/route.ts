import { NextResponse } from "next/server"
import OpenAI from "openai"

export const maxDuration = 20 // Set maximum duration to 20 seconds

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
  }

  try {
    const { recipeTitle, ingredients } = await req.json()

    if (!recipeTitle) {
      return NextResponse.json({ error: "Recipe title is required" }, { status: 400 })
    }

    console.log("Generating image for recipe:", recipeTitle)

    // Create a detailed prompt for the image generation model
    let prompt = `A professional food photography style image of ${recipeTitle}, `
    
    // Add ingredients to make the image more specific
    if (ingredients && ingredients.length > 0) {
      const mainIngredients = ingredients.slice(0, 5) // Use up to 5 main ingredients in the prompt
      prompt += `featuring ${mainIngredients.join(', ')}. `
    }
    
    // Add styling details
    prompt += "The dish should be beautifully plated on a clean background with professional lighting, " +
              "styled like a high-end cookbook or food magazine photograph. Top-down view with soft natural lighting."

    console.log("Image generation prompt:", prompt)

    // Call OpenAI to generate the image
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "natural"
    })

    console.log("Image generated successfully")

    return NextResponse.json({ 
      imageUrl: response.data[0].url,
      prompt: prompt
    })
    
  } catch (error) {
    console.error("Error in generate-image:", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
} 