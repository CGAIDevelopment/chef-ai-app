import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, DietaryRestriction, SkillLevel, KitchenEquipment } from './types';

// Storage key for user data
const USER_STORAGE_KEY = 'chef_ai_user_profile';

// Default user data
const defaultUser: User = {
  id: '1',
  username: 'chef_user',
  email: 'user@example.com',
  name: 'Chef User',
  createdAt: Date.now(),
  preferences: {
    dietaryRestrictions: ['none'],
    allergies: [],
    cookingSkillLevel: 'intermediate',
    kitchenEquipment: [
      { name: 'Oven', available: true },
      { name: 'Stovetop', available: true },
      { name: 'Microwave', available: true },
      { name: 'Blender', available: false },
      { name: 'Food Processor', available: false },
      { name: 'Stand Mixer', available: false },
      { name: 'Pressure Cooker', available: false },
      { name: 'Slow Cooker', available: true },
    ],
    servingSizePreference: 4,
    flavorPreferences: ['savory', 'spicy'],
    cuisinePreferences: ['Italian', 'Mexican', 'Asian'],
  },
  avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
};

interface UserState {
  user: User;
  isLoading: boolean;
  error: string | null;

  // Profile actions
  updateUserProfile: (updates: Partial<User>) => void;
  
  // Preference actions
  toggleDietaryRestriction: (restriction: DietaryRestriction) => void;
  setSkillLevel: (level: SkillLevel) => void;
  toggleKitchenEquipment: (equipmentName: string) => void;
  updateServingSizePreference: (size: number) => void;
  addCuisinePreference: (cuisine: string) => void;
  removeCuisinePreference: (cuisine: string) => void;
  updateAllergies: (allergies: string[]) => void;
  updateFlavorPreferences: (flavors: string[]) => void;
  
  // Load and initialize
  loadUserData: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: defaultUser,
  isLoading: true,
  error: null,

  // Load user data from AsyncStorage
  loadUserData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      
      if (storedUser) {
        set({ user: JSON.parse(storedUser), isLoading: false });
      } else {
        // Save default user if none exists
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUser));
        set({ user: defaultUser, isLoading: false });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      set({ error: 'Failed to load user data', isLoading: false });
    }
  },

  // Save user data to AsyncStorage
  saveUserData: async (updatedUser: User) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      set({ error: 'Failed to save user data' });
      return false;
    }
  },

  // Update user profile
  updateUserProfile: (updates: Partial<User>) => {
    const currentUser = get().user;
    const updatedUser = { ...currentUser, ...updates };
    
    // Don't allow direct modification of preferences through this method
    if (updates.preferences) {
      delete updates.preferences;
    }
    
    set({ user: updatedUser });
    get().saveUserData(updatedUser);
  },

  // Toggle dietary restriction
  toggleDietaryRestriction: (restriction: DietaryRestriction) => {
    const currentUser = get().user;
    const updatedUser = { ...currentUser };
    
    const currentRestrictions = [...updatedUser.preferences.dietaryRestrictions];

    // Remove 'none' if we're adding a specific restriction
    if (restriction !== 'none' && currentRestrictions.includes('none')) {
      const noneIndex = currentRestrictions.indexOf('none');
      currentRestrictions.splice(noneIndex, 1);
    }

    // If selecting 'none', clear all other restrictions
    if (restriction === 'none') {
      updatedUser.preferences.dietaryRestrictions = ['none'];
    } else {
      // Toggle the selected restriction
      const index = currentRestrictions.indexOf(restriction);
      if (index > -1) {
        currentRestrictions.splice(index, 1);
        
        // If no restrictions left, add 'none'
        if (currentRestrictions.length === 0) {
          currentRestrictions.push('none');
        }
      } else {
        currentRestrictions.push(restriction);
      }
      
      updatedUser.preferences.dietaryRestrictions = currentRestrictions;
    }

    set({ user: updatedUser });
    get().saveUserData(updatedUser);
  },

  // Set cooking skill level
  setSkillLevel: (level: SkillLevel) => {
    const currentUser = get().user;
    const updatedUser = { ...currentUser };
    
    updatedUser.preferences.cookingSkillLevel = level;
    
    set({ user: updatedUser });
    get().saveUserData(updatedUser);
  },

  // Toggle kitchen equipment availability
  toggleKitchenEquipment: (equipmentName: string) => {
    const currentUser = get().user;
    const updatedUser = { ...currentUser };
    
    const equipment = updatedUser.preferences.kitchenEquipment.find(
      (e) => e.name === equipmentName
    );

    if (equipment) {
      equipment.available = !equipment.available;
      
      set({ user: updatedUser });
      get().saveUserData(updatedUser);
    }
  },

  // Update serving size preference
  updateServingSizePreference: (size: number) => {
    const currentUser = get().user;
    const updatedUser = { ...currentUser };
    
    updatedUser.preferences.servingSizePreference = size;
    
    set({ user: updatedUser });
    get().saveUserData(updatedUser);
  },

  // Add cuisine preference
  addCuisinePreference: (cuisine: string) => {
    const currentUser = get().user;
    const updatedUser = { ...currentUser };
    
    if (!updatedUser.preferences.cuisinePreferences.includes(cuisine)) {
      updatedUser.preferences.cuisinePreferences.push(cuisine);
      
      set({ user: updatedUser });
      get().saveUserData(updatedUser);
    }
  },

  // Remove cuisine preference
  removeCuisinePreference: (cuisine: string) => {
    const currentUser = get().user;
    const updatedUser = { ...currentUser };
    
    const index = updatedUser.preferences.cuisinePreferences.indexOf(cuisine);
    if (index > -1) {
      updatedUser.preferences.cuisinePreferences.splice(index, 1);
      
      set({ user: updatedUser });
      get().saveUserData(updatedUser);
    }
  },

  // Update allergies
  updateAllergies: (allergies: string[]) => {
    const currentUser = get().user;
    const updatedUser = { ...currentUser };
    
    updatedUser.preferences.allergies = allergies;
    
    set({ user: updatedUser });
    get().saveUserData(updatedUser);
  },

  // Update flavor preferences
  updateFlavorPreferences: (flavors: string[]) => {
    const currentUser = get().user;
    const updatedUser = { ...currentUser };
    
    updatedUser.preferences.flavorPreferences = flavors;
    
    set({ user: updatedUser });
    get().saveUserData(updatedUser);
  },
})); 