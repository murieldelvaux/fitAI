import { Meal } from './meal';

export interface MacroGoals {
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
}

export interface MacroSummary {
  consumed: number;
  target: number;
  remaining: number;
  percentage: number;
}

export interface DailyNutritionSummary {
  date: string;
  calories: MacroSummary;
  protein: MacroSummary;
  carbs: MacroSummary;
  fat: MacroSummary;
  mealsCount: number;
  meals: Meal[];
  mealTypeBreakdown: {
    breakfast: { calories: number; count: number };
    lunch: { calories: number; count: number };
    dinner: { calories: number; count: number };
    snack: { calories: number; count: number };
  };
}
