
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

// New interface for ingredient variations
export interface IngredientVariation {
  baseIngredient: string;
  variations: string[];
}

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
