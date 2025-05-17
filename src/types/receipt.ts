
export interface Store {
  id: string;
  name: string;
  address: string;
  user_id: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
  unit: string;
}

export interface GeneratedItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  isEdited?: boolean;
}

export interface ManualItem {
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
}

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

// Enhanced ingredient variations with more alternatives
export interface IngredientVariation {
  baseIngredient: string;
  variations: string[];
}

// Comprehensive mapping of common ingredient variations
export const ingredientVariations: Record<string, string[]> = {
  'flour': ['all-purpose flour', 'wheat flour', 'bread flour', 'plain flour', 'all purpose flour', 'ap flour'],
  'sugar': ['white sugar', 'granulated sugar', 'brown sugar', 'cane sugar', 'powdered sugar', 'icing sugar'],
  'salt': ['sea salt', 'table salt', 'kosher salt', 'iodized salt', 'pink salt', 'himalayan salt'],
  'milk': ['whole milk', 'skim milk', '2% milk', 'almond milk', 'oat milk', 'soy milk', 'dairy milk'],
  'oil': ['olive oil', 'vegetable oil', 'canola oil', 'cooking oil', 'sunflower oil', 'coconut oil'],
  'eggs': ['egg', 'large eggs', 'egg whites', 'free-range eggs', 'organic eggs', 'medium eggs'],
  'butter': ['unsalted butter', 'salted butter', 'margarine', 'dairy butter', 'plant butter'],
  'cheese': ['cheddar cheese', 'mozzarella cheese', 'parmesan cheese', 'feta cheese', 'cream cheese'],
  'onion': ['yellow onion', 'white onion', 'red onion', 'green onion', 'sweet onion', 'shallots'],
  'garlic': ['garlic clove', 'minced garlic', 'garlic powder', 'garlic bulb', 'crushed garlic'],
  'pepper': ['black pepper', 'white pepper', 'bell pepper', 'chili pepper', 'red pepper', 'green pepper'],
  'tomato': ['cherry tomatoes', 'roma tomatoes', 'tomato paste', 'tomato sauce', 'canned tomatoes'],
  'potato': ['russet potato', 'sweet potato', 'yukon gold potato', 'red potato', 'baby potatoes'],
  'rice': ['white rice', 'brown rice', 'basmati rice', 'jasmine rice', 'wild rice', 'arborio rice'],
  'pasta': ['spaghetti', 'penne', 'macaroni', 'linguine', 'fettuccine', 'rigatoni', 'farfalle'],
  'chicken': ['chicken breast', 'chicken thigh', 'chicken wings', 'rotisserie chicken', 'chicken drumsticks'],
  'beef': ['ground beef', 'steak', 'beef chuck', 'sirloin', 'ribeye', 'beef mince'],
  'water': ['filtered water', 'tap water', 'spring water', 'distilled water'],
  'bread': ['white bread', 'whole wheat bread', 'sourdough', 'multigrain bread', 'french bread'],
  'apple': ['green apple', 'red apple', 'gala apple', 'fuji apple', 'granny smith'],
  'carrot': ['baby carrots', 'carrot sticks', 'whole carrots', 'diced carrots'],
  'lemon': ['lemon juice', 'lemon zest', 'fresh lemon', 'preserved lemon'],
  'herbs': ['basil', 'parsley', 'cilantro', 'rosemary', 'thyme', 'oregano', 'mint'],
  'spices': ['cinnamon', 'cumin', 'coriander', 'paprika', 'turmeric', 'nutmeg'],
};

// New interface for recipe ingredients with availability info
export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  available: boolean;
}

// New interface for recipes with ingredients and availability
export interface Recipe {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  preparationTime?: string;
  difficulty?: string;
  category?: string;
  ingredients: RecipeIngredient[];
  missingCount: number;
}
