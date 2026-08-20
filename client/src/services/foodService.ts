import { api } from './api';
import { FoodNutrition } from '../types/food';

export async function searchFood(query: string): Promise<FoodNutrition> {
  const response = await api.get<{ success: boolean; data: FoodNutrition }>('/foods/search', {
    params: { q: query },
  });
  return response.data.data;
}
