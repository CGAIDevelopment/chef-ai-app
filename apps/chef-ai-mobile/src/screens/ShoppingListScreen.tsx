import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeStore } from '../lib/store';
import { ShoppingListItem } from '../lib/types';

interface ShoppingListScreenProps {
  onBack: () => void;
}

const ShoppingListScreen: React.FC<ShoppingListScreenProps> = ({ onBack }) => {
  const { 
    shoppingList, 
    toggleShoppingListItem, 
    removeFromShoppingList, 
    clearShoppingList,
    clearCheckedItems,
  } = useRecipeStore();
  
  const [filter, setFilter] = useState<'all' | 'unchecked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newItem, setNewItem] = useState('');
  
  // Use regular useEffect instead of useFocusEffect
  useEffect(() => {
    // Any setup code can go here
    return () => {
      // Any cleanup code can go here
    };
  }, []);

  // Filter shopping list items
  const filteredItems = shoppingList
    .filter(item => {
      // Filter by checked/unchecked status
      if (filter === 'unchecked' && item.isChecked) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery) {
        const normalizedQuery = searchQuery.toLowerCase();
        return (
          item.ingredient.toLowerCase().includes(normalizedQuery) ||
          item.recipeName.toLowerCase().includes(normalizedQuery)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by checked status (unchecked first)
      if (a.isChecked !== b.isChecked) {
        return a.isChecked ? 1 : -1;
      }
      // Then sort by recipe name
      if (a.recipeName !== b.recipeName) {
        return a.recipeName.localeCompare(b.recipeName);
      }
      // Then sort by added date (newest first)
      return b.addedAt - a.addedAt;
    });

  // Group items by recipe
  const groupedItems: { [key: string]: ShoppingListItem[] } = {};
  filteredItems.forEach(item => {
    if (!groupedItems[item.recipeName]) {
      groupedItems[item.recipeName] = [];
    }
    groupedItems[item.recipeName].push(item);
  });

  // Handle adding a new item
  const handleAddItem = () => {
    if (!newItem.trim()) return;
    
    const item: ShoppingListItem = {
      id: Math.random().toString(36).substring(7), // Simple ID generation
      ingredient: newItem.trim(),
      recipeId: 'manual', // Special ID for manually added items
      recipeName: 'Custom Items',
      isChecked: false,
      addedAt: Date.now(),
    };
    
    // Add to shopping list using the proper method - create a fake "recipe" with a single ingredient
    const updatedList = [...shoppingList, item];
    useRecipeStore.setState({ shoppingList: updatedList });
    
    setNewItem('');
  };

  // Handle clearing all items
  const handleClearAll = () => {
    Alert.alert(
      'Clear Shopping List',
      'Are you sure you want to clear your entire shopping list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          onPress: clearShoppingList,
          style: 'destructive' 
        },
      ]
    );
  };

  // Handle clearing checked items
  const handleClearChecked = () => {
    Alert.alert(
      'Clear Checked Items',
      'Remove all checked items from your shopping list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Checked', 
          onPress: clearCheckedItems 
        },
      ]
    );
  };

  // Render a recipe group header
  const renderRecipeHeader = (recipeName: string) => (
    <View style={styles.recipeHeader}>
      <Text style={styles.recipeHeaderText}>{recipeName}</Text>
    </View>
  );

  // Render a shopping list item
  const renderItem = ({ item }: { item: ShoppingListItem }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleShoppingListItem(item.id)}
      >
        {item.isChecked ? (
          <Ionicons name="checkmark-circle" size={24} color="#4A7856" />
        ) : (
          <Ionicons name="ellipse-outline" size={24} color="#888" />
        )}
      </TouchableOpacity>
      
      <Text 
        style={[
          styles.itemText, 
          item.isChecked && styles.checkedItem
        ]}
        numberOfLines={2}
      >
        {item.ingredient}
      </Text>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => removeFromShoppingList(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF5252" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping List</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.actionsContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search ingredients..."
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
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filter === 'unchecked' && styles.activeFilter]}
            onPress={() => setFilter('unchecked')}
          >
            <Text style={[styles.filterText, filter === 'unchecked' && styles.activeFilterText]}>
              Unchecked
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearChecked}
          >
            <Text style={styles.clearButtonText}>Clear Checked</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.clearButton, styles.clearAllButton]}
            onPress={handleClearAll}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.addItemContainer}>
        <TextInput
          style={styles.addItemInput}
          placeholder="Add item to shopping list..."
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={handleAddItem}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddItem}
          disabled={!newItem.trim()}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      
      {Object.keys(groupedItems).length > 0 ? (
        <FlatList
          data={Object.keys(groupedItems)}
          keyExtractor={(item) => item}
          renderItem={({ item: recipeName }) => (
            <View style={styles.recipeGroup}>
              {renderRecipeHeader(recipeName)}
              {groupedItems[recipeName].map((item) => (
                <View key={item.id}>
                  {renderItem({ item })}
                </View>
              ))}
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Your shopping list is empty</Text>
          <Text style={styles.emptySubtext}>
            Add items manually or from recipes
          </Text>
        </View>
      )}
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
  actionsContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#4A7856',
  },
  filterText: {
    fontSize: 14,
    color: '#666666',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  clearAllButton: {
    backgroundColor: '#FFE5E5',
    marginRight: 0,
  },
  clearButtonText: {
    color: '#666666',
    fontWeight: '500',
  },
  addItemContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  addItemInput: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#4A7856',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  recipeGroup: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeHeader: {
    backgroundColor: '#E6F0EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  recipeHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A7856',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  checkbox: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  checkedItem: {
    textDecorationLine: 'line-through',
    color: '#888888',
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#888888',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888888',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ShoppingListScreen; 