import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, UserPreferences, KitchenEquipment, COMMON_EQUIPMENT } from "./types"
import * as React from "react"

interface UserStore {
  currentUser: User | null
  users: User[]
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // User management
  registerUser: (userData: Partial<User>) => Promise<User>
  loginUser: (username: string, password: string) => Promise<User>
  loginWithDemo: () => Promise<User>
  logoutUser: () => void
  getCurrentUser: () => User | null
  
  // User preferences
  updateUserPreferences: (userId: string, preferences: Partial<UserPreferences>) => Promise<void>
  getUserPreferences: (userId: string) => UserPreferences | null
  
  // User profile
  updateUserAvatar: (userId: string, avatarPath: string) => Promise<void>
}

const DEFAULT_PREFERENCES: UserPreferences = {
  dietaryRestrictions: ["none"],
  allergies: [],
  cookingSkillLevel: "beginner",
  kitchenEquipment: [
    "Oven", 
    "Stovetop", 
    "Microwave"
  ].map(name => ({ name, available: true })),
  servingSizePreference: 2,
  flavorPreferences: [],
  cuisinePreferences: []
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // User management functions
      registerUser: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, we would call an API endpoint here
          const newUser: User = {
            id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            username: userData.username || 'user',
            email: userData.email || '',
            name: userData.name,
            createdAt: Date.now(),
            preferences: userData.preferences || DEFAULT_PREFERENCES,
            avatar: userData.avatar || `/avatars/default-${Math.ceil(Math.random() * 5)}.png`,
          };
          
          set(state => ({ 
            users: [...state.users, newUser],
            currentUser: newUser,
            isAuthenticated: true,
            isLoading: false 
          }));
          
          return newUser;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to register user";
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },
      
      loginUser: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, we would authenticate against an API
          const user = get().users.find(u => u.username === username);
          
          if (!user) {
            throw new Error("User not found");
          }
          
          // In a real app, we would verify the password here
          
          set({ 
            currentUser: user,
            isAuthenticated: true,
            isLoading: false 
          });
          
          return user;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to login";
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },
      
      loginWithDemo: async () => {
        set({ isLoading: true, error: null });
        try {
          // Create a demo user if it doesn't exist
          let demoUser = get().users.find(u => u.username === 'demo');
          
          if (!demoUser) {
            demoUser = {
              id: `user-demo-${Date.now()}`,
              username: 'demo',
              email: 'demo@example.com',
              name: 'Demo User',
              createdAt: Date.now(),
              preferences: {
                ...DEFAULT_PREFERENCES,
                dietaryRestrictions: ["vegetarian"],
                cookingSkillLevel: "intermediate",
                kitchenEquipment: [
                  "Oven", 
                  "Stovetop", 
                  "Microwave",
                  "Blender",
                  "Slow cooker"
                ].map(name => ({ name, available: true })),
                cuisinePreferences: ["Italian", "Indian", "Thai"]
              },
              avatar: '/avatars/default-1.png',
            };
            
            set(state => ({ 
              users: [...state.users, demoUser!]
            }));
          }
          
          set({ 
            currentUser: demoUser,
            isAuthenticated: true,
            isLoading: false 
          });
          
          return demoUser;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to login with demo account";
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },
      
      logoutUser: () => {
        set({ 
          currentUser: null,
          isAuthenticated: false
        });
      },
      
      getCurrentUser: () => {
        return get().currentUser;
      },
      
      // User preferences
      updateUserPreferences: async (userId, preferences) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, we would call an API endpoint here
          set(state => {
            const updatedUsers = state.users.map(user => {
              if (user.id === userId) {
                return {
                  ...user,
                  preferences: {
                    ...user.preferences,
                    ...preferences
                  }
                };
              }
              return user;
            });
            
            // Also update currentUser if it's the same user
            const updatedCurrentUser = 
              state.currentUser && state.currentUser.id === userId
                ? {
                    ...state.currentUser,
                    preferences: {
                      ...state.currentUser.preferences,
                      ...preferences
                    }
                  }
                : state.currentUser;
            
            return { 
              users: updatedUsers,
              currentUser: updatedCurrentUser,
              isLoading: false 
            };
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to update preferences";
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },
      
      getUserPreferences: (userId) => {
        const user = get().users.find(u => u.id === userId);
        return user ? user.preferences : null;
      },
      
      // User profile
      updateUserAvatar: async (userId, avatarPath) => {
        set({ isLoading: true, error: null });
        try {
          set(state => {
            const updatedUsers = state.users.map(user => {
              if (user.id === userId) {
                return {
                  ...user,
                  avatar: avatarPath
                };
              }
              return user;
            });
            
            // Also update currentUser if it's the same user
            const updatedCurrentUser = 
              state.currentUser && state.currentUser.id === userId
                ? {
                    ...state.currentUser,
                    avatar: avatarPath
                  }
                : state.currentUser;
            
            return { 
              users: updatedUsers,
              currentUser: updatedCurrentUser,
              isLoading: false 
            };
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to update avatar";
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      }
    }),
    {
      name: "chef-ai-user-storage"
    }
  )
);

// Custom React hook for accessing the user state throughout the app
export function useUser() {
  const { 
    currentUser,
    isAuthenticated, 
    registerUser,
    loginUser,
    loginWithDemo,
    logoutUser,
    updateUserPreferences,
    updateUserAvatar
  } = useUserStore();
  
  return {
    user: currentUser,
    isAuthenticated,
    register: registerUser,
    login: loginUser,
    loginDemo: loginWithDemo,
    logout: logoutUser,
    updatePreferences: (preferences: Partial<UserPreferences>) => 
      currentUser ? updateUserPreferences(currentUser.id, preferences) : Promise.reject("No user logged in"),
    updateAvatar: (avatarPath: string) =>
      currentUser ? updateUserAvatar(currentUser.id, avatarPath) : Promise.reject("No user logged in")
  };
} 