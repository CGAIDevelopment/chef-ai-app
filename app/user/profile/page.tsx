"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { Edit, Clock, ChefHat, Utensils, Heart, Star, Calendar, ArrowRight, CookingPot, BookOpen, Settings, Globe, User, UtensilsCrossed, CalendarClock, Bookmark } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/lib/userStore"
import { useRecipeStore } from "@/lib/store"
import Sidebar from "@/components/Sidebar"
import { Progress } from "@/components/ui/progress"
import { AvatarUpload } from "@/components/AvatarUpload"

export default function UserProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, updatePreferences } = useUser()
  const { fetchRecipes, recipes } = useRecipeStore()
  const [personalizedRecipes, setPersonalizedRecipes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [recommendations, setRecommendations] = useState([])
  const [recentActivity, setRecentActivity] = useState<Array<{id: number, type: string, recipe: string, timestamp: string}>>([])
  const [collections, setCollections] = useState([])
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else {
      // Simulate loading delay
      const timer = setTimeout(() => {
        setIsLoading(false)
        // Mock some recent activity
        setRecentActivity([
          { id: 1, type: "viewed", recipe: "Mediterranean Pasta Salad", timestamp: "2 hours ago" },
          { id: 2, type: "saved", recipe: "Overnight Oats with Berries", timestamp: "Yesterday" },
          { id: 3, type: "cooked", recipe: "Homemade Pizza", timestamp: "3 days ago" },
        ])
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, router])
  
  // Fetch recipes and get personalized recommendations
  useEffect(() => {
    const loadRecipesAndRecommendations = async () => {
      if (!user) return
      
      try {
        await fetchRecipes()
        
        if (recipes.length > 0) {
          setIsLoading(true)
          
          // Call the recipe suggestions API to get personalized recommendations
          try {
            const response = await fetch('/api/recipe-suggestions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userPreferences: user.preferences,
                recipes: recipes
              }),
            });
            
            if (response.ok) {
              const data = await response.json();
              
              // Get the recommended recipes based on AI suggestions
              const recommendedRecipes = data.recommendations
                .sort((a: { suitabilityScore: number }, b: { suitabilityScore: number }) => b.suitabilityScore - a.suitabilityScore)
                .slice(0, 3)
                .map((rec: { recipeIndex: number, explanation: string, suitabilityScore: number, suggestedModifications: string }) => {
                  const recipe = recipes[rec.recipeIndex - 1];
                  return {
                    ...recipe,
                    aiRecommendation: {
                      explanation: rec.explanation,
                      suitabilityScore: rec.suitabilityScore,
                      suggestedModifications: rec.suggestedModifications
                    }
                  };
                });
              
              // If we don't have enough AI recommendations, fill with other recipes
              if (recommendedRecipes.length < 3 && recipes.length > 3) {
                const remainingNeeded = 3 - recommendedRecipes.length;
                const recommendedIds = recommendedRecipes.map((r: { id: string }) => r.id);
                const additionalRecipes = recipes
                  .filter(r => !recommendedIds.includes(r.id))
                  .slice(0, remainingNeeded);
                
                setPersonalizedRecipes([...recommendedRecipes, ...additionalRecipes]);
              } else {
                setPersonalizedRecipes(recommendedRecipes);
              }
            } else {
              // Fallback to random recipes if the API fails
              console.error("Failed to get AI recommendations, using random recipes instead");
              setPersonalizedRecipes(recipes.slice(0, 3));
            }
          } catch (apiError) {
            console.error("Error calling recipe suggestions API:", apiError);
            // Fallback to the first 3 recipes
            setPersonalizedRecipes(recipes.slice(0, 3));
          } finally {
            setIsLoading(false);
          }
        }
      } catch (error) {
        toast.error("Failed to load recipes")
        setIsLoading(false)
      }
    }
    
    loadRecipesAndRecommendations()
  }, [fetchRecipes, user, recipes])
  
  if (!isAuthenticated || !user) {
    return null
  }
  
  // Calculate user profile completeness
  const calculateProfileCompleteness = () => {
    if (!user.preferences) return 0
    
    let score = 0
    const total = 7 // Total number of preference categories
    
    if (user.preferences) {
      if (user.preferences.dietaryRestrictions?.length > 0 && 
          !user.preferences.dietaryRestrictions.includes('none')) score++
      if (user.preferences.allergies?.length > 0) score++
      if (user.preferences.cookingSkillLevel) score++
      if (user.preferences.kitchenEquipment?.length > 0) score++
      if (user.preferences.servingSizePreference > 0) score++
      if (user.preferences.flavorPreferences?.length > 0) score++
      if (user.preferences.cuisinePreferences?.length > 0) score++
    }
    
    return Math.round((score / total) * 100)
  }
  
  // Get user's primary cooking persona
  const getUserPersona = () => {
    if (!user.preferences) return {
      title: "New Chef",
      description: "Start customizing your preferences to get personalized recipes.",
      icon: ChefHat,
      color: "text-gray-500",
      bgColor: "bg-gray-100",
    }
    
    const { preferences } = user
    
    // Determine if user is health-conscious
    const isHealthConscious = 
      preferences.dietaryRestrictions?.some(r => 
        ['vegan', 'vegetarian', 'keto', 'gluten-free', 'low-carb', 'paleo'].includes(r)
      )
    
    // Determine if user is busy professional (prefers simple recipes with few steps)
    const isBusyProfessional = 
      preferences.cookingSkillLevel === 'beginner' ||
      (preferences.kitchenEquipment && preferences.kitchenEquipment.filter(e => e.available).length < 5)
    
    // Determine if user is adventurous
    const isAdventurous = 
      preferences.cookingSkillLevel === 'advanced' || 
      (preferences.cuisinePreferences && preferences.cuisinePreferences.length > 3) ||
      (preferences.flavorPreferences && preferences.flavorPreferences.length > 3)
    
    if (isHealthConscious) {
      return {
        title: "Health Enthusiast",
        description: "You prioritize nutritious meals that align with specific dietary goals.",
        icon: Heart,
        color: "text-rose-500",
        bgColor: "bg-rose-100",
      }
    } else if (isBusyProfessional) {
      return {
        title: "Efficient Cook",
        description: "You value quick, accessible recipes that fit into your busy lifestyle.",
        icon: Clock,
        color: "text-blue-500",
        bgColor: "bg-blue-100",
      }
    } else if (isAdventurous) {
      return {
        title: "Culinary Explorer",
        description: "You enjoy experimenting with diverse flavors and cooking techniques.",
        icon: ChefHat,
        color: "text-amber-500",
        bgColor: "bg-amber-100",
      }
    } else {
      return {
        title: "Balanced Chef",
        description: "You appreciate a mix of convenience, nutrition, and culinary variety.",
        icon: Utensils,
        color: "text-purple-500",
        bgColor: "bg-purple-100",
      }
    }
  }
  
  const profileCompleteness = calculateProfileCompleteness()
  const persona = getUserPersona()
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading profile...</div>
  }
  
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex flex-col space-y-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Your Chef Profile</h1>
            <p className="text-gray-600">
              View and manage your profile, preferences, and saved recipes.
            </p>
          </div>
          
          {/* User Profile */}
          <Card className="border shadow-sm bg-gradient-to-r from-white to-slate-50 mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left column - User info */}
                <div className="md:w-1/3">
                  <Card className="border-none shadow-none bg-transparent">
                    <CardContent className="flex flex-col items-center text-center p-6">
                      {/* Replace the default avatar div with AvatarUpload component */}
                      <div className="mb-6 relative">
                        <AvatarUpload className="mb-1" />
                        <p className="text-xs text-gray-500 font-medium mt-1">Click to update photo</p>
                      </div>
                      
                      {/* User name and email */}
                      <h2 className="text-xl font-medium text-gray-900">{user.name || user.username}</h2>
                      <p className="text-sm text-gray-600 mb-3">{user.email}</p>
                      
                      {/* User persona badge */}
                      <div className="flex items-center justify-center mt-2">
                        <Badge className="px-3 py-1.5 gap-1.5 bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 font-medium">
                          <persona.icon className="h-3.5 w-3.5" />
                          {persona.title}
                        </Badge>
                      </div>
                      <CardDescription className="mt-2.5 text-sm text-gray-700">
                        {persona.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Right column - Profile details */}
                <div className="md:w-2/3">
                  <Card className="border-none shadow-none bg-transparent h-full">
                    <CardContent className="p-6">
                      {/* Profile completeness */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium text-gray-900">Profile completeness</h3>
                          <span className="text-sm text-gray-900">{profileCompleteness}%</span>
                        </div>
                        <Progress value={profileCompleteness} className="h-2" />
                        <p className="text-xs text-gray-600 mt-2">
                          Complete your profile to get more personalized recommendations
                        </p>
                      </div>
                      
                      <Separator className="my-6" />
                      
                      {/* Cooking preferences summary */}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Cooking Profile</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Skill level */}
                          <div className="flex">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-sky-50 flex items-center justify-center">
                              <ChefHat className="h-5 w-5 text-sky-600" />
                            </div>
                            <div className="ml-3 flex-1">
                              <span className="text-sm font-medium block line-clamp-1 text-gray-800">
                                {user.preferences?.cookingSkillLevel 
                                  ? user.preferences.cookingSkillLevel.charAt(0).toUpperCase() + 
                                    user.preferences.cookingSkillLevel.slice(1) + ' cook'
                                  : 'Skill level not set'}
                              </span>
                              <span className="text-xs text-gray-600">Cooking skill</span>
                            </div>
                          </div>
                          
                          {/* Favorite cuisines */}
                          <div className="flex">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
                              <Globe className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="ml-3 flex-1">
                              <span className="text-sm font-medium block line-clamp-1 text-gray-800">
                                {user.preferences?.cuisinePreferences?.length > 0 
                                  ? user.preferences.cuisinePreferences.slice(0, 3).join(', ') + 
                                    (user.preferences.cuisinePreferences.length > 3 ? ' & more' : '')
                                   : 'No cuisine preferences'}
                              </span>
                              <span className="text-xs text-gray-600">Favorite cuisines</span>
                            </div>
                          </div>
                          
                          {/* Dietary restrictions */}
                          <div className="flex">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                              <UtensilsCrossed className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="ml-3 flex-1">
                              <span className="text-sm font-medium block line-clamp-1 text-gray-800">
                                {user.preferences?.dietaryRestrictions?.length > 0 && 
                                 !user.preferences.dietaryRestrictions.includes('none')
                                  ? user.preferences.dietaryRestrictions.join(', ')
                                  : 'No dietary restrictions'}
                              </span>
                              <span className="text-xs text-gray-600">Dietary needs</span>
                            </div>
                          </div>
                          
                          {/* Kitchen equipment */}
                          <div className="flex">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                              <CookingPot className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="ml-3 flex-1">
                              <span className="text-sm font-medium block line-clamp-1 text-gray-800">
                                {user.preferences?.kitchenEquipment?.filter(e => e.available).length 
                                  ? `${user.preferences.kitchenEquipment.filter(e => e.available).length} items available`
                                  : 'No equipment added'}
                              </span>
                              <span className="text-xs text-gray-600">Kitchen equipment</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 p-4 border-t">
              <div className="w-full flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/user/preferences")}
                  className="text-sm"
                >
                  Edit Preferences
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          {/* Tabbed sections */}
          <Tabs defaultValue="recipes" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="recipes" className="text-gray-700 data-[state=active]:text-primary">Personal Recommendations</TabsTrigger>
              <TabsTrigger value="activity" className="text-gray-700 data-[state=active]:text-primary">Recent Activity</TabsTrigger>
              <TabsTrigger value="saved" className="text-gray-700 data-[state=active]:text-primary">Saved Recipes</TabsTrigger>
            </TabsList>
            
            {/* Recommended recipes tab */}
            <TabsContent value="recipes">
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900">Personalized For You</CardTitle>
                  <CardDescription className="text-gray-600">
                    These recipes are tailored to your preferences and cooking style
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {personalizedRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {personalizedRecipes.map(recipe => (
                        <Card key={recipe.id} className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => router.push(`/recipe/${recipe.id}`)}>
                          <CardContent className="p-4">
                            <div className="aspect-video bg-slate-100 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                              {recipe.image ? (
                                <img 
                                  src={recipe.image} 
                                  alt={recipe.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <CookingPot className="h-8 w-8 text-slate-400" />
                              )}
                            </div>
                            <h3 className="font-medium line-clamp-1 text-gray-900">{recipe.title}</h3>
                            {recipe.aiRecommendation && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {recipe.aiRecommendation.explanation}
                              </p>
                            )}
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {recipe.tags && recipe.tags.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs text-gray-700 bg-gray-100">
                                  {tag}
                                </Badge>
                              ))}
                              {recipe.aiRecommendation && (
                                <Badge variant="outline" className="text-xs text-amber-700 bg-amber-50 border-amber-200">
                                  {recipe.aiRecommendation.suitabilityScore}/10 match
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2 text-gray-900">No recipes found</h3>
                      <p className="text-gray-600 mb-4">
                        Complete your preferences to get personalized recommendations
                      </p>
                      <Button onClick={() => router.push("/user/preferences")}>
                        Update Preferences
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Recent activity tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900">Recent Activity</CardTitle>
                  <CardDescription className="text-gray-600">
                    Your recent interactions with recipes and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute top-0 bottom-0 left-6 border-l-2 border-primary ml-px"></div>
                    <div className="space-y-6 relative z-10 pl-14">
                      <div className="border-l-2 border-primary pl-4 space-y-6 py-2">
                        {/* Activity items */}
                        {recentActivity.map(item => (
                          <div key={item.id} className="relative">
                            <div className="absolute -left-[17px] mt-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white">
                              {item.type === "viewed" && <Clock className="h-3.5 w-3.5" />}
                              {item.type === "saved" && <Bookmark className="h-3.5 w-3.5" />}
                              {item.type === "cooked" && <ChefHat className="h-3.5 w-3.5" />}
                            </div>
                            <div className="space-y-1 ml-3">
                              <p className="text-sm font-medium capitalize text-gray-800">{item.type} a recipe</p>
                              <p className="text-xs text-gray-700">
                                {item.recipe}
                              </p>
                              <p className="text-xs text-gray-600 flex items-center">
                                <CalendarClock className="h-3 w-3 mr-1" />
                                {item.timestamp}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Saved recipes tab */}
            <TabsContent value="saved">
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900">Saved Recipes</CardTitle>
                  <CardDescription className="text-gray-600">Recipes you've saved for later</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Bookmark className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-gray-900">No saved recipes yet</h3>
                    <p className="text-gray-600 mb-4">
                      Save recipes to access them quickly later
                    </p>
                    <Button 
                      onClick={() => router.push("/")}
                      className="bg-white hover:bg-gray-50 text-gray-900 font-bold border-2 border-gray-800 shadow-md px-6 py-2.5 rounded-md transition-colors duration-200"
                      size="lg"
                    >
                      <BookOpen className="h-5 w-5 mr-2 text-gray-900" />
                      Browse Recipes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 