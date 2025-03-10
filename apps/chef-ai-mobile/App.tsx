import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './src/screens/HomeScreen';
import RecipesScreen from './src/screens/RecipesScreen';
import GenerateRecipeScreen from './src/screens/GenerateRecipeScreen';
import RecipeDetail from './src/components/RecipeDetail';
import ShoppingList from './src/components/ShoppingList';
import { Recipe } from './src/lib/types';

// Create a tab navigator
const Tab = createBottomTabNavigator();

export default function App() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showGenerateRecipe, setShowGenerateRecipe] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<string>('home');

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleNavigate = (screen: string) => {
    if (screen === 'shoppingList') {
      setShowShoppingList(true);
    } else if (screen === 'generateRecipe') {
      setShowGenerateRecipe(true);
    } else {
      setCurrentScreen(screen);
    }
  };

  const renderContent = () => {
    if (selectedRecipe) {
      return (
        <RecipeDetail 
          recipe={selectedRecipe} 
          onBack={() => setSelectedRecipe(null)} 
        />
      );
    }

    if (showShoppingList) {
      return (
        <ShoppingList 
          onBack={() => setShowShoppingList(false)} 
        />
      );
    }

    if (showGenerateRecipe) {
      return (
        <GenerateRecipeScreen 
          onBack={() => setShowGenerateRecipe(false)}
          onSelectRecipe={handleSelectRecipe}
        />
      );
    }

    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen 
            onNavigate={handleNavigate} 
            onSelectRecipe={handleSelectRecipe} 
          />
        );
      case 'recipes':
        return (
          <RecipesScreen 
            onSelectRecipe={handleSelectRecipe} 
            onNavigate={handleNavigate}
          />
        );
      case 'mealPlan':
        return (
          <View style={styles.centeredContent}>
            <Text style={styles.comingSoonText}>Meal Plan</Text>
            <Text style={styles.comingSoonSubtext}>Coming soon!</Text>
          </View>
        );
      default:
        return (
          <HomeScreen 
            onNavigate={handleNavigate} 
            onSelectRecipe={handleSelectRecipe} 
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {!selectedRecipe && !showShoppingList && !showGenerateRecipe && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chef AI</Text>
        </View>
      )}
      
      <View style={styles.content}>
        {renderContent()}
      </View>
      
      {!selectedRecipe && !showShoppingList && !showGenerateRecipe && (
        <View style={styles.tabBar}>
          <View 
            style={[styles.tabItem, currentScreen === 'home' && styles.activeTab]} 
            onTouchEnd={() => setCurrentScreen('home')}
          >
            <Text style={styles.tabText}>Home</Text>
          </View>
          <View 
            style={[styles.tabItem, currentScreen === 'recipes' && styles.activeTab]} 
            onTouchEnd={() => setCurrentScreen('recipes')}
          >
            <Text style={styles.tabText}>Recipes</Text>
          </View>
          <View 
            style={[styles.tabItem, currentScreen === 'mealPlan' && styles.activeTab]} 
            onTouchEnd={() => setCurrentScreen('mealPlan')}
          >
            <Text style={styles.tabText}>Meal Plan</Text>
          </View>
          <View 
            style={[styles.tabItem, currentScreen === 'profile' && styles.activeTab]} 
            onTouchEnd={() => setCurrentScreen('profile')}
          >
            <Text style={styles.tabText}>Profile</Text>
          </View>
        </View>
      )}
      
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#4A7856',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
    height: 60,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  activeTab: {
    borderTopWidth: 3,
    borderTopColor: '#4A7856',
  },
  tabText: {
    fontSize: 12,
    color: '#333',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  comingSoonSubtext: {
    fontSize: 16,
    color: '#666',
  },
});
