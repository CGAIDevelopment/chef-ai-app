import { useState, useEffect } from "react"
import { Settings, Plus, X, Save, ChefHat, Utensils, AlertCircle, Flame, Globe, LightbulbIcon, Vegan, FlameIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/lib/userStore"
import { 
  UserPreferences, 
  DietaryRestriction, 
  SkillLevel, 
  COMMON_EQUIPMENT, 
  CUISINE_TYPES 
} from "@/lib/types"
import { cn } from "@/lib/utils"

export function UserPreferencesForm() {
  const router = useRouter()
  const { user, updatePreferences } = useUser()
  
  const [formData, setFormData] = useState<UserPreferences>({
    dietaryRestrictions: ['none'],
    allergies: [],
    flavorPreferences: [],
    cookingSkillLevel: 'intermediate',
    kitchenEquipment: COMMON_EQUIPMENT.map(item => ({ name: item, available: false })),
    servingSizePreference: 4,
    cuisinePreferences: [],
  })
  
  const [newAllergy, setNewAllergy] = useState('')
  const [newFlavor, setNewFlavor] = useState('')
  const [newDietary, setNewDietary] = useState('')
  const [formChanged, setFormChanged] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Load user preferences if available
  useEffect(() => {
    if (user && user.preferences) {
      setFormData(user.preferences)
    }
  }, [user])
  
  // Add the formatOption function
  const formatOption = (option: string): string => {
    if (option === 'none') return 'No restrictions';
    return option.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Handle dietary restriction changes
  const handleDietaryRestrictionChange = (restriction: DietaryRestriction) => {
    setFormChanged(true)
    
    setFormData(prev => {
      // Create a copy of the current restrictions
      const currentRestrictions = [...prev.dietaryRestrictions];
      let newRestrictions: DietaryRestriction[];
      
      // If clicking "none", remove all other restrictions
      if (restriction === 'none') {
        // Only update if "none" isn't already the only selected option
        if (currentRestrictions.length !== 1 || currentRestrictions[0] !== 'none') {
          newRestrictions = ['none'];
        } else {
          // If "none" is already the only selected option, don't change anything
          return prev;
        }
      } else {
        // If adding a non-"none" restriction
        // First, remove "none" from the list if it exists
        newRestrictions = currentRestrictions.filter(r => r !== 'none');
        
        // Toggle the selected restriction (add if not present, remove if present)
        if (newRestrictions.includes(restriction)) {
          newRestrictions = newRestrictions.filter(r => r !== restriction);
          // If no restrictions left, add "none"
          if (newRestrictions.length === 0) {
            newRestrictions = ['none'];
          }
        } else {
          newRestrictions.push(restriction);
        }
      }
      
      // Only return a new state object if the restrictions actually changed
      if (JSON.stringify(currentRestrictions) !== JSON.stringify(newRestrictions)) {
        return { ...prev, dietaryRestrictions: newRestrictions };
      }
      return prev;
    });
  }
  
  // Handle adding an allergy
  const handleAddAllergy = () => {
    if (newAllergy.trim() && !formData.allergies.includes(newAllergy.trim())) {
      setFormChanged(true)
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }))
      setNewAllergy('')
    }
  }
  
  // Handle removing an allergy
  const handleRemoveAllergy = (allergy: string) => {
    setFormChanged(true)
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }))
  }
  
  // Handle adding a flavor preference
  const handleAddFlavor = () => {
    if (newFlavor.trim() && !formData.flavorPreferences.includes(newFlavor.trim())) {
      setFormChanged(true)
      setFormData(prev => ({
        ...prev,
        flavorPreferences: [...prev.flavorPreferences, newFlavor.trim()]
      }))
      setNewFlavor('')
    }
  }
  
  // Handle removing a flavor preference
  const handleRemoveFlavor = (flavor: string) => {
    setFormChanged(true)
    setFormData(prev => ({
      ...prev,
      flavorPreferences: prev.flavorPreferences.filter(f => f !== flavor)
    }))
  }
  
  // Handle kitchen equipment availability change
  const handleEquipmentChange = (equipmentName: string, available: boolean) => {
    setFormChanged(true)
    setFormData(prev => ({
      ...prev,
      kitchenEquipment: prev.kitchenEquipment.map(item => 
        item.name === equipmentName ? { ...item, available } : item
      )
    }))
  }
  
  // Handle cuisine preference change
  const handleCuisineChange = (cuisine: string) => {
    setFormChanged(true)
    setFormData(prev => {
      const newCuisines = [...prev.cuisinePreferences]
      if (newCuisines.includes(cuisine)) {
        return { ...prev, cuisinePreferences: newCuisines.filter(c => c !== cuisine) }
      } else {
        return { ...prev, cuisinePreferences: [...newCuisines, cuisine] }
      }
    })
  }
  
  // Define the skill change handler
  const handleSkillChange = (skill: SkillLevel) => {
    setFormData({
      ...formData,
      cookingSkillLevel: skill
    });
    setFormChanged(true);
  }
  
  // Handle adding a custom dietary restriction
  const handleAddDietary = () => {
    if (newDietary.trim() && !formData.dietaryRestrictions.includes(newDietary.trim() as DietaryRestriction)) {
      setFormChanged(true)
      
      setFormData(prev => {
        // Remove 'none' if it's currently selected
        const newRestrictions = prev.dietaryRestrictions.filter(r => r !== 'none');
        
        // Add the new custom restriction
        newRestrictions.push(newDietary.trim() as DietaryRestriction);
        
        return { ...prev, dietaryRestrictions: newRestrictions }
      })
      
      setNewDietary('')
    }
  }
  
  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    
    try {
      await updatePreferences(formData)
      toast.success("Preferences saved successfully")
      setFormChanged(false)
      router.push('/user/profile')
    } catch (error) {
      toast.error("Failed to save preferences")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="w-full">
      <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="dietary" className="w-full">
            <div className="sticky top-0 bg-white z-10 pt-2 pb-4">
              <TabsList className="w-full grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                <TabsTrigger value="dietary" className="flex-1 text-gray-800 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
                  <Vegan className="h-4 w-4 mr-2 hidden sm:inline-block" />
                  Diet & Allergies
                </TabsTrigger>
                <TabsTrigger value="cooking" className="flex-1 text-gray-800 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
                  <ChefHat className="h-4 w-4 mr-2 hidden sm:inline-block" />
                  Cooking Style
                </TabsTrigger>
                <TabsTrigger value="equipment" className="flex-1 text-gray-800 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
                  <Utensils className="h-4 w-4 mr-2 hidden sm:inline-block" />
                  Equipment
                </TabsTrigger>
                <TabsTrigger value="flavors" className="flex-1 text-gray-800 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
                  <Flame className="h-4 w-4 mr-2 hidden sm:inline-block" />
                  Flavors
                </TabsTrigger>
                <TabsTrigger value="cuisines" className="flex-1 text-gray-800 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
                  <Globe className="h-4 w-4 mr-2 hidden sm:inline-block" />
                  Cuisines
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Diet & Allergies Tab */}
            <TabsContent value="dietary" className="space-y-6 pt-2">
              <Card className="shadow-lg border-gray-200">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-xl text-gray-900">Dietary Restrictions</CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    Select any dietary restrictions you follow
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {['none', 'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'pescatarian', 'low-carb'].map((diet) => (
                      <div key={diet} className="flex items-start space-x-3 p-3 rounded-md hover:bg-gray-50 transition-colors">
                        <Checkbox
                          id={`diet-${diet}`}
                          checked={formData.dietaryRestrictions.includes(diet as DietaryRestriction)}
                          onCheckedChange={() => handleDietaryRestrictionChange(diet as DietaryRestriction)}
                          className="mt-1"
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label className="text-base font-medium text-gray-800" htmlFor={`diet-${diet}`}>{formatOption(diet)}</Label>
                          <p className="text-sm text-gray-600">
                            {diet === 'none' ? 'I eat everything' : 
                             diet === 'vegetarian' ? 'No meat, but may include dairy and eggs' :
                             diet === 'vegan' ? 'No animal products' :
                             diet === 'gluten-free' ? 'No gluten-containing grains' :
                             diet === 'dairy-free' ? 'No dairy products' :
                             diet === 'keto' ? 'High fat, low carb' :
                             diet === 'paleo' ? 'Foods not processed/farmed' :
                             diet === 'pescatarian' ? 'No meat except fish' :
                             diet === 'low-carb' ? 'Reduced carbohydrates' : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Display selected custom dietary restrictions */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {formData.dietaryRestrictions
                      .filter(restriction => !['none', 'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'pescatarian', 'low-carb'].includes(restriction))
                      .map(restriction => (
                        <Badge 
                          key={restriction} 
                          variant="secondary"
                          className="px-3 py-1.5 text-base flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
                        >
                          <Vegan className="h-3.5 w-3.5" />
                          {restriction}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 rounded-full hover:bg-purple-200 ml-1"
                            onClick={() => handleDietaryRestrictionChange(restriction)}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {restriction}</span>
                          </Button>
                        </Badge>
                    ))}
                  </div>

                  {/* Add custom dietary restriction */}
                  <div className="flex gap-2 mt-4 border-t pt-4 border-gray-200">
                    <Input
                      type="text"
                      placeholder="Add a custom dietary restriction"
                      value={newDietary}
                      onChange={(e) => setNewDietary(e.target.value)}
                      className="flex-1 h-11 text-base"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newDietary.trim()) {
                          e.preventDefault();
                          handleAddDietary();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddDietary}
                      disabled={!newDietary.trim()}
                      className="shrink-0 h-11"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-lg border-gray-200">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-xl text-gray-900">Food Allergies</CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    Select any food allergies you have
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="flex flex-wrap gap-2">
                    {formData.allergies.map(allergy => (
                      <Badge 
                        key={allergy} 
                        variant="secondary"
                        className="px-3 py-1.5 text-base flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        {allergy}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 rounded-full hover:bg-red-200 ml-1"
                          onClick={() => handleRemoveAllergy(allergy)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove {allergy}</span>
                        </Button>
                      </Badge>
                    ))}
                    {formData.allergies.length === 0 && (
                      <p className="text-gray-600 text-base bg-gray-50 p-3 rounded-md w-full">No allergies added yet. Add them below or select from common allergies.</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Add an allergy or ingredient to avoid"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        className="flex-1 h-11 text-base"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newAllergy.trim()) {
                            e.preventDefault();
                            handleAddAllergy();
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddAllergy}
                        disabled={!newAllergy.trim()}
                        className="shrink-0 h-11"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                    
                    <div className="mt-4 bg-slate-50 rounded-md p-4 border border-slate-200">
                      <h4 className="text-base font-medium mb-3 flex items-center text-gray-900">
                        <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                        Common Food Allergies
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {["Peanuts", "Tree nuts", "Milk", "Eggs", "Fish", "Shellfish", "Soy", "Wheat", "Gluten", "Sesame"].map(allergen => (
                          <Badge 
                            key={allergen} 
                            variant="outline"
                            className="cursor-pointer hover:bg-red-50 px-3 py-1.5 text-sm border border-gray-200 text-gray-700"
                            onClick={() => {
                              const allergenLower = allergen.toLowerCase();
                              if (!formData.allergies.includes(allergenLower)) {
                                setFormChanged(true)
                                setFormData(prev => ({
                                  ...prev,
                                  allergies: [...prev.allergies, allergenLower]
                                }))
                              }
                            }}
                          >
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Cooking Style Tab */}
            <TabsContent value="cooking" className="space-y-6 pt-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900">Cooking Skill Level</CardTitle>
                  <CardDescription className="text-gray-600">
                    How would you rate your cooking experience?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup 
                    value={formData.cookingSkillLevel}
                    onValueChange={(value: string) => {
                      setFormChanged(true)
                      setFormData(prev => ({ ...prev, cookingSkillLevel: value as SkillLevel }))
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className={cn(
                      "flex flex-col items-center p-4 rounded-md border-2 cursor-pointer",
                      formData.cookingSkillLevel === 'beginner' 
                        ? "border-primary bg-primary/5" 
                        : "border-gray-200 hover:border-gray-300"
                    )} onClick={() => handleSkillChange('beginner')}>
                      <RadioGroupItem value="beginner" id="beginner" className="sr-only" />
                      <Label htmlFor="beginner" className="font-medium text-gray-900">Beginner</Label>
                      <p className="text-sm text-center text-gray-700">
                        I'm new to cooking and prefer simple recipes with clear instructions
                      </p>
                    </div>
                    
                    <div className={cn(
                      "flex flex-col items-center p-4 rounded-md border-2 cursor-pointer",
                      formData.cookingSkillLevel === 'intermediate' 
                        ? "border-primary bg-primary/5" 
                        : "border-gray-200 hover:border-gray-300"
                    )} onClick={() => handleSkillChange('intermediate')}>
                      <RadioGroupItem value="intermediate" id="intermediate" className="sr-only" />
                      <Label htmlFor="intermediate" className="font-medium text-gray-900">Intermediate</Label>
                      <p className="text-sm text-center text-gray-700">
                        I'm comfortable in the kitchen and can follow most recipes
                      </p>
                    </div>
                    
                    <div className={cn(
                      "flex flex-col items-center p-4 rounded-md border-2 cursor-pointer",
                      formData.cookingSkillLevel === 'advanced' 
                        ? "border-primary bg-primary/5" 
                        : "border-gray-200 hover:border-gray-300"
                    )} onClick={() => handleSkillChange('advanced')}>
                      <RadioGroupItem value="advanced" id="advanced" className="sr-only" />
                      <Label htmlFor="advanced" className="font-medium text-gray-900">Advanced</Label>
                      <p className="text-sm text-center text-gray-700">
                        I'm an experienced cook and enjoy complex recipes and techniques
                      </p>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
              
              <Card className="shadow-lg border-gray-200">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-xl text-gray-900">Time Constraints</CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    How much time do you typically have for cooking?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="px-4">
                    <Slider
                      id="serving-size" 
                      min={1}
                      max={10}
                      step={1}
                      value={[formData.servingSizePreference]}
                      onValueChange={(values: number[]) => {
                        setFormChanged(true)
                        setFormData(prev => ({ ...prev, servingSizePreference: values[0] }))
                      }}
                      className="bg-transparent"
                    />
                    
                    <div className="flex justify-between mt-4">
                      <span className="text-gray-800 font-medium">{formData.servingSizePreference} {formData.servingSizePreference === 1 ? 'person' : 'people'}</span>
                      <span className="text-gray-800 font-medium">
                        {formData.servingSizePreference <= 2 
                          ? 'Small batch' 
                          : formData.servingSizePreference <= 6 
                            ? 'Family size' 
                            : 'Large gathering'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Kitchen Equipment Tab */}
            <TabsContent value="equipment" className="space-y-6 pt-2">
              <Card className="shadow-lg border-gray-200">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-xl text-gray-900">Kitchen Equipment</CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    Select the cooking equipment you have available
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.kitchenEquipment.map(({ name, available }) => (
                      <div key={name} className={`flex items-start space-x-3 p-3 rounded-md transition-colors ${available ? 'bg-green-50 border border-green-100' : 'hover:bg-gray-50'}`}>
                        <Checkbox 
                          id={`equipment-${name}`} 
                          checked={available}
                          onCheckedChange={(checked: boolean | "indeterminate") => handleEquipmentChange(name, checked === true)}
                          className="mt-1"
                        />
                        <div className="space-y-1">
                          <Label 
                            htmlFor={`equipment-${name}`}
                            className="text-base font-medium text-gray-800"
                          >
                            {name}
                          </Label>
                          <p className={`text-sm ${available ? 'text-green-700' : 'text-gray-600'}`}>
                            {available ? "Available in your kitchen" : "Not available"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-green-50 rounded-md border border-green-200">
                    <h4 className="text-base font-medium mb-2 text-green-800 flex items-center">
                      <Utensils className="h-4 w-4 mr-2" />
                      Why Select Equipment?
                    </h4>
                    <p className="text-green-700">
                      Selecting your available kitchen equipment helps us recommend recipes that you can prepare 
                      with what you already have. We'll avoid suggesting recipes requiring equipment you don't own.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Flavor Preferences Tab */}
            <TabsContent value="flavors" className="space-y-6 pt-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900">Flavor Preferences</CardTitle>
                  <CardDescription className="text-gray-600">
                    What flavors do you enjoy most in your cooking?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.flavorPreferences.map(flavor => (
                      <Badge 
                        key={flavor} 
                        variant="secondary"
                        className="px-3 py-1 text-sm flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700"
                      >
                        {flavor}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 rounded-full hover:bg-amber-200 ml-1"
                          onClick={() => handleRemoveFlavor(flavor)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove {flavor}</span>
                        </Button>
                      </Badge>
                    ))}
                    {formData.flavorPreferences.length === 0 && (
                      <p className="text-gray-600 text-sm">No flavor preferences added</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Add a flavor (spicy, savory, sweet, etc.)"
                      value={newFlavor}
                      onChange={(e) => setNewFlavor(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddFlavor}
                      disabled={!newFlavor.trim()}
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  
                  <div className="mt-6 bg-slate-50 rounded-md p-4">
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <LightbulbIcon className="h-4 w-4 mr-2 text-amber-500" />
                      Flavor Suggestions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {["Spicy", "Sweet", "Savory", "Tangy", "Umami", "Fresh", "Herbal", "Citrusy", "Smoky", "Earthy", "Creamy"].map(flavor => (
                        <Badge 
                          key={flavor} 
                          variant="outline"
                          className="cursor-pointer hover:bg-amber-50 px-3 py-1.5 text-sm border border-gray-200 text-gray-700"
                          onClick={() => {
                            if (!formData.flavorPreferences.includes(flavor.toLowerCase())) {
                              setFormChanged(true)
                              setFormData(prev => ({
                                ...prev,
                                flavorPreferences: [...prev.flavorPreferences, flavor.toLowerCase()]
                              }))
                            }
                          }}
                        >
                          {flavor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Cuisine Preferences Tab */}
            <TabsContent value="cuisines" className="space-y-6 pt-2">
              <Card className="shadow-lg border-gray-200">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-xl text-gray-900">Preferred Cuisines</CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    Select cuisines you enjoy or would like to explore
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {CUISINE_TYPES.map(cuisine => (
                      <div
                        key={cuisine}
                        onClick={() => handleCuisineChange(cuisine)}
                        className={`
                          border rounded-md p-4 cursor-pointer transition-colors
                          flex items-center space-x-3 hover:shadow-sm
                          ${formData.cuisinePreferences.includes(cuisine) 
                            ? 'bg-blue-50 border-blue-300 shadow-sm' 
                            : 'hover:bg-slate-50 border-gray-200'}
                        `}
                      >
                        <div 
                          className={`h-4 w-4 shrink-0 rounded-sm border flex items-center justify-center
                            ${formData.cuisinePreferences.includes(cuisine) 
                              ? 'bg-blue-600 border-blue-600' 
                              : 'border-gray-300'}`}
                        >
                          {formData.cuisinePreferences.includes(cuisine) && (
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                              className="h-3 w-3 text-white"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-base font-medium ${
                          formData.cuisinePreferences.includes(cuisine) 
                            ? 'text-blue-800' 
                            : 'text-gray-800'
                        }`}>{cuisine}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
                    <h4 className="text-base font-medium mb-2 text-blue-800 flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      Why Select Cuisines?
                    </h4>
                    <p className="text-blue-700">
                      Selecting your favorite cuisines helps us recommend recipes that match your taste preferences. 
                      We'll prioritize recipes from cuisines you love while still offering variety.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="sticky bottom-0 inset-x-0 bg-gradient-to-t from-white via-white to-white/80 pt-6 pb-4 px-4">
            <div className="flex justify-between max-w-4xl mx-auto">
              <Button 
                type="button" 
                variant="outline" 
                className="text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900" 
                onClick={() => router.push('/user/profile')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium" 
                disabled={!formChanged || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> 
                    <span className="text-white">Saving...</span>
                  </>
                ) : (
                  <>
                    <span className="text-white">Save Preferences</span> <Save className="h-4 w-4 text-white" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 