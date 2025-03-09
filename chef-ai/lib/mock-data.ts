import { Recipe } from "./types";

export const generateSampleRecipes = (): Recipe[] => {
  return [
    {
      id: "recipe-1",
      title: "Creamy Tomato Pasta",
      ingredients: [
        "8 oz pasta",
        "1 can (14 oz) crushed tomatoes",
        "1/2 cup heavy cream",
        "1/4 cup grated Parmesan cheese",
        "2 cloves garlic, minced",
        "1 tablespoon olive oil",
        "1 teaspoon dried basil",
        "Salt and pepper to taste"
      ],
      instructions: [
        "Cook pasta according to package directions until al dente.",
        "In a large skillet, heat olive oil over medium heat. Add garlic and cook until fragrant, about 30 seconds.",
        "Add crushed tomatoes and bring to a simmer. Cook for 5 minutes.",
        "Reduce heat to low and stir in heavy cream. Simmer for 2-3 minutes until slightly thickened.",
        "Add Parmesan cheese, basil, salt, and pepper. Stir until cheese is melted.",
        "Drain pasta and add to the sauce. Toss to coat evenly.",
        "Serve hot with additional Parmesan cheese if desired."
      ],
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&auto=format&fit=crop",
      nutritionalValue: {
        calories: 450,
        protein: 12,
        carbs: 65,
        fat: 18
      },
      servings: 2,
      status: "all"
    },
    {
      id: "recipe-2",
      title: "Avocado Toast with Poached Eggs",
      description: "A nutritious breakfast option that's quick and delicious",
      ingredients: [
        "2 slices whole grain bread",
        "1 ripe avocado",
        "2 eggs",
        "1 tablespoon white vinegar",
        "1/2 teaspoon red pepper flakes",
        "Salt and pepper to taste",
        "1 tablespoon fresh lemon juice",
        "2 teaspoons olive oil"
      ],
      instructions: [
        "Toast the bread slices until golden and crisp.",
        "In a small bowl, mash the avocado with lemon juice, salt, and pepper.",
        "Fill a medium pot with about 3 inches of water. Add vinegar and bring to a gentle simmer.",
        "Crack each egg into a small cup, then carefully slip into the simmering water.",
        "Cook eggs for 3-4 minutes for runny yolks, or longer if desired.",
        "Spread the mashed avocado evenly on the toast slices.",
        "Use a slotted spoon to remove eggs from water and place on paper towels to drain.",
        "Place one egg on each toast slice, sprinkle with red pepper flakes, and drizzle with olive oil.",
        "Season with additional salt and pepper if desired and serve immediately."
      ],
      image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop",
      nutritionalValue: {
        calories: 350,
        protein: 15,
        carbs: 30,
        fat: 20
      },
      servings: 2,
      status: "all"
    },
    {
      id: "recipe-3",
      title: "Grilled Chicken Salad",
      description: "A fresh and healthy salad perfect for lunch or dinner",
      ingredients: [
        "2 boneless, skinless chicken breasts",
        "6 cups mixed salad greens",
        "1 cucumber, sliced",
        "1 cup cherry tomatoes, halved",
        "1/4 red onion, thinly sliced",
        "1/4 cup feta cheese, crumbled",
        "2 tablespoons olive oil",
        "1 tablespoon balsamic vinegar",
        "1 teaspoon honey",
        "1 clove garlic, minced",
        "Salt and pepper to taste"
      ],
      instructions: [
        "Season chicken breasts with salt and pepper.",
        "Grill chicken over medium-high heat for 6-7 minutes per side until cooked through.",
        "Let chicken rest for 5 minutes, then slice into strips.",
        "In a large bowl, combine salad greens, cucumber, cherry tomatoes, and red onion.",
        "In a small bowl, whisk together olive oil, balsamic vinegar, honey, garlic, salt, and pepper to make the dressing.",
        "Toss the salad with the dressing.",
        "Top with sliced grilled chicken and crumbled feta cheese.",
        "Serve immediately."
      ],
      image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&auto=format&fit=crop",
      nutritionalValue: {
        calories: 320,
        protein: 28,
        carbs: 12,
        fat: 18
      },
      servings: 2,
      status: "all"
    }
  ];
}; 