import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Recipe } from '../lib/types';
import FollowUpQuestion from '../components/FollowUpQuestion';
import AddToShoppingListButton from '../components/AddToShoppingListButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RecipeDetailScreenProps {
  recipe: Recipe;
  onBack: () => void;
  onRecipeUpdate?: (updatedRecipe: Recipe) => void;
  onNavigate?: (screen: string) => void;
}

const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({ 
  recipe: initialRecipe, 
  onBack,
  onRecipeUpdate,
  onNavigate
}) => {
  const [recipe, setRecipe] = useState<Recipe>(initialRecipe);

  const handleRecipeUpdate = async (updatedRecipe: Recipe) => {
    setRecipe(updatedRecipe);
    
    // Also call the parent update function if provided
    if (onRecipeUpdate) {
      onRecipeUpdate(updatedRecipe);
    }
    
    // Store updated recipe in AsyncStorage
    try {
      // Get all recipes
      const recipesJson = await AsyncStorage.getItem('recipes');
      if (recipesJson) {
        const recipes = JSON.parse(recipesJson);
        
        // Update this recipe
        const updatedRecipes = recipes.map((r: Recipe) => 
          r.id === updatedRecipe.id ? updatedRecipe : r
        );
        
        // Save back to storage
        await AsyncStorage.setItem('recipes', JSON.stringify(updatedRecipes));
      }
    } catch (error) {
      console.error('Error saving updated recipe:', error);
    }
  };

  const handleViewShoppingList = () => {
    if (onNavigate) {
      onNavigate('ShoppingList');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recipe</Text>
        
        {onNavigate && (
          <TouchableOpacity 
            onPress={handleViewShoppingList}
            style={styles.shoppingListButton}
          >
            <Ionicons name="cart-outline" size={22} color="#4A7856" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        <Image 
          source={{ uri: recipe.image }} 
          style={styles.image}
          defaultSource={{ uri: 'https://via.placeholder.com/400' }}
        />
        
        <View style={styles.recipeInfo}>
          <Text style={styles.title}>{recipe.title}</Text>
          
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{recipe.servings}</Text>
              <Text style={styles.metaLabel}>Servings</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{recipe.nutritionalValue.calories}</Text>
              <Text style={styles.metaLabel}>Calories</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{recipe.nutritionalValue.protein}g</Text>
              <Text style={styles.metaLabel}>Protein</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{recipe.nutritionalValue.carbs}g</Text>
              <Text style={styles.metaLabel}>Carbs</Text>
            </View>
          </View>
          
          <Text style={styles.description}>{recipe.description}</Text>
          
          {/* Recipe Variation Banner */}
          {recipe.appliedVariationId && recipe.variations && (
            <View style={styles.variationBanner}>
              <Text style={styles.variationText}>
                This recipe has been modified with your requested changes.
              </Text>
            </View>
          )}
          
          {/* Add to Shopping List button */}
          <View style={styles.actionButtonsContainer}>
            <AddToShoppingListButton recipe={recipe} />
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.bullet} />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>{index + 1}</Text>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>

          {/* Add Follow-Up Questions section with a highlight */}
          <View style={styles.followUpSection}>
            <FollowUpQuestion 
              recipe={recipe} 
              onUpdateRecipe={handleRecipeUpdate} 
            />
          </View>
        </View>
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
  shoppingListButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#F0F0F0',
  },
  recipeInfo: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  metaItem: {
    alignItems: 'center',
  },
  metaValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A7856',
  },
  metaLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 24,
  },
  actionButtonsContainer: {
    marginBottom: 20,
  },
  variationBanner: {
    backgroundColor: '#E6F0EB',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A7856',
    marginBottom: 16,
  },
  variationText: {
    color: '#4A7856',
    fontWeight: '500',
  },
  section: {
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
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A7856',
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4A7856',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
    fontWeight: '700',
  },
  instructionText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    lineHeight: 24,
  },
  followUpSection: {
    marginTop: 8,
    marginBottom: 24,
  },
});

export default RecipeDetailScreen; 