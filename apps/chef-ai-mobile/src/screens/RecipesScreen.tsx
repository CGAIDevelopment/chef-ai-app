import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRecipeStore } from '../lib/store';
import RecipeCard from '../components/RecipeCard';
import { Recipe, RecipeStatus } from '../lib/types';

interface RecipesScreenProps {
  onSelectRecipe: (recipe: Recipe) => void;
  onNavigate?: (screen: string) => void;
}

const RecipesScreen: React.FC<RecipesScreenProps> = ({ onSelectRecipe, onNavigate }) => {
  const { recipes, isLoading, fetchRecipes } = useRecipeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<RecipeStatus>('all');
  
  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);
  
  // Make sure we don't have duplicates in the filtered recipes by using a Set with IDs
  const getUniqueRecipes = (recipeList: Recipe[]): Recipe[] => {
    const uniqueIds = new Set<string>();
    return recipeList.filter(recipe => {
      if (uniqueIds.has(recipe.id)) {
        return false;
      }
      uniqueIds.add(recipe.id);
      return true;
    });
  };
  
  const filteredRecipes = getUniqueRecipes(
    recipes
      .filter(recipe => 
        activeFilter === 'all' ? true : recipe.status === activeFilter
      )
      .filter(recipe => 
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()))
      )
  );
  
  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <RecipeCard
      recipe={item}
      onPress={onSelectRecipe}
    />
  );
  
  const FilterTab = ({ status, label }: { status: RecipeStatus, label: string }) => (
    <TouchableOpacity
      style={[styles.filterTab, activeFilter === status && styles.activeFilterTab]}
      onPress={() => setActiveFilter(status)}
    >
      <Text
        style={[styles.filterTabText, activeFilter === status && styles.activeFilterTabText]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const handleGenerateRecipe = () => {
    if (onNavigate) {
      onNavigate('generateRecipe');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {onNavigate && (
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateRecipe}
          >
            <Text style={styles.generateButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterTab status="all" label="All" />
          <FilterTab status="private" label="My Recipes" />
          <FilterTab status="to-try" label="To Try" />
          <FilterTab status="meal-plan" label="Meal Plan" />
        </ScrollView>
      </View>
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#4A7856" style={styles.loader} />
      ) : filteredRecipes.length > 0 ? (
        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => `recipe-${item.id}`}
          contentContainerStyle={styles.recipesList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {searchQuery 
              ? `No recipes found for "${searchQuery}"`
              : 'No recipes in this category yet'}
          </Text>
          {!searchQuery && onNavigate && (
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={handleGenerateRecipe}
            >
              <Text style={styles.emptyStateButtonText}>Generate New Recipe</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    flex: 1,
  },
  generateButton: {
    width: 40,
    height: 40,
    backgroundColor: '#4A7856',
    borderRadius: 20,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilterTab: {
    backgroundColor: '#4A7856',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  recipesList: {
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: '#4A7856',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RecipesScreen; 