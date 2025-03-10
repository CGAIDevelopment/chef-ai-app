import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Recipe } from '../lib/types';
import { useRecipeStore } from '../lib/store';
import AddMealPlanModal from '../components/AddMealPlanModal';
import RecipeSelectionModal from '../components/RecipeSelectionModal';

interface MealPlanScreenProps {
  onBack: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

interface MealPlan {
  id: string;
  name: string;
  days: MealPlanDay[];
}

interface MealPlanDay {
  id: string;
  name: string;
  breakfast: string | null;
  lunch: string | null;
  dinner: string | null;
  snacks: string[];
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_PLAN_STORAGE_KEY = 'chef_ai_meal_plans';

const MealPlanScreen: React.FC<MealPlanScreenProps> = ({ 
  onBack,
  onSelectRecipe
}) => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddingPlan, setIsAddingPlan] = useState<boolean>(false);
  const [newPlanName, setNewPlanName] = useState<string>('');
  
  // Recipe selection modal state
  const [recipeModalVisible, setRecipeModalVisible] = useState<boolean>(false);
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedMealCategory, setSelectedMealCategory] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  
  const { recipes } = useRecipeStore();

  // Load meal plans from storage
  useEffect(() => {
    loadMealPlans();
  }, []);

  const loadMealPlans = async () => {
    try {
      setIsLoading(true);
      const storedPlans = await AsyncStorage.getItem(MEAL_PLAN_STORAGE_KEY);
      
      if (storedPlans) {
        setMealPlans(JSON.parse(storedPlans));
      } else {
        // Create a default meal plan if none exists
        const defaultPlan = createDefaultMealPlan();
        setMealPlans([defaultPlan]);
        await saveMealPlans([defaultPlan]);
      }
    } catch (error) {
      console.error('Error loading meal plans:', error);
      Alert.alert('Error', 'Failed to load meal plans');
    } finally {
      setIsLoading(false);
    }
  };

  const saveMealPlans = async (plans: MealPlan[]) => {
    try {
      await AsyncStorage.setItem(MEAL_PLAN_STORAGE_KEY, JSON.stringify(plans));
    } catch (error) {
      console.error('Error saving meal plans:', error);
      Alert.alert('Error', 'Failed to save meal plans');
    }
  };

  const createDefaultMealPlan = (): MealPlan => {
    return {
      id: uuidv4(),
      name: 'Weekly Meal Plan',
      days: DAYS_OF_WEEK.map(day => ({
        id: uuidv4(),
        name: day,
        breakfast: null,
        lunch: null,
        dinner: null,
        snacks: []
      }))
    };
  };

  const createNewMealPlan = (name: string) => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for your meal plan');
      return;
    }

    const newPlan: MealPlan = {
      id: uuidv4(),
      name: name.trim(),
      days: DAYS_OF_WEEK.map(day => ({
        id: uuidv4(),
        name: day,
        breakfast: null,
        lunch: null,
        dinner: null,
        snacks: []
      }))
    };

    const updatedPlans = [...mealPlans, newPlan];
    setMealPlans(updatedPlans);
    saveMealPlans(updatedPlans);
    setSelectedPlanIndex(updatedPlans.length - 1);
  };

  const deleteMealPlan = (index: number) => {
    Alert.alert(
      'Delete Meal Plan',
      `Are you sure you want to delete ${mealPlans[index].name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedPlans = [...mealPlans];
            updatedPlans.splice(index, 1);
            setMealPlans(updatedPlans);
            saveMealPlans(updatedPlans);
            
            // Adjust selected index if needed
            if (selectedPlanIndex >= updatedPlans.length) {
              setSelectedPlanIndex(Math.max(0, updatedPlans.length - 1));
            }
          },
        },
      ]
    );
  };

  const addRecipeToMeal = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner', recipeId: string) => {
    const updatedPlans = [...mealPlans];
    updatedPlans[selectedPlanIndex].days[dayIndex][mealType] = recipeId;
    setMealPlans(updatedPlans);
    saveMealPlans(updatedPlans);
  };

  const addRecipeToSnacks = (dayIndex: number, recipeId: string) => {
    const updatedPlans = [...mealPlans];
    updatedPlans[selectedPlanIndex].days[dayIndex].snacks.push(recipeId);
    setMealPlans(updatedPlans);
    saveMealPlans(updatedPlans);
  };

  const removeRecipeFromMeal = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    const updatedPlans = [...mealPlans];
    updatedPlans[selectedPlanIndex].days[dayIndex][mealType] = null;
    setMealPlans(updatedPlans);
    saveMealPlans(updatedPlans);
  };

  const removeSnack = (dayIndex: number, snackIndex: number) => {
    const updatedPlans = [...mealPlans];
    updatedPlans[selectedPlanIndex].days[dayIndex].snacks.splice(snackIndex, 1);
    setMealPlans(updatedPlans);
    saveMealPlans(updatedPlans);
  };

  const showAddRecipeOptions = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    // Check if there are any recipes available
    if (recipes.length === 0) {
      Alert.alert(
        'No Recipes',
        'You don\'t have any recipes yet. Create some recipes first!',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Set state for recipe selection modal
    setSelectedDayIndex(dayIndex);
    setSelectedMealCategory(mealType);
    setSelectedMealType(mealType.charAt(0).toUpperCase() + mealType.slice(1));
    setRecipeModalVisible(true);
  };
  
  const handleRecipeSelect = (recipe: Recipe) => {
    if (selectedMealCategory === 'snack') {
      addRecipeToSnacks(selectedDayIndex, recipe.id);
    } else {
      addRecipeToMeal(selectedDayIndex, selectedMealCategory, recipe.id);
    }
  };

  const getRecipeById = (recipeId: string): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === recipeId);
  };

  const renderMealPlanSelector = () => (
    <View style={styles.planSelectorContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.planSelectorContent}
      >
        {mealPlans.map((plan, index) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planTab,
              selectedPlanIndex === index && styles.selectedPlanTab
            ]}
            onPress={() => setSelectedPlanIndex(index)}
          >
            <Text 
              style={[
                styles.planTabText,
                selectedPlanIndex === index && styles.selectedPlanTabText
              ]}
            >
              {plan.name}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.planTab, styles.addPlanTab]}
          onPress={() => setIsAddingPlan(true)}
        >
          <Text style={styles.addPlanText}>+ New Plan</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderMealCell = (dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner', mealTitle: string) => {
    const selectedPlan = mealPlans[selectedPlanIndex];
    const recipeId = selectedPlan.days[dayIndex][mealType];
    const recipe = recipeId ? getRecipeById(recipeId) : null;

    return (
      <View style={styles.mealCell}>
        <Text style={styles.mealTitle}>{mealTitle}</Text>
        {recipe ? (
          <View style={styles.assignedRecipe}>
            <Text style={styles.recipeName}>{recipe.title}</Text>
            <View style={styles.recipeActions}>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => onSelectRecipe(recipe)}
              >
                <Text style={styles.viewButtonText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeRecipeFromMeal(dayIndex, mealType)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addMealButton}
            onPress={() => showAddRecipeOptions(dayIndex, mealType)}
          >
            <Text style={styles.addMealButtonText}>+ Add Recipe</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSnacks = (dayIndex: number) => {
    const selectedPlan = mealPlans[selectedPlanIndex];
    const snackIds = selectedPlan.days[dayIndex].snacks;

    return (
      <View style={styles.snacksContainer}>
        <Text style={styles.mealTitle}>Snacks</Text>
        {snackIds.map((snackId, index) => {
          const recipe = getRecipeById(snackId);
          if (!recipe) return null;

          return (
            <View key={`${snackId}-${index}`} style={styles.assignedRecipe}>
              <Text style={styles.recipeName}>{recipe.title}</Text>
              <View style={styles.recipeActions}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => onSelectRecipe(recipe)}
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeSnack(dayIndex, index)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        <TouchableOpacity
          style={styles.addMealButton}
          onPress={() => showAddRecipeOptions(dayIndex, 'snack')}
        >
          <Text style={styles.addMealButtonText}>+ Add Snack</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDay = (day: MealPlanDay, index: number) => (
    <View key={day.id} style={styles.dayContainer}>
      <Text style={styles.dayTitle}>{day.name}</Text>
      {renderMealCell(index, 'breakfast', 'Breakfast')}
      {renderMealCell(index, 'lunch', 'Lunch')}
      {renderMealCell(index, 'dinner', 'Dinner')}
      {renderSnacks(index)}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meal Plans</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A7856" />
          <Text style={styles.loadingText}>Loading meal plans...</Text>
        </View>
      </View>
    );
  }

  if (mealPlans.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meal Plans</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No meal plans found</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setIsAddingPlan(true)}
          >
            <Text style={styles.createButtonText}>Create Meal Plan</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const selectedPlan = mealPlans[selectedPlanIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meal Plans</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteMealPlan(selectedPlanIndex)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {renderMealPlanSelector()}

      <ScrollView style={styles.content}>
        {selectedPlan.days.map((day, index) => renderDay(day, index))}
      </ScrollView>
      
      {/* Add Meal Plan Modal */}
      <AddMealPlanModal 
        visible={isAddingPlan}
        onClose={() => setIsAddingPlan(false)}
        onSave={createNewMealPlan}
      />
      
      {/* Recipe Selection Modal */}
      <RecipeSelectionModal
        visible={recipeModalVisible}
        onClose={() => setRecipeModalVisible(false)}
        onSelectRecipe={handleRecipeSelect}
        recipes={recipes}
        mealType={selectedMealType}
      />
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
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#FF5252',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
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
    fontSize: 18,
    color: '#666666',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#4A7856',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  planSelectorContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  planSelectorContent: {
    paddingHorizontal: 16,
  },
  planTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
  },
  selectedPlanTab: {
    backgroundColor: '#4A7856',
  },
  planTabText: {
    fontSize: 14,
    color: '#333333',
  },
  selectedPlanTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addPlanTab: {
    backgroundColor: '#E6F0EB',
  },
  addPlanText: {
    fontSize: 14,
    color: '#4A7856',
  },
  dayContainer: {
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
  dayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 8,
  },
  mealCell: {
    marginBottom: 12,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A7856',
    marginBottom: 8,
  },
  addMealButton: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderStyle: 'dashed',
  },
  addMealButtonText: {
    color: '#4A7856',
    fontSize: 14,
  },
  assignedRecipe: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  recipeName: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  recipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#4A7856',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginRight: 8,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  removeButton: {
    backgroundColor: '#FF5252',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  snacksContainer: {
    marginTop: 8,
  },
});

export default MealPlanScreen; 