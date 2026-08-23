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

export interface OpenFoodFactsProduct {
  product_name: string;
  nutriments: {
    'energy-kcal_100g'?: number;
    'proteins_100g'?: number;
    'carbohydrates_100g'?: number;
    'fat_100g'?: number;
  };
}

export interface OpenFoodFactsResponse {
  products: OpenFoodFactsProduct[];
  count: number;
}

export interface FoodSearchResponse {
  query: string;
  food: FoodNutrition;
  source: 'mock' | 'openfoodfacts';
}
