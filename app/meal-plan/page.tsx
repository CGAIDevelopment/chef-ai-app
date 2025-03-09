"use client"

import { useRecipesByStatus } from "@/lib/store"
import { useEffect, useMemo, useState } from "react"
import { format, parseISO, addDays, startOfWeek, isToday, isSameDay, isSameMonth } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import Sidebar from "@/components/Sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Plus, 
  Calendar, 
  Coffee, 
  Utensils, 
  Cookie, 
  UtensilsCrossed, 
  Sparkles, 
  Clock,
  PieChart,
  Flame,
  Egg,
  ArrowRight
} from "lucide-react"
import type { Recipe, MealTime } from "@/lib/types"
import { MEAL_TIME_LABELS, MEAL_TIME_ORDER } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

// Map meal times to their respective icons
const MEAL_TIME_ICONS: Record<MealTime, React.ReactNode> = {
  "breakfast": <Coffee className="h-4 w-4" />,
  "morning-snack": <Cookie className="h-4 w-4" />,
  "lunch": <UtensilsCrossed className="h-4 w-4" />,
  "afternoon-snack": <Cookie className="h-4 w-4" />,
  "dinner": <Utensils className="h-4 w-4" />,
  "other": <Sparkles className="h-4 w-4" />
};

// Color theme for meal times
const MEAL_TIME_COLORS: Record<MealTime, { bg: string, text: string, border: string, icon: string }> = {
  "breakfast": { 
    bg: "bg-amber-50 dark:bg-amber-950/30", 
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    icon: "text-amber-600 dark:text-amber-400"
  },
  "morning-snack": { 
    bg: "bg-blue-50 dark:bg-blue-950/30", 
    text: "text-blue-800 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400"
  },
  "lunch": { 
    bg: "bg-emerald-50 dark:bg-emerald-950/30", 
    text: "text-emerald-800 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: "text-emerald-600 dark:text-emerald-400"
  },
  "afternoon-snack": { 
    bg: "bg-purple-50 dark:bg-purple-950/30", 
    text: "text-purple-800 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
    icon: "text-purple-600 dark:text-purple-400"
  },
  "dinner": { 
    bg: "bg-rose-50 dark:bg-rose-950/30", 
    text: "text-rose-800 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
    icon: "text-rose-600 dark:text-rose-400"
  },
  "other": { 
    bg: "bg-gray-50 dark:bg-gray-800/50", 
    text: "text-gray-800 dark:text-gray-300",
    border: "border-gray-200 dark:border-gray-700",
    icon: "text-gray-600 dark:text-gray-400"
  }
};

export default function MealPlan() {
  const { recipes, isLoading, error, fetchRecipes } = useRecipesByStatus("meal-plan")
  const [mounted, setMounted] = useState(false)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [viewMode, setViewMode] = useState<"day" | "week">("day")
  
  // Generate dates for the current week
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))
  }, [currentWeekStart])
  
  // Selected date for viewing recipes (defaults to today or first day of week)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date()
    // If today falls within the current week, select today, otherwise select the first day of the displayed week
    return weekDates.some(date => isSameDay(date, today)) ? today : weekDates[0]
  })
  
  // When week changes, update the selected date to be within the new week
  useEffect(() => {
    if (!weekDates.some(date => isSameDay(date, selectedDate))) {
      setSelectedDate(weekDates[0])
    }
  }, [weekDates, selectedDate])

  useEffect(() => {
    setMounted(true)
    fetchRecipes()
  }, [fetchRecipes])

  // Group recipes by date
  const recipesByDate = useMemo(() => {
    const grouped: Record<string, Recipe[]> = {};
    
    recipes.forEach(recipe => {
      if (recipe.mealPlanDate) {
        if (!grouped[recipe.mealPlanDate]) {
          grouped[recipe.mealPlanDate] = [];
        }
        grouped[recipe.mealPlanDate].push(recipe);
      }
    });
    
    return grouped;
  }, [recipes]);

  // Navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prevDate => addDays(prevDate, -7))
  }

  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentWeekStart(prevDate => addDays(prevDate, 7))
  }

  // Don't render until client-side hydration is complete
  if (!mounted) {
    return null
  }
  
  // Get the recipes for the selected date
  const selectedDateFormatted = format(selectedDate, "yyyy-MM-dd")
  const recipesForSelectedDate = recipesByDate[selectedDateFormatted] || []
  
  // Group recipes by meal time
  const recipesByMealTime = MEAL_TIME_ORDER.reduce<Record<MealTime, Recipe[]>>((acc, mealTime) => {
    acc[mealTime] = recipesForSelectedDate.filter(recipe => (recipe.mealTime || "other") === mealTime);
    return acc;
  }, {
    "breakfast": [],
    "morning-snack": [],
    "lunch": [],
    "afternoon-snack": [],
    "dinner": [],
    "other": []
  });

  // Calculate daily nutritional totals
  const dailyNutrition = recipesForSelectedDate.reduce((totals, recipe) => {
    if (recipe.nutritionalValue && recipe.servings) {
      // Calculate nutrients for one serving regardless of recipe's total servings
      const servingRatio = 1 / recipe.servings;
      totals.calories += recipe.nutritionalValue.calories * servingRatio;
      totals.protein += recipe.nutritionalValue.protein * servingRatio;
      totals.carbs += recipe.nutritionalValue.carbs * servingRatio;
      totals.fat += recipe.nutritionalValue.fat * servingRatio;
    }
    return totals;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // UI components for different views
  const DailyNutritionSummary = () => (
    recipesForSelectedDate.length > 0 ? (
      <>
        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 mb-4">
          Nutritional values below show <span className="font-medium">one serving</span> from each recipe planned for {format(selectedDate, "MMMM d")}.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="p-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mr-3">
                <Flame className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Calories</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{Math.round(dailyNutrition.calories)}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="p-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mr-3">
                <Egg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Protein</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{Math.round(dailyNutrition.protein)}g</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="p-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mr-3">
                <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Carbs</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{Math.round(dailyNutrition.carbs)}g</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
            <CardContent className="p-4 flex items-center">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mr-3">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Fat</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{Math.round(dailyNutrition.fat)}g</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    ) : null
  );

  const DailyMealPlan = () => (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/70 py-4">
        <CardTitle className="text-gray-900 dark:text-white flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
          {format(selectedDate, "EEEE, MMMM d, yyyy")}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {recipesForSelectedDate.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {MEAL_TIME_ORDER.map(mealTime => {
              const recipes = recipesByMealTime[mealTime];
              if (recipes.length === 0) return null;
              
              return (
                <div key={mealTime} className="py-4 px-6 first:pt-6">
                  <div className={cn(
                    "rounded-lg px-3 py-2 mb-3 inline-flex items-center",
                    MEAL_TIME_COLORS[mealTime].bg,
                    MEAL_TIME_COLORS[mealTime].text,
                    MEAL_TIME_COLORS[mealTime].border
                  )}>
                    <div className={cn(
                      "mr-2",
                      MEAL_TIME_COLORS[mealTime].icon
                    )}>
                      {MEAL_TIME_ICONS[mealTime]}
                    </div>
                    <span className="font-medium">{MEAL_TIME_LABELS[mealTime]}</span>
                    <Badge variant="outline" className={cn(
                      "ml-2 font-normal",
                      MEAL_TIME_COLORS[mealTime].border,
                      MEAL_TIME_COLORS[mealTime].text
                    )}>
                      {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {recipes.map(recipe => (
                      <motion.div
                        key={recipe.id}
                        whileHover={{ scale: 1.01 }}
                        className="group"
                      >
                        <Link 
                          href={`/recipe/${recipe.id}`}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-lg border overflow-hidden group-hover:shadow-md transition-all", 
                            MEAL_TIME_COLORS[mealTime].border,
                            "bg-white dark:bg-gray-800"
                          )}
                        >
                          {recipe.image && (
                            <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0 relative">
                              <Image
                                src={recipe.image}
                                alt={recipe.title}
                                fill
                                sizes="80px"
                                className="object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {recipe.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mt-0.5">
                              {recipe.description || "No description provided"}
                            </p>
                            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2">
                              <div className="flex items-center text-xs text-gray-700 dark:text-gray-300">
                                <Clock className="h-3.5 w-3.5 mr-1 text-gray-500 dark:text-gray-400" />
                                <span>30 min</span>
                              </div>
                              <div className="flex items-center text-xs text-gray-700 dark:text-gray-300">
                                <Utensils className="h-3.5 w-3.5 mr-1 text-gray-500 dark:text-gray-400" />
                                <span>{recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}</span>
                              </div>
                              {recipe.nutritionalValue && (
                                <div className="flex items-center text-xs text-gray-700 dark:text-gray-300">
                                  <Flame className="h-3.5 w-3.5 mr-1 text-gray-500 dark:text-gray-400" />
                                  <span>{recipe.nutritionalValue.calories} calories</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
              <Calendar className="h-8 w-8 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="font-medium text-xl text-gray-900 dark:text-white mb-2">No meals planned</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mb-5">
              You haven't added any recipes to your meal plan for {format(selectedDate, "MMMM d")} yet.
            </p>
            <Link href="/" passHref>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5">
                <Plus className="h-4 w-4 mr-2" />
                Add Recipes
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
      {recipesForSelectedDate.length > 0 && (
        <CardFooter className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/70 py-3 flex justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total: {recipesForSelectedDate.length} {recipesForSelectedDate.length === 1 ? 'recipe' : 'recipes'}
          </div>
          <Button variant="outline" size="sm" className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add More
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  const WeeklyOverview = () => (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <CardHeader className="bg-gray-50 dark:bg-gray-800/70 p-4 border-b border-gray-100 dark:border-gray-700">
        <CardTitle className="text-gray-900 dark:text-white">
          Weekly Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 divide-y divide-gray-100 dark:divide-gray-700">
          {weekDates.map(date => {
            const formattedDate = format(date, "yyyy-MM-dd");
            const dayRecipes = recipesByDate[formattedDate] || [];
            
            return (
              <div key={formattedDate} className="p-4">
                <div className={cn(
                  "flex items-center mb-3",
                  isSameDay(date, selectedDate) ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"
                )}>
                  <h3 className="font-semibold">{format(date, "EEEE, MMMM d")}</h3>
                  {isToday(date) && (
                    <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-100">Today</Badge>
                  )}
                </div>
                
                {dayRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {MEAL_TIME_ORDER.map(mealTime => {
                      const mealRecipes = dayRecipes.filter(r => (r.mealTime || 'other') === mealTime);
                      if (mealRecipes.length === 0) return null;
                      
                      return (
                        <div 
                          key={mealTime}
                          className={cn(
                            "rounded-lg border p-3",
                            MEAL_TIME_COLORS[mealTime].border,
                            MEAL_TIME_COLORS[mealTime].bg
                          )}
                        >
                          <div className={cn(
                            "text-sm font-medium mb-2 flex items-center",
                            MEAL_TIME_COLORS[mealTime].text
                          )}>
                            <span className={MEAL_TIME_COLORS[mealTime].icon}>{MEAL_TIME_ICONS[mealTime]}</span>
                            <span className="ml-1.5">{MEAL_TIME_LABELS[mealTime]}</span>
                          </div>
                          <div className="space-y-2">
                            {mealRecipes.map(recipe => (
                              <Link 
                                key={recipe.id}
                                href={`/recipe/${recipe.id}`}
                                className="flex items-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                              >
                                {recipe.image && (
                                  <div className="h-8 w-8 rounded overflow-hidden mr-2 flex-shrink-0">
                                    <Image
                                      src={recipe.image}
                                      alt={recipe.title}
                                      width={32}
                                      height={32}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{recipe.title}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">No meals planned for this day</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 text-xs"
                      onClick={() => setSelectedDate(date)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Meal
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div className="h-screen w-[var(--sidebar-width)] flex-shrink-0 fixed left-0 top-0 z-40 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <Sidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 ml-0 lg:ml-[var(--sidebar-width)] min-h-screen p-4 md:p-8">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Meal Plan</h1>
              <p className="text-gray-700 dark:text-gray-300 mt-1">Plan and organize your weekly meals</p>
            </div>
            <div className="flex items-center gap-3">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium hidden sm:flex">
                <Plus className="h-4 w-4 mr-1.5" />
                Add Recipe
              </Button>
            </div>
          </div>
        </header>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-gray-800 dark:text-gray-200">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <p>Loading meal plan...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-gray-800 dark:text-gray-200">
              {error}
            </AlertDescription>
          </Alert>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Week navigation */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                <Button variant="outline" size="sm" onClick={goToPreviousWeek} className="h-9 px-3">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <h2 className="font-semibold text-gray-900 dark:text-white text-center text-lg">
                  {format(currentWeekStart, "MMMM")}
                  {!isSameMonth(currentWeekStart, addDays(currentWeekStart, 6)) && 
                    <>/{format(addDays(currentWeekStart, 6), "MMMM")}</>
                  } {format(currentWeekStart, "yyyy")}
                </h2>
                
                <Button variant="outline" size="sm" onClick={goToNextWeek} className="h-9 px-3">
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              {/* Day selector */}
              <div className="grid grid-cols-7 gap-0.5 p-3 bg-gray-50 dark:bg-gray-800">
                {weekDates.map((date) => {
                  const formattedDate = format(date, "yyyy-MM-dd")
                  const hasRecipes = !!recipesByDate[formattedDate]
                  const isSelected = isSameDay(date, selectedDate)

                  return (
                    <motion.div 
                      key={formattedDate}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors",
                        isToday(date) && !isSelected && "bg-blue-50/50 dark:bg-blue-900/20",
                        hasRecipes && !isSelected && "bg-green-50/50 dark:bg-green-900/20",
                        isSelected && "bg-blue-100 dark:bg-blue-900/40 shadow-sm"
                      )}
                      onClick={() => setSelectedDate(date)}
                    >
                      <span className={cn(
                        "text-xs font-medium rounded-full w-full text-center py-0.5 mb-1.5",
                        isToday(date) ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400"
                      )}>
                        {format(date, "EEE")}
                      </span>
                      <span className={cn(
                        "text-xl font-bold",
                        isSelected ? "text-blue-800 dark:text-blue-300" : "text-gray-900 dark:text-gray-100"
                      )}>
                        {format(date, "d")}
                      </span>
                      {hasRecipes && (
                        <div className="flex mt-1.5 space-x-0.5">
                          {MEAL_TIME_ORDER.map(mealTime => {
                            const mealRecipes = recipesByDate[formattedDate]?.filter(r => (r.mealTime || 'other') === mealTime);
                            if (!mealRecipes || mealRecipes.length === 0) return null;
                            
                            return (
                              <div 
                                key={mealTime} 
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  isSelected 
                                    ? "bg-blue-600 dark:bg-blue-400" 
                                    : "bg-green-500 dark:bg-green-400"
                                )} 
                                title={`${MEAL_TIME_LABELS[mealTime]}: ${mealRecipes.length} recipe(s)`}
                              />
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </Card>
            
            {/* View tabs and content */}
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "day" | "week")}>
              <TabsList className="mb-6 grid w-full md:w-[240px] grid-cols-2 mx-auto">
                <TabsTrigger value="day">Daily View</TabsTrigger>
                <TabsTrigger value="week">Weekly View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="day" className="space-y-6">
                <DailyNutritionSummary />
                <DailyMealPlan />
              </TabsContent>
              
              <TabsContent value="week">
                <WeeklyOverview />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </div>
  );
}

