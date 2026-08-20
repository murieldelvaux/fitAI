export interface FoodNutrition {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  servingSize: number;
  servingUnit: string;
}

export interface FoodSearchResponse {
  query: string;
  food: FoodNutrition;
  source: 'mock' | 'openfoodfacts';
}
