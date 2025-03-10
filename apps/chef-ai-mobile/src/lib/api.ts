import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import env from '../config/env';
import { Recipe } from './types';
import { v4 as uuidv4 } from 'uuid';

// Types for OpenAI requests
interface GenerateRecipeRequest {
  prompt: string;
  additionalDetails?: string;
  imageDescriptions?: string[];
}

interface GenerateImageRequest {
  recipeTitle: string;
  ingredients: string[];
}

// OpenAI API endpoints
const OPENAI_API_URL = "https://api.openai.com/v1";

// Get API key from environment configuration
const getApiKey = () => {
  return env.openaiApiKey;
};

// Check if we're in development mode
const isDev = true; // Set to false for production

/**
 * Generate a recipe using OpenAI
 */
export const generateRecipe = async (
  prompt: string,
  additionalDetails: string = '',
  imageUrls: string[] = []
): Promise<any> => {
  try {
    // Convert image URLs to base64 if needed (for web app compatibility)
    const imageDescriptions = await Promise.all(
      imageUrls.map(async (url) => {
        try {
          // Attempt to analyze the image
          const ingredients = await analyzeImage(url);
          return `Image showing ingredients: ${ingredients.join(', ')}`;
        } catch (error) {
          console.warn('Error analyzing image, using placeholder:', error);
          return `Image showing what appears to be food or ingredients`;
        }
      })
    );
    
    // Try to make a direct call to OpenAI API instead of going through a custom backend
    try {
      const additionalDetailsText = additionalDetails ? `Additional details: ${additionalDetails}` : '';
      const imageDescriptionsText = imageDescriptions.length > 0 
        ? `\n\nImages show these ingredients: ${imageDescriptions.join('; ')}` 
        : '';
      
      // Very specific system prompt to ensure proper JSON response
      const systemPrompt = `You are a professional chef who creates detailed recipes. 
      Respond ONLY with a valid JSON object formatted like this example:
      {
        "title": "Recipe Title",
        "description": "Brief description of the dish",
        "ingredients": ["ingredient 1 with amount", "ingredient 2 with amount", ...],
        "instructions": ["step 1", "step 2", ...],
        "nutritionalValue": {"calories": number, "protein": number, "carbs": number, "fat": number},
        "servings": number
      }
      
      Do not include any text before or after the JSON. Do not use markdown formatting, just return raw JSON.
      Be creative but practical. Include precise measurements and clear instructions.`;

      const userPrompt = `Create a recipe for: ${prompt}${imageDescriptionsText}\n${additionalDetailsText}`;
      
      console.log('Sending request to OpenAI with prompt:', userPrompt);
      
      const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getApiKey()}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1500
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', errorText);
        throw new Error('OpenAI API response not ok: ' + errorText);
      }

      const data = await response.json();
      console.log('OpenAI response received:', data);
      
      // Get the content from the response
      let recipeData = null;
      try {
        const content = data.choices[0].message.content;
        console.log('Raw OpenAI content:', content);
        
        // First, try to directly parse the content as JSON
        try {
          recipeData = JSON.parse(content);
          console.log('Parsed recipe data:', recipeData);
        } catch (jsonError) {
          console.error('Failed to parse JSON from content:', jsonError);
          console.log('Content that failed to parse:', content);
          
          // Try to extract JSON from the content if it contains other text
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const extractedJson = jsonMatch[0];
              console.log('Extracted JSON:', extractedJson);
              recipeData = JSON.parse(extractedJson);
              console.log('Parsed extracted data:', recipeData);
            } catch (extractError) {
              console.error('Failed to extract and parse JSON:', extractError);
              throw new Error('Could not extract valid JSON from response');
            }
          } else {
            throw new Error('No JSON found in response');
          }
        }
        
        // Ensure the recipe data has all required fields
        if (!recipeData.title || !recipeData.ingredients || !recipeData.instructions) {
          console.warn('Recipe data is missing required fields:', recipeData);
          throw new Error('Recipe data is missing required fields');
        }
        
        // Format into our expected structure
        return {
          success: true,
          recipe: recipeData
        };
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        throw new Error('Failed to parse recipe data from OpenAI');
      }
    } catch (apiError) {
      // If we're in development mode and the API call fails, return a mock recipe
      if (isDev) {
        console.warn('Using mock recipe in development mode:', apiError);
        return generateMockRecipe(prompt, additionalDetails, imageDescriptions);
      } else {
        // In production, rethrow the error
        throw apiError;
      }
    }
  } catch (error) {
    console.error('Error generating recipe:', error);
    throw error;
  }
};

/**
 * Generate an image for a recipe using DALL-E
 */
export const generateImage = async (
  recipeTitle: string,
  ingredients: string[]
): Promise<string> => {
  try {
    // Try to call OpenAI's image generation API directly
    try {
      const prompt = `A professional food photography image of ${recipeTitle} with ${ingredients.join(', ')}. The image should be high-quality, well-lit, showing the finished dish ready to serve.`;
      
      console.log('Generating image with prompt:', prompt);
      
      const response = await fetch(`${OPENAI_API_URL}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getApiKey()}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard"
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI Image API error:', errorText);
        throw new Error('OpenAI Image API response not ok');
      }

      const data = await response.json();
      console.log('Image generated successfully');
      
      return data.data[0].url;
    } catch (apiError) {
      // If in development mode and API call fails, return a placeholder image
      if (isDev) {
        console.warn('Using placeholder image in development mode:', apiError);
        return "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80";
      } else {
        // In production, rethrow the error
        throw apiError;
      }
    }
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};

/**
 * Process and analyze an image to detect ingredients
 */
export const analyzeImage = async (imageUri: string): Promise<string[]> => {
  try {
    // Try to directly use OpenAI's Vision API
    try {
      // First convert the image to base64
      const base64Image = await imageToBase64(imageUri);
      
      const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getApiKey()}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that can identify food ingredients in images. List only the ingredients you can clearly see, separated by commas. Be concise and accurate."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "What ingredients can you identify in this image? List them as comma-separated values only."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 300
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI Vision API error:', errorText);
        throw new Error('OpenAI Vision API response not ok');
      }

      const data = await response.json();
      const ingredientsText = data.choices[0].message.content;
      
      // Parse the comma-separated list of ingredients
      const ingredients = ingredientsText
        .split(',')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
      
      return ingredients;
    } catch (apiError) {
      // If in development mode and API call fails, return mock ingredients
      if (isDev) {
        console.warn('Using mock ingredients in development mode:', apiError);
        return getMockIngredients();
      } else {
        // In production, rethrow the error
        throw apiError;
      }
    }
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

/**
 * Convert a local image URI to base64
 * Utility function for API calls that require base64 encoded images
 */
export const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    
    if (!fileInfo.exists) {
      throw new Error('Image file does not exist');
    }
    
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

/**
 * Generate a mock recipe for local development and testing
 */
const generateMockRecipe = (
  prompt: string, 
  additionalDetails: string = '', 
  imageDescriptions: string[] = []
): any => {
  // Extract potential ingredients from image descriptions
  const extractedIngredients = imageDescriptions
    .flatMap(desc => {
      const match = desc.match(/ingredients: (.*)/);
      return match ? match[1].split(', ') : [];
    });

  // Basic mock recipe data
  return {
    success: true,
    recipe: {
      title: prompt.charAt(0).toUpperCase() + prompt.slice(1),
      description: `A delicious recipe for ${prompt}${additionalDetails ? ` that is ${additionalDetails}` : ''}.`,
      ingredients: [
        "2 cups all-purpose flour",
        "1 cup sugar",
        "1/2 cup butter, softened",
        "2 eggs",
        "1 cup milk",
        "2 teaspoons baking powder",
        "1/2 teaspoon salt",
        "1 teaspoon vanilla extract",
        ...extractedIngredients.map(i => `1 ${i}`)
      ],
      instructions: [
        "Preheat oven to 350°F (175°C).",
        "In a large bowl, cream together butter and sugar until light and fluffy.",
        "Beat in eggs one at a time, then stir in vanilla.",
        "Combine flour, baking powder, and salt; gradually blend into the creamed mixture alternating with milk.",
        "Pour batter into prepared pan.",
        "Bake for 30 to 35 minutes, or until a toothpick inserted into the center comes out clean.",
        "Allow to cool before serving."
      ],
      nutritionalValue: {
        calories: 320,
        protein: 5,
        carbs: 45,
        fat: 12
      },
      servings: 8,
    }
  };
};

/**
 * Get mock ingredients for development and testing
 */
const getMockIngredients = (): string[] => {
  const allPossibleIngredients = [
    'tomatoes', 'onions', 'garlic', 'carrots', 'potatoes',
    'bell peppers', 'broccoli', 'spinach', 'mushrooms', 'zucchini',
    'chicken', 'beef', 'pork', 'salmon', 'shrimp',
    'rice', 'pasta', 'quinoa', 'bread', 'flour',
    'milk', 'cheese', 'eggs', 'butter', 'yogurt',
    'olive oil', 'vinegar', 'soy sauce', 'honey', 'maple syrup'
  ];
  
  // Randomly select 3-5 ingredients
  const numIngredients = 3 + Math.floor(Math.random() * 3);
  const selectedIngredients = [];
  
  for (let i = 0; i < numIngredients; i++) {
    const randIndex = Math.floor(Math.random() * allPossibleIngredients.length);
    selectedIngredients.push(allPossibleIngredients[randIndex]);
    // Remove to avoid duplicates
    allPossibleIngredients.splice(randIndex, 1);
  }
  
  return selectedIngredients;
}; 