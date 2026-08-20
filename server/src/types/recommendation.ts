import { FoodNutrition } from './food';

export interface MealRecommendation {
  id: string;
  name: string;
  category: 'high_protein' | 'low_carb' | 'balanced' | 'quick_snack' | 'post_workout';
  description: string;
  whyItFits: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTimeMinutes: number;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
    nutrition: FoodNutrition;
  }[];
}

export interface RecommendationsResponse {
  recommendations: MealRecommendation[];
  macroDeficit: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}
