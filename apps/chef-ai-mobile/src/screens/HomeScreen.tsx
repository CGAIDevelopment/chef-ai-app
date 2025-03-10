import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRecipeStore } from '../lib/store';
import { Recipe } from '../lib/types';
import RecipeListScreen from './RecipeListScreen';
import RecipeDetailScreen from './RecipeDetailScreen';
import GenerateRecipeScreen from './GenerateRecipeScreen';
import MealPlanScreen from './MealPlanScreen';
import ProfileScreen from './ProfileScreen';
import ShoppingListScreen from './ShoppingListScreen';
import { Ionicons } from '@expo/vector-icons';

enum Screen {
  RecipeList = 'RecipeList',
  RecipeDetail = 'RecipeDetail',
  GenerateRecipe = 'GenerateRecipe',
  MealPlan = 'MealPlan',
  Profile = 'Profile',
  ShoppingList = 'ShoppingList',
}

const HomeScreen: React.FC = () => {
  const { fetchRecipes, updateRecipe } = useRecipeStore();
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.RecipeList);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);
  
  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentScreen(Screen.RecipeDetail);
  };

  const handleBackToList = () => {
    setCurrentScreen(Screen.RecipeList);
    setSelectedRecipe(null);
  };

  const handleUpdateRecipe = (updatedRecipe: Recipe) => {
    updateRecipe(updatedRecipe);
    setSelectedRecipe(updatedRecipe);
  };

  const handleGenerateRecipe = () => {
    setCurrentScreen(Screen.GenerateRecipe);
  };

  const handleMealPlan = () => {
    setCurrentScreen(Screen.MealPlan);
  };

  const handleProfile = () => {
    setCurrentScreen(Screen.Profile);
  };

  const handleShoppingList = () => {
    setCurrentScreen(Screen.ShoppingList);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.RecipeList:
        return (
          <>
            <RecipeListScreen onSelectRecipe={handleSelectRecipe} />
            <View style={styles.fabContainer}>
              <TouchableOpacity
                style={styles.fab}
                onPress={handleGenerateRecipe}
              >
                <Text style={styles.fabText}>+</Text>
              </TouchableOpacity>
            </View>
          </>
        );
      case Screen.RecipeDetail:
        return selectedRecipe ? (
          <RecipeDetailScreen
            recipe={selectedRecipe}
            onBack={handleBackToList}
            onRecipeUpdate={handleUpdateRecipe}
            onNavigate={(screen) => {
              if (screen === 'ShoppingList') {
                setCurrentScreen(Screen.ShoppingList);
              }
            }}
          />
        ) : null;
      case Screen.GenerateRecipe:
        return (
          <GenerateRecipeScreen
            onBack={handleBackToList}
            onSelectRecipe={handleSelectRecipe}
          />
        );
      case Screen.MealPlan:
        return (
          <MealPlanScreen
            onBack={handleBackToList}
            onSelectRecipe={handleSelectRecipe}
          />
        );
      case Screen.Profile:
        return (
          <ProfileScreen
            onBack={handleBackToList}
          />
        );
      case Screen.ShoppingList:
        return (
          <ShoppingListScreen
            onBack={handleBackToList}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {currentScreen === Screen.RecipeList && (
        <View style={styles.navbar}>
          <TouchableOpacity
            style={[styles.navItem, styles.activeNavItem]}
            onPress={() => setCurrentScreen(Screen.RecipeList)}
          >
            <Ionicons name="restaurant" size={20} color="#fff" />
            <Text style={styles.navText}>Recipes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.navItem}
            onPress={handleMealPlan}
          >
            <Ionicons name="calendar" size={20} color="#fff" />
            <Text style={styles.navText}>Meal Plans</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.navItem}
            onPress={handleShoppingList}
          >
            <Ionicons name="cart" size={20} color="#fff" />
            <Text style={styles.navText}>Shopping</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.navItem}
            onPress={handleProfile}
          >
            <Ionicons name="person" size={20} color="#fff" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {renderScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  navbar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#4A7856',
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeNavItem: {
    borderBottomWidth: 3,
    borderBottomColor: '#fff',
  },
  navText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    zIndex: 1000,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A7856',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HomeScreen; 