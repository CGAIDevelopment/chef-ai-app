import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRecipeStore } from '../lib/store';
import { ShoppingListItem } from '../lib/types';

interface ShoppingListProps {
  onBack: () => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ onBack }) => {
  const { shoppingList, toggleShoppingListItem, removeFromShoppingList, clearShoppingList, clearCheckedItems } = useRecipeStore();

  // Group items by recipe
  const groupedItems = shoppingList.reduce<Record<string, ShoppingListItem[]>>((acc, item) => {
    if (!acc[item.recipeId]) {
      acc[item.recipeId] = [];
    }
    acc[item.recipeId].push(item);
    return acc;
  }, {});

  const renderItem = ({ item }: { item: ShoppingListItem }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity 
        style={[styles.checkbox, item.isChecked && styles.checkedBox]} 
        onPress={() => toggleShoppingListItem(item.id)}
      >
        {item.isChecked && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      <Text 
        style={[
          styles.itemText, 
          item.isChecked && styles.checkedText
        ]}
      >
        {item.ingredient}
      </Text>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => removeFromShoppingList(item.id)}
      >
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRecipeSection = (recipeId: string, items: ShoppingListItem[]) => {
    // All items in a group have the same recipe name
    const recipeName = items[0].recipeName;
    
    return (
      <View key={recipeId} style={styles.recipeSection}>
        <Text style={styles.recipeName}>{recipeName}</Text>
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping List</Text>
        <View style={styles.placeholder} />
      </View>
      
      {shoppingList.length > 0 ? (
        <>
          <FlatList
            data={Object.entries(groupedItems)}
            renderItem={({ item: [recipeId, items] }) => renderRecipeSection(recipeId, items)}
            keyExtractor={([recipeId]) => recipeId}
            style={styles.list}
            ListHeaderComponent={
              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={clearCheckedItems}
                >
                  <Text style={styles.actionButtonText}>Clear Checked</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.dangerButton]}
                  onPress={clearShoppingList}
                >
                  <Text style={styles.actionButtonText}>Clear All</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Your shopping list is empty
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Add ingredients from recipes to your shopping list
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#4A7856',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    padding: 5,
    width: 40,
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
  },
  placeholder: {
    width: 40,
  },
  list: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionButton: {
    backgroundColor: '#4A7856',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  dangerButton: {
    backgroundColor: '#d9534f',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  recipeSection: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    paddingBottom: 6,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4A7856',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#4A7856',
  },
  checkmark: {
    color: 'white',
    fontWeight: 'bold',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  deleteButton: {
    padding: 6,
  },
  deleteButtonText: {
    color: '#d9534f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});

export default ShoppingList; 