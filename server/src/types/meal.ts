import { FoodNutrition } from './food';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealFoodItem {
  name: string;
  quantity: number;
  unit: string;
  nutrition: FoodNutrition;
  calculatedCalories: number;
  calculatedProtein: number;
  calculatedCarbs: number;
  calculatedFat: number;
}

export interface Meal {
  id: string;
  name: string;
  mealType: MealType;
  loggedAt: string; // ISO date string
  rawDescription?: string;
  items: MealFoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface CreateMealDto {
  name: string;
  mealType?: MealType;
  loggedAt?: string;
  rawDescription?: string;
  items: {
    name: string;
    quantity: number;
    unit: string;
    nutrition?: Partial<FoodNutrition>;
  }[];
}
