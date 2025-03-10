import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  View,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeStore } from '../lib/store';
import { Recipe } from '../lib/types';

interface AddToShoppingListButtonProps {
  recipe: Recipe;
  buttonStyle?: 'normal' | 'small';
}

const AddToShoppingListButton: React.FC<AddToShoppingListButtonProps> = ({
  recipe,
  buttonStyle = 'normal',
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const { addToShoppingList } = useRecipeStore();

  // Initialize selected ingredients with all ingredients selected
  const handleOpenModal = () => {
    setSelectedIngredients([...recipe.ingredients]);
    setModalVisible(true);
  };

  // Toggle selection of an ingredient
  const toggleIngredient = (ingredient: string) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(selectedIngredients.filter(item => item !== ingredient));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  // Select or deselect all ingredients
  const toggleSelectAll = () => {
    if (selectedIngredients.length === recipe.ingredients.length) {
      setSelectedIngredients([]);
    } else {
      setSelectedIngredients([...recipe.ingredients]);
    }
  };

  // Add selected ingredients to shopping list
  const handleAddToShoppingList = () => {
    if (selectedIngredients.length === 0) {
      Alert.alert(
        'No Ingredients Selected',
        'Please select at least one ingredient to add to your shopping list.',
        [{ text: 'OK' }]
      );
      return;
    }

    addToShoppingList(recipe.id, selectedIngredients);
    
    Alert.alert(
      'Added to Shopping List',
      `${selectedIngredients.length} ingredient${selectedIngredients.length > 1 ? 's' : ''} added to your shopping list.`,
      [{ text: 'OK' }]
    );
    
    setModalVisible(false);
  };

  // Render an ingredient item in the selection list
  const renderIngredientItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.ingredientItem}
      onPress={() => toggleIngredient(item)}
    >
      <View style={styles.checkbox}>
        {selectedIngredients.includes(item) ? (
          <Ionicons name="checkmark-circle" size={24} color="#4A7856" />
        ) : (
          <Ionicons name="ellipse-outline" size={24} color="#888" />
        )}
      </View>
      <Text style={styles.ingredientText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[
          styles.button,
          buttonStyle === 'small' ? styles.smallButton : styles.normalButton
        ]}
        onPress={handleOpenModal}
      >
        <Ionicons
          name="cart-outline"
          size={buttonStyle === 'small' ? 18 : 20}
          color="#FFFFFF"
          style={styles.buttonIcon}
        />
        <Text style={[
          styles.buttonText,
          buttonStyle === 'small' ? styles.smallButtonText : styles.normalButtonText
        ]}>
          Add to Shopping List
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Ingredients</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.selectAllButton}
              onPress={toggleSelectAll}
            >
              <Text style={styles.selectAllText}>
                {selectedIngredients.length === recipe.ingredients.length
                  ? 'Deselect All'
                  : 'Select All'}
              </Text>
            </TouchableOpacity>

            <FlatList
              data={recipe.ingredients}
              renderItem={renderIngredientItem}
              keyExtractor={(item, index) => `ingredient-${index}`}
              style={styles.ingredientsList}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.addButton,
                  selectedIngredients.length === 0 && styles.disabledButton
                ]}
                onPress={handleAddToShoppingList}
                disabled={selectedIngredients.length === 0}
              >
                <Text style={styles.addButtonText}>
                  Add {selectedIngredients.length > 0 && `(${selectedIngredients.length})`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A7856',
    borderRadius: 8,
  },
  normalButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  normalButtonText: {
    fontSize: 16,
  },
  smallButtonText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#888888',
  },
  selectAllButton: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  selectAllText: {
    fontSize: 16,
    color: '#4A7856',
    fontWeight: '500',
  },
  ingredientsList: {
    flex: 1,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  ingredientText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    padding: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  addButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#4A7856',
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  addButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default AddToShoppingListButton; 