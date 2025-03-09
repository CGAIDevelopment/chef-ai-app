"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useRecipeStore } from "@/lib/store"
import { toast } from "sonner"
import { 
  Search, 
  ShoppingCart, 
  Check, 
  Trash2, 
  ReceiptText, 
  ChefHat, 
  Clock, 
  Plus, 
  ArrowLeft,
  Info,
  Menu,
  ListFilter,
  Package
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Sidebar from "@/components/Sidebar"
import { cn } from "@/lib/utils"
import { combineIngredients } from "@/lib/utils"

export default function ShoppingListPage() {
  const { shoppingList, removeFromShoppingList, toggleShoppingListItem, clearShoppingList, clearCheckedItems } = useRecipeStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"by-recipe" | "all-items" | "consolidated">("by-recipe")
  const searchRef = useRef<HTMLInputElement>(null)
  const [mounted, setMounted] = useState(false)

  // Client-side only initialization
  useEffect(() => {
    setMounted(true)
    document.documentElement.style.setProperty('--sidebar-width', '16rem') // 64px * 4 = 16rem
  }, [])

  // Focus search input when using keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || e.key === '/') {
        if (document.activeElement !== searchRef.current) {
          e.preventDefault()
          searchRef.current?.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Filter shopping list items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return shoppingList
    const query = searchQuery.toLowerCase().trim()
    return shoppingList.filter(item => 
      item.ingredient.toLowerCase().includes(query) || 
      item.recipeName.toLowerCase().includes(query)
    )
  }, [shoppingList, searchQuery])

  // Group items by recipe for better organization
  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof shoppingList> = {}
    
    filteredItems.forEach(item => {
      if (!groups[item.recipeId]) {
        groups[item.recipeId] = []
      }
      groups[item.recipeId].push(item)
    })
    
    return groups
  }, [filteredItems])

  // Create consolidated list with combined quantities
  const consolidatedItems = useMemo(() => {
    return combineIngredients(filteredItems);
  }, [filteredItems]);

  // Calculate statistics
  const totalItems = shoppingList.length
  const checkedItems = shoppingList.filter(item => item.isChecked).length
  const percentComplete = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0

  if (!mounted) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden fixed left-4 top-4 z-50"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[var(--sidebar-width)]">
          <Sidebar />
        </SheetContent>
      </Sheet>
      
      {/* Desktop sidebar */}
      <div className="h-screen w-[var(--sidebar-width)] flex-shrink-0 fixed left-0 top-0 z-40 hidden lg:block">
        <Sidebar />
      </div>
      
      <div className="flex-1 ml-0 lg:ml-[var(--sidebar-width)] flex flex-col relative">
        {/* Main content */}
        <div className="flex flex-col h-screen">
          {/* Shopping list progress */}
          <div className="relative pt-1 px-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-1 px-2">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {percentComplete}% complete
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-800 dark:text-gray-200">{checkedItems}</span> of {totalItems} items checked
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-2 text-xs flex rounded-full bg-gray-100 dark:bg-gray-800">
              <div 
                style={{ width: `${percentComplete}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 dark:bg-blue-600 transition-all duration-500"
              ></div>
            </div>
          </div>
          
          <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40">
                  <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </span>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Shopping List</h1>
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </Badge>
                {checkedItems > 0 && (
                  <Badge variant="outline" className="ml-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
                    {checkedItems} checked
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Action buttons */}
                {checkedItems > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      clearCheckedItems()
                      toast.success(`Removed ${checkedItems} checked items`)
                    }}
                    className="text-sm h-8 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hidden sm:flex"
                  >
                    <Check className="h-3.5 w-3.5 mr-1.5 text-green-600 dark:text-green-500" />
                    Clear Checked
                  </Button>
                )}
                
                {shoppingList.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear the entire shopping list?')) {
                        clearShoppingList()
                        toast.success('Shopping list cleared')
                      }
                    }}
                    className="text-sm h-8 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hidden sm:flex"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5 text-red-600 dark:text-red-500" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-4 flex flex-col gap-4 flex-grow">
            <div className="flex items-center gap-2 sticky top-[73px] z-10 bg-gray-50 dark:bg-gray-900 pt-1 pb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                <Input
                  ref={searchRef}
                  placeholder="Search items or recipes... (Press '/' to focus)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 focus-visible:ring-blue-500"
                  aria-label="Search shopping list items"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    aria-label="Clear search"
                  >
                    <span className="sr-only">Clear</span>
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden shadow-sm">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setViewMode("by-recipe")}
                  className={cn(
                    "text-sm h-8 rounded-none border-0 border-r border-gray-200 dark:border-gray-700",
                    viewMode === "by-recipe" 
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750"
                  )}
                  aria-label="Group by recipe"
                  title="Group by recipe"
                >
                  <ReceiptText className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setViewMode("all-items")}
                  className={cn(
                    "text-sm h-8 rounded-none border-0 border-r border-gray-200 dark:border-gray-700",
                    viewMode === "all-items" 
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750"
                  )}
                  aria-label="View all items"
                  title="All items"
                >
                  <ListFilter className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setViewMode("consolidated")}
                  className={cn(
                    "text-sm h-8 rounded-none border-0",
                    viewMode === "consolidated" 
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750"
                  )}
                  aria-label="Consolidated view"
                  title="Consolidated ingredients"
                >
                  <Package className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Empty state */}
            {filteredItems.length === 0 && (
              <Card className="mt-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center text-center gap-4 py-10">
                    <div className="rounded-full bg-blue-100 dark:bg-blue-900/40 p-4 ring-4 ring-blue-50 dark:ring-blue-900/20">
                      <ShoppingCart className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-3">Your shopping list is empty</h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-sm leading-relaxed text-base">
                      Add ingredients from any recipe by clicking the "Add to Shopping List" button on a recipe page.
                    </p>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-lg p-4 mt-2 w-full max-w-md text-left">
                      <div className="flex gap-3">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1">How to use the shopping list</h3>
                          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2 list-disc pl-5">
                            <li>View a recipe and click "Add to Shopping List"</li>
                            <li>Check off items as you shop</li>
                            <li>Group items by recipe or view as a complete list</li>
                            <li>Use consolidated view to see total quantities needed</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <Link href="/" passHref>
                      <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Browse Recipes
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Main content with items */}
            {filteredItems.length > 0 && viewMode === "by-recipe" && (
              <div className="space-y-6">
                {Object.entries(groupedItems).map(([recipeId, items]) => {
                  const recipeName = items[0]?.recipeName || "Unknown Recipe"
                  const uncheckedCount = items.filter(item => !item.isChecked).length
                  const isAllChecked = uncheckedCount === 0
                  
                  return (
                    <div key={recipeId} className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                      <div className="bg-gray-50 dark:bg-gray-800 flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <ChefHat className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          </span>
                          <h3 className="font-medium text-sm text-gray-900 dark:text-white">{recipeName}</h3>
                          <Badge variant="outline" className="ml-1.5 bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                            {items.length} {items.length === 1 ? 'item' : 'items'}
                          </Badge>
                          {isAllChecked && (
                            <Badge variant="outline" className="ml-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
                              All checked
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            onClick={() => {
                              // Toggle all items in this recipe
                              const targetState = uncheckedCount > 0;
                              items.forEach(item => {
                                if (item.isChecked !== targetState) {
                                  toggleShoppingListItem(item.id);
                                }
                              });
                            }}
                          >
                            {uncheckedCount > 0 ? "Check All" : "Uncheck All"}
                          </Button>
                          
                          <Link href={`/recipe/${recipeId}`} passHref>
                            <Button 
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              View Recipe
                            </Button>
                          </Link>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800">
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                          {items.map((item) => (
                            <div 
                              key={item.id} 
                              className={cn(
                                "flex items-center justify-between py-2.5 px-4 group",
                                item.isChecked && "bg-green-50/50 dark:bg-green-900/10"
                              )}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <Checkbox 
                                  id={item.id} 
                                  checked={item.isChecked}
                                  onCheckedChange={() => toggleShoppingListItem(item.id)}
                                  className={cn(
                                    "transition-colors h-5 w-5",
                                    item.isChecked 
                                      ? "text-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 border-green-300 dark:border-green-600" 
                                      : "text-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300 dark:border-gray-600"
                                  )}
                                />
                                <label
                                  htmlFor={item.id}
                                  className={cn(
                                    "text-sm text-gray-700 dark:text-gray-300 cursor-pointer",
                                    item.isChecked && "line-through text-gray-500 dark:text-gray-500"
                                  )}
                                >
                                  {item.ingredient}
                                </label>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromShoppingList(item.id)}
                                className="h-7 w-7 p-0 text-red-500 dark:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                aria-label={`Remove ${item.ingredient} from shopping list`}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove item</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            {filteredItems.length > 0 && viewMode === "all-items" && (
              <ScrollArea className="flex-1 pr-3">
                <div className="space-y-1">
                  {filteredItems.map((item) => (
                    <div 
                      key={item.id} 
                      className={cn(
                        "flex items-center justify-between py-2.5 px-4 rounded-md group transition-colors",
                        item.isChecked 
                          ? "bg-green-50 dark:bg-green-900/10"
                          : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/80 border border-gray-200 dark:border-gray-700"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox 
                          id={item.id} 
                          checked={item.isChecked}
                          onCheckedChange={() => toggleShoppingListItem(item.id)}
                          className={cn(
                            "transition-colors h-5 w-5",
                            item.isChecked 
                              ? "text-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 border-green-300 dark:border-green-600" 
                              : "text-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300 dark:border-gray-600"
                          )}
                        />
                        <div className="flex flex-col">
                          <label
                            htmlFor={item.id}
                            className={cn(
                              "text-sm text-gray-700 dark:text-gray-300 cursor-pointer",
                              item.isChecked && "line-through text-gray-500 dark:text-gray-500"
                            )}
                          >
                            {item.ingredient}
                          </label>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {item.recipeName}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromShoppingList(item.id)}
                        className="h-7 w-7 p-0 text-red-500 dark:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label={`Remove ${item.ingredient} from shopping list`}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove item</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Consolidated view - grouped by ingredient name */}
            {filteredItems.length > 0 && viewMode === "consolidated" && (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-400">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      This view combines similar ingredients across recipes, showing the total quantities needed for all your planned recipes.
                    </div>
                  </div>
                </div>

                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-white">Consolidated Shopping List</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      Total ingredients needed for all recipes
                    </p>
                  </div>
                  
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {consolidatedItems.map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between py-3 px-4 group hover:bg-gray-50 dark:hover:bg-gray-750"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.combinedText}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center flex-wrap gap-1">
                            <span>Used in:</span>
                            {item.recipes.map((recipe, i) => (
                              <span key={i} className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs">
                                {recipe}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
          
          {/* Keyboard shortcuts helper */}
          <div className="hidden md:flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center mr-4">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 mr-1">Ctrl</kbd>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 mr-1">K</kbd>
              <span className="ml-1">or</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 mx-1">/</kbd>
              <span className="ml-1">to search</span>
            </div>
            <div className="flex items-center">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 mr-1">Tab</kbd>
              <span className="ml-1">to navigate items</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 