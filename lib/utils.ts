import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ShoppingListItem } from "./types";

/**
 * Combines multiple class names and merges Tailwind CSS classes
 * This utility is commonly used with class-variance-authority (cva)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as a fraction if it has a decimal component,
 * otherwise returns it as a whole number
 */
export function formatQuantity(value: number): string {
  if (!value || isNaN(value)) return "";
  
  // If it's a whole number, return it as is
  if (value === Math.floor(value)) {
    return value.toString();
  }
  
  // Handle common fractions for better readability
  const decimal = value - Math.floor(value);
  const fractionMap: Record<string, string> = {
    '0.25': '1/4',
    '0.33': '1/3',
    '0.5': '1/2',
    '0.66': '2/3',
    '0.67': '2/3',
    '0.75': '3/4',
  };
  
  // Round to two decimal places for fraction matching
  const roundedDecimal = Math.round(decimal * 100) / 100;
  const roundedStr = roundedDecimal.toFixed(2);
  
  // Check if we have a common fraction mapping
  if (fractionMap[roundedStr]) {
    const whole = Math.floor(value);
    return whole > 0 ? `${whole} ${fractionMap[roundedStr]}` : fractionMap[roundedStr];
  }
  
  // For other cases, return the number with up to 2 decimal places
  return value.toFixed(2).replace(/\.00$/, '').replace(/\.0$/, '');
}

/**
 * Parse an ingredient string to extract the quantity, unit, and ingredient name
 */
export function parseIngredient(ingredientStr: string): { 
  quantity: number | null, 
  unit: string | null, 
  name: string 
} {
  // Default return object
  const result = {
    quantity: null as number | null,
    unit: null as string | null,
    name: ingredientStr.trim()
  };
  
  // If empty string, return default
  if (!ingredientStr.trim()) return result;
  
  // Common cooking units
  const units = [
    'cup', 'cups', 'c',
    'tablespoon', 'tablespoons', 'tbsp', 'tbs', 'T',
    'teaspoon', 'teaspoons', 'tsp', 't',
    'ounce', 'ounces', 'oz',
    'pound', 'pounds', 'lb', 'lbs',
    'gram', 'grams', 'g',
    'kilogram', 'kilograms', 'kg',
    'milliliter', 'milliliters', 'ml',
    'liter', 'liters', 'l',
    'pint', 'pints', 'pt',
    'quart', 'quarts', 'qt',
    'gallon', 'gallons', 'gal',
    'pinch', 'pinches',
    'dash', 'dashes',
    'bunch', 'bunches',
    'can', 'cans',
    'jar', 'jars',
    'package', 'packages', 'pkg',
    'slice', 'slices',
    'piece', 'pieces',
    'clove', 'cloves',
    'head', 'heads',
    'whole',
  ];
  
  // Common fraction character replacements
  const fractionMap: Record<string, number> = {
    '½': 0.5,
    '⅓': 1/3,
    '⅔': 2/3,
    '¼': 0.25,
    '¾': 0.75,
    '⅕': 0.2,
    '⅖': 0.4,
    '⅗': 0.6,
    '⅘': 0.8,
    '⅙': 1/6,
    '⅚': 5/6,
    '⅐': 1/7,
    '⅛': 0.125,
    '⅜': 0.375,
    '⅝': 0.625,
    '⅞': 0.875,
  };
  
  // Replace unicode fractions with decimal equivalents
  let normalizedStr = ingredientStr;
  for (const [fraction, decimal] of Object.entries(fractionMap)) {
    normalizedStr = normalizedStr.replace(fraction, ` ${decimal} `);
  }
  
  // Convert common written fractions to decimal
  normalizedStr = normalizedStr
    .replace(/(\d+)\s+(\d+)\/(\d+)/g, (_, whole, num, den) => 
      String(parseInt(whole) + parseInt(num) / parseInt(den))
    )
    .replace(/(\d+)\/(\d+)/g, (_, num, den) => 
      String(parseInt(num) / parseInt(den))
    );
  
  // Regex to match quantity + unit at the beginning of the string
  const qtyUnitRegex = new RegExp(
    `^\\s*(\\d*\\.?\\d+)?\\s*(${units.join('|')})?\\s+(.+)$`, 'i'
  );
  
  const match = normalizedStr.match(qtyUnitRegex);
  
  if (match) {
    const [_, quantity, unit, name] = match;
    
    result.name = name.trim();
    
    if (quantity) {
      result.quantity = parseFloat(quantity);
    }
    
    if (unit) {
      result.unit = unit.toLowerCase();
    }
  }
  
  return result;
}

/**
 * Combines similar ingredients and sums their quantities
 * Returns a list of consolidated ingredients
 */
export function combineIngredients(shoppingItems: ShoppingListItem[]) {
  // Group by ingredient name and unit
  const ingredientGroups: Record<string, {
    items: ShoppingListItem[],
    totalQuantity: number,
    unit: string | null
  }> = {};
  
  // First pass: group similar ingredients
  for (const item of shoppingItems) {
    const { quantity, unit, name } = parseIngredient(item.ingredient);
    
    // Create a normalized key for grouping
    const normalizedName = name.toLowerCase().trim();
    // Include the unit in the key if present
    const key = unit ? `${normalizedName}|${unit}` : normalizedName;
    
    if (!ingredientGroups[key]) {
      ingredientGroups[key] = {
        items: [],
        totalQuantity: 0,
        unit: unit
      };
    }
    
    ingredientGroups[key].items.push(item);
    
    // Add the quantity if it exists
    if (quantity !== null) {
      ingredientGroups[key].totalQuantity += quantity;
    }
  }
  
  // Convert groups to combined items
  return Object.entries(ingredientGroups).map(([key, group]) => {
    const { totalQuantity, unit, items } = group;
    const { name } = parseIngredient(items[0].ingredient);
    
    // Generate the consolidated text
    let combinedText: string;
    
    if (totalQuantity > 0) {
      const formattedQty = formatQuantity(totalQuantity);
      combinedText = unit 
        ? `${formattedQty} ${unit} ${name}`
        : `${formattedQty} ${name}`;
    } else {
      // If no quantity, just use the original text
      combinedText = name;
    }
    
    // Get unique recipe names
    const recipeNames = Array.from(
      new Set(items.map(item => item.recipeName))
    );
    
    return {
      combinedText,
      originalItems: items,
      totalQuantity,
      unit,
      name,
      recipes: recipeNames
    };
  });
} 