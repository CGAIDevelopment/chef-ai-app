import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  Image,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRecipeStore } from '../lib/store';
import { Recipe } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';
import { generateRecipe, analyzeImage, generateImage } from '../lib/api';

const HISTORY_STORAGE_KEY = 'recipe_generation_history';
const MAX_HISTORY_ITEMS = 10;
const RECIPES_STORAGE_KEY = 'chef_ai_recipes';

interface GenerateRecipeScreenProps {
  onBack: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

const GenerateRecipeScreen: React.FC<GenerateRecipeScreenProps> = ({ 
  onBack,
  onSelectRecipe
}) => {
  const [recipePrompt, setRecipePrompt] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(1);
  const [generationHistory, setGenerationHistory] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [recipeData, setRecipeData] = useState<any>(null);
  const [isApiCallComplete, setIsApiCallComplete] = useState(false);
  const [apiTimeout, setApiTimeout] = useState<NodeJS.Timeout | null>(null);

  const { addRecipe } = useRecipeStore();

  // Load history from AsyncStorage on component mount
  useEffect(() => {
    loadGenerationHistory();
  }, []);

  // Request camera permissions
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Sorry, we need camera roll permissions to upload images of ingredients!'
          );
        }
      }
    })();
  }, []);

  // Handle generation steps and UI animation
  useEffect(() => {
    if (!isGenerating) {
      setGenerationStep(1);
      return;
    }

    // If we're generating, advance the steps on a timer
    const stepTimer = setTimeout(() => {
      // If the API call isn't complete yet, don't go past step 3
      if (generationStep < 3 || (generationStep === 3 && isApiCallComplete)) {
        setGenerationStep(prev => prev + 1);
      }
      
      // Only complete the recipe when we reach step 4 AND the API call is done
      if (generationStep === 4 && isApiCallComplete) {
        completeRecipeGeneration();
      }
    }, 1500);
    
    return () => clearTimeout(stepTimer);
  }, [generationStep, isGenerating, isApiCallComplete]);

  // Load generation history from storage
  const loadGenerationHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        setGenerationHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Failed to load generation history:', error);
    }
  };

  // Save generation history to storage
  const saveGenerationHistory = async (history: string[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save generation history:', error);
    }
  };

  // Save prompt to generation history
  const saveToHistory = (prompt: string) => {
    if (!prompt.trim()) return;
    
    const updatedHistory = [
      prompt, 
      ...generationHistory.filter(item => item !== prompt)
    ].slice(0, MAX_HISTORY_ITEMS);
    
    setGenerationHistory(updatedHistory);
    saveGenerationHistory(updatedHistory);
  };

  // Handle image selection from library
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImageUri = result.assets[0].uri;
      setSelectedImages([...selectedImages, newImageUri]);
      
      // Analyze image for ingredients
      analyzeImageForIngredients(newImageUri);
    }
  };

  // Analyze image to detect ingredients
  const analyzeImageForIngredients = async (imageUri: string) => {
    setIsAnalyzingImage(true);
    
    try {
      // In a real app, we would call the OpenAI API here
      // For now, we'll just simulate it with a timeout and mock response
      
      // For demonstration, we'll just wait a moment and then provide some mock ingredients
      setTimeout(() => {
        const mockIngredients = [
          'tomatoes',
          'onions',
          'garlic',
          'mushrooms',
          'pasta'
        ];
        
        setDetectedIngredients(mockIngredients);
        
        // Ask user if they want to use these ingredients
        Alert.alert(
          'Ingredients Detected',
          `We detected: ${mockIngredients.join(', ')}. Would you like to add these to your recipe prompt?`,
          [
            {
              text: 'Yes',
              onPress: () => {
                const ingredientText = mockIngredients.join(', ');
                const updatedPrompt = recipePrompt.trim() 
                  ? `${recipePrompt} with ${ingredientText}`
                  : `Recipe using ${ingredientText}`;
                
                setRecipePrompt(updatedPrompt);
              }
            },
            {
              text: 'No',
              style: 'cancel'
            }
          ]
        );
        
        setIsAnalyzingImage(false);
      }, 2000);
      
      // In a real implementation, we would use the API:
      // const ingredients = await analyzeImage(imageUri);
      // setDetectedIngredients(ingredients);
      
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze the image. Please try again.');
      setIsAnalyzingImage(false);
    }
  };

  // Remove an image from the selected images
  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  // Handle generate recipe button press
  const handleGenerateRecipe = async () => {
    if (!recipePrompt.trim()) {
      Alert.alert(
        "Empty Prompt", 
        "Please enter a recipe idea to generate.",
        [{ text: "OK" }]
      );
      return;
    }

    console.log('Starting recipe generation process');
    // Reset states
    setIsApiCallComplete(false);
    setRecipeData(null);
    
    // Clear any existing timeout
    if (apiTimeout) {
      clearTimeout(apiTimeout);
    }
    
    // Set a timeout to fallback to mock data if API takes too long
    const timeout = setTimeout(() => {
      console.warn('API call taking too long, falling back to mock data');
      // If we're still generating and the API call isn't complete after 15 seconds
      if (isGenerating && !isApiCallComplete) {
        // Force the generation to complete with mock data
        setIsApiCallComplete(true);
      }
    }, 15000); // 15 seconds timeout
    
    setApiTimeout(timeout);
    
    // Start generating
    setIsGenerating(true);
    saveToHistory(recipePrompt);
    
    try {
      // Make the API call in the background while showing the animation
      console.log('Calling OpenAI API...');
      const response = await generateRecipe(recipePrompt, additionalDetails, selectedImages);
      
      // Save the response data for use in completeRecipeGeneration
      console.log('API response received, storing data:', response);
      setRecipeData(response);
      
      // Mark the API call as complete - this will allow the generation to finish
      setIsApiCallComplete(true);
      console.log('API call marked as complete');

      // Clear the timeout since we got a response
      if (apiTimeout) {
        clearTimeout(apiTimeout);
        setApiTimeout(null);
      }
      
    } catch (error) {
      console.error('Error generating recipe:', error);
      
      // Clear the timeout
      if (apiTimeout) {
        clearTimeout(apiTimeout);
        setApiTimeout(null);
      }
      
      Alert.alert(
        'Generation Failed',
        'Sorry, we encountered an error while generating your recipe. Please try again.',
        [{ text: 'OK' }]
      );
      setIsGenerating(false);
      setIsApiCallComplete(false);
    }
  };

  // Reset states when generation completes or errors
  const resetGenerationStates = () => {
    setIsGenerating(false);
    setIsApiCallComplete(false);
    setRecipePrompt('');
    setAdditionalDetails('');
    setSelectedImages([]);
    setDetectedIngredients([]);
    setRecipeData(null);
    
    // Clear any timeout
    if (apiTimeout) {
      clearTimeout(apiTimeout);
      setApiTimeout(null);
    }
  };

  // Create a recipe based on the prompt and API response
  const completeRecipeGeneration = () => {
    console.log('Completing recipe generation, API complete?', isApiCallComplete);
    console.log('Recipe data available:', recipeData);
    
    try {
      // Create a unique ID for the recipe
      const recipeId = uuidv4();
      
      // Default recipe object that will be used if there's no API data
      let recipe: Recipe = {
        id: recipeId,
        title: recipePrompt.charAt(0).toUpperCase() + recipePrompt.slice(1),
        ingredients: [
          "2 cups all-purpose flour",
          "1 cup sugar",
          "1/2 cup butter, softened",
          "2 eggs",
          "1 cup milk",
          "2 teaspoons baking powder",
          "1/2 teaspoon salt",
          "1 teaspoon vanilla extract",
          ...(detectedIngredients.length > 0 ? detectedIngredients.map(i => `1 ${i}`) : [])
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
        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80",
        description: `Created from prompt: "${recipePrompt}"${additionalDetails ? ` with details: ${additionalDetails}` : ''}`,
        nutritionalValue: {
          calories: 320,
          protein: 5,
          carbs: 45,
          fat: 12
        },
        servings: 8,
        status: "all"
      };

      // If we have data from the API, use it to replace the default recipe fields
      if (recipeData && recipeData.success && recipeData.recipe) {
        console.log('Using real recipe data from OpenAI');
        const apiRecipe = recipeData.recipe;
        recipe = {
          ...recipe,
          title: apiRecipe.title || recipe.title,
          ingredients: apiRecipe.ingredients || recipe.ingredients,
          instructions: apiRecipe.instructions || recipe.instructions,
          description: apiRecipe.description || recipe.description,
          nutritionalValue: apiRecipe.nutritionalValue || recipe.nutritionalValue,
          servings: apiRecipe.servings || recipe.servings
        };
      } else {
        console.warn('No API data available, using mock recipe');
      }

      // After creating the recipe, generate an image for it
      console.log('Adding recipe to store:', recipe.title);
      
      // First add the recipe to the store
      addRecipe(recipe);
      
      // Save the recipe to AsyncStorage directly for extra reliability
      try {
        // Get existing recipes from AsyncStorage
        AsyncStorage.getItem(RECIPES_STORAGE_KEY)
          .then(existingRecipesJson => {
            // Parse existing recipes or create empty array if none exist
            const existingRecipes = existingRecipesJson ? JSON.parse(existingRecipesJson) : [];
            
            // Add new recipe
            const updatedRecipes = [...existingRecipes, recipe];
            
            // Save updated recipes array back to AsyncStorage
            return AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(updatedRecipes));
          })
          .then(() => {
            console.log('Recipe successfully saved to AsyncStorage');
            
            // After saving to storage, generate the image
            generateRecipeImage(recipe);
          })
          .catch(error => {
            console.error('Error saving recipe to AsyncStorage:', error);
          });
      } catch (storageError) {
        console.error('AsyncStorage error:', storageError);
        // Continue with the process despite storage error
        generateRecipeImage(recipe);
      }
      
      // Reset all states
      resetGenerationStates();
      
      // Show success message with options
      Alert.alert(
        "Recipe Generated!", 
        "Your recipe has been successfully created.",
        [
          { 
            text: "View Recipe", 
            onPress: () => onSelectRecipe(recipe) 
          },
          { 
            text: "Create Another", 
            style: "cancel" 
          }
        ]
      );
    } catch (error) {
      console.error('Error completing recipe generation:', error);
      resetGenerationStates();
      Alert.alert(
        'Generation Failed',
        'Sorry, we encountered an error while finalizing your recipe. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Generate an image for the recipe using the API
  const generateRecipeImage = async (recipe: Recipe) => {
    try {
      // Extract main ingredients for image generation
      const mainIngredients = recipe.ingredients
        .slice(0, 5)
        .map(ing => ing.split(' ').slice(1).join(' ')); // Remove quantities

      // Call the image generation API
      const imageUrl = await generateImage(recipe.title, mainIngredients);
      
      // Update the recipe with the new image URL
      if (imageUrl) {
        const updatedRecipe = {...recipe, image: imageUrl};
        // Update in store
        addRecipe(updatedRecipe);
      }
    } catch (error) {
      console.error('Error generating recipe image:', error);
      // We don't need to alert the user here as the recipe was still created
      // and this is just an enhancement
    }
  };

  // Render history item
  const renderHistoryItem = (item: string) => (
    <TouchableOpacity 
      key={item} 
      style={styles.historyItem}
      onPress={() => setRecipePrompt(item)}
    >
      <Text style={styles.historyItemText}>{item}</Text>
    </TouchableOpacity>
  );

  // Render selected images
  const renderSelectedImages = () => (
    <View style={styles.selectedImagesContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {selectedImages.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.selectedImage} />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={() => removeImage(index)}
            >
              <Text style={styles.removeImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        
        <TouchableOpacity 
          style={styles.addImageButton}
          onPress={pickImage}
          disabled={isAnalyzingImage}
        >
          <Text style={styles.addImageText}>+</Text>
          <Text style={styles.addImageLabel}>Add Photo</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {isAnalyzingImage && (
        <View style={styles.imageAnalysisContainer}>
          <ActivityIndicator size="small" color="#4A7856" />
          <Text style={styles.imageAnalysisText}>Analyzing ingredients...</Text>
        </View>
      )}
    </View>
  );

  // Loading indicator during generation
  const renderGenerationProgress = () => (
    <View style={styles.generatingContainer}>
      <ActivityIndicator size="large" color="#4A7856" />
      <Text style={styles.generatingTitle}>Generating Your Recipe</Text>
      <Text style={styles.generatingText}>
        {generationStep === 1 && "Analyzing your request..."}
        {generationStep === 2 && "Creating recipe details..."}
        {generationStep === 3 && "Adding ingredients and instructions..."}
        {generationStep === 4 && (isApiCallComplete ? "Finalizing your recipe..." : "Waiting for AI response...")}
      </Text>

      {/* Progress steps visualization */}
      <View style={styles.progressSteps}>
        <View style={[
          styles.progressStep, 
          (generationStep >= 1) && styles.completedStep
        ]} />
        <View style={[
          styles.progressStep, 
          (generationStep >= 2) && styles.completedStep
        ]} />
        <View style={[
          styles.progressStep, 
          (generationStep >= 3) && styles.completedStep
        ]} />
        <View style={[
          styles.progressStep, 
          (generationStep >= 4) && styles.completedStep
        ]} />
      </View>
      
      {generationStep === 4 && !isApiCallComplete && (
        <Text style={styles.waitingText}>
          Waiting for OpenAI to generate your recipe...
        </Text>
      )}
    </View>
  );

  // Clear the timeout when component unmounts
  useEffect(() => {
    return () => {
      if (apiTimeout) {
        clearTimeout(apiTimeout);
      }
    };
  }, [apiTimeout]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Generate Recipe</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {isGenerating ? (
          renderGenerationProgress()
        ) : (
          <>
            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Create a Recipe</Text>
              <Text style={styles.description}>
                Tell us what type of recipe you'd like to create. Be as specific or creative as you'd like!
              </Text>

              <Text style={styles.label}>Recipe Idea</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Pasta with mushrooms"
                value={recipePrompt}
                onChangeText={setRecipePrompt}
                multiline
              />

              <Text style={styles.label}>Additional Details (Optional)</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="e.g., vegetarian, spicy, quick to make"
                value={additionalDetails}
                onChangeText={setAdditionalDetails}
                multiline
              />

              <Text style={styles.label}>Add Ingredient Photos (Optional)</Text>
              <Text style={styles.subLabel}>
                Upload photos of ingredients to include in your recipe
              </Text>
              
              {renderSelectedImages()}

              <TouchableOpacity 
                style={styles.generateButton}
                onPress={handleGenerateRecipe}
              >
                <Text style={styles.generateButtonText}>Generate Recipe</Text>
              </TouchableOpacity>
            </View>

            {generationHistory.length > 0 && (
              <View style={styles.historyContainer}>
                <Text style={styles.historyTitle}>Recent Prompts</Text>
                <View style={styles.historyList}>
                  {generationHistory.map(renderHistoryItem)}
                </View>
              </View>
            )}

            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Prompt Tips</Text>
              <View style={styles.tipItem}>
                <Text style={styles.tipItemTitle}>Be Specific</Text>
                <Text style={styles.tipItemText}>
                  Include cuisine type, main ingredients, or cooking method
                </Text>
              </View>
              
              <View style={styles.tipItem}>
                <Text style={styles.tipItemTitle}>Add Details</Text>
                <Text style={styles.tipItemText}>
                  Mention dietary preferences, difficulty level, or time constraints
                </Text>
              </View>
              
              <View style={styles.tipItem}>
                <Text style={styles.tipItemTitle}>Use Photos</Text>
                <Text style={styles.tipItemText}>
                  Upload photos of ingredients you have on hand
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 22,
    color: '#4A7856',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 14,
    color: '#333333',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    lineHeight: 22,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333333',
  },
  subLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  generateButton: {
    backgroundColor: '#4A7856',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  historyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  historyItemText: {
    fontSize: 16,
    color: '#333333',
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  tipItem: {
    marginBottom: 10,
  },
  tipItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A7856',
    marginBottom: 4,
  },
  tipItemText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  generatingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  generatingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  generatingText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '80%',
    gap: 10,
  },
  progressStep: {
    height: 8,
    flex: 1,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  completedStep: {
    backgroundColor: '#4A7856',
  },
  selectedImagesContainer: {
    marginBottom: 20,
  },
  imageContainer: {
    marginRight: 10,
    position: 'relative',
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF5252',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4A7856',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  addImageText: {
    fontSize: 32,
    color: '#4A7856',
    marginBottom: 4,
  },
  addImageLabel: {
    fontSize: 14,
    color: '#4A7856',
  },
  imageAnalysisContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  imageAnalysisText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666666',
  },
  waitingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default GenerateRecipeScreen; 