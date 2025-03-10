import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { Recipe } from '../lib/types';
import { useRecipeStore } from '../lib/store';
import RecipeCard from '../components/RecipeCard';
import RecipeDetailScreen from './RecipeDetailScreen';

interface RecipeListScreenProps {
  onSelectRecipe: (recipe: Recipe) => void;
}

const RecipeListScreen: React.FC<RecipeListScreenProps> = ({ onSelectRecipe }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const { recipes, isLoading, fetchRecipes, updateRecipe } = useRecipeStore();
  const [showAllRecipes, setShowAllRecipes] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Helper function to ensure uniqueness of recipes by ID
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
    recipes.filter((recipe) => {
      // Filter by search query
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by category
      const matchesFilter = filter === 'all' || recipe.status === filter;
      
      return matchesSearch && matchesFilter;
    })
  );

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };
  
  const handleRecipeUpdate = (updatedRecipe: Recipe) => {
    updateRecipe(updatedRecipe);
    
    // If onSelectRecipe prop was provided, call it with the updated recipe
    if (onSelectRecipe && selectedRecipe?.id === updatedRecipe.id) {
      onSelectRecipe(updatedRecipe);
    }
    
    // Update local selected recipe
    setSelectedRecipe(null);
  };
  
  const closeRecipeDetail = () => {
    setSelectedRecipe(null);
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <View style={styles.recipeCardContainer}>
      <RecipeCard
        recipe={item}
        onPress={handleRecipeSelect}
      />
    </View>
  );

  const renderHorizontalRecipeCard = ({ item }: { item: Recipe }) => (
    <RecipeCard
      recipe={item}
      onPress={handleRecipeSelect}
      horizontal={true}
    />
  );

  const renderSuggestedRecipes = () => (
    <View style={styles.suggestedSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Suggested Recipes</Text>
        <TouchableOpacity onPress={() => setShowAllRecipes(true)}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      
      {recipes.length > 0 ? (
        <FlatList
          data={getUniqueRecipes(recipes.slice(0, 3))}
          renderItem={renderHorizontalRecipeCard}
          keyExtractor={item => `suggested-${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalRecipeList}
        />
      ) : (
        <View style={styles.emptyStateBanner}>
          <Text style={styles.emptyStateText}>No recipes yet</Text>
        </View>
      )}
    </View>
  );

  const renderFavoriteRecipes = () => {
    const favoriteRecipes = recipes.filter(recipe => recipe.status === 'favorites');
    
    return (
      <View style={styles.suggestedSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Favorite Recipes</Text>
          <TouchableOpacity onPress={() => {
            setFilter('favorites');
            setShowAllRecipes(true);
          }}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        
        {favoriteRecipes.length > 0 ? (
          <FlatList
            data={getUniqueRecipes(favoriteRecipes.slice(0, 3))}
            renderItem={renderHorizontalRecipeCard}
            keyExtractor={item => `favorite-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalRecipeList}
          />
        ) : (
          <View style={styles.emptyStateBanner}>
            <Text style={styles.emptyStateText}>No favorite recipes</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCookingTips = () => (
    <View style={styles.tipsSection}>
      <Text style={styles.sectionTitle}>Cooking Tips</Text>
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Knife Skills</Text>
        <Text style={styles.tipText}>
          Sharp knives are safer than dull ones. Remember to keep your fingers tucked when chopping.
        </Text>
      </View>
    </View>
  );

  const renderRecipeDetailModal = () => (
    <Modal
      visible={selectedRecipe !== null}
      animationType="slide"
      onRequestClose={closeRecipeDetail}
    >
      {selectedRecipe && (
        <RecipeDetailScreen
          recipe={selectedRecipe}
          onBack={closeRecipeDetail}
          onRecipeUpdate={handleRecipeUpdate}
        />
      )}
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A7856" />
        <Text style={styles.loadingText}>Loading recipes...</Text>
      </View>
    );
  }

  if (!showAllRecipes) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Recipes</Text>
        </View>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setShowAllRecipes(text.length > 0);
            }}
            clearButtonMode="while-editing"
          />
        </View>
        
        {renderSuggestedRecipes()}
        {renderFavoriteRecipes()}
        {renderCookingTips()}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Recipes</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'favorites' && styles.activeFilter]}
          onPress={() => setFilter('favorites')}
        >
          <Text style={[styles.filterText, filter === 'favorites' && styles.activeFilterText]}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'recent' && styles.activeFilter]}
          onPress={() => setFilter('recent')}
        >
          <Text style={[styles.filterText, filter === 'recent' && styles.activeFilterText]}>Recent</Text>
        </TouchableOpacity>
      </View>
      
      {filteredRecipes.length > 0 ? (
        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipeCard}
          keyExtractor={item => `all-${item.id}`}
          contentContainerStyle={styles.recipeList}
          showsVerticalScrollIndicator={false}
          numColumns={2}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recipes found</Text>
          <Text style={styles.emptyDescription}>
            {searchQuery
              ? `No recipes match "${searchQuery}"`
              : "You haven't created any recipes yet. Tap the + button to get started!"}
          </Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => {
          setSearchQuery('');
          setShowAllRecipes(false);
        }}
      >
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
      
      {renderRecipeDetailModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    backgroundColor: '#4A7856',
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  activeFilter: {
    backgroundColor: '#4A7856',
  },
  filterText: {
    fontSize: 14,
    color: '#333333',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  recipeList: {
    padding: 8,
  },
  horizontalRecipeList: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 8,
  },
  recipeCardContainer: {
    width: '50%',
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  suggestedSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  seeAllText: {
    color: '#4A7856',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyStateBanner: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
  },
  tipsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  backButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#4A7856',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RecipeListScreen; 