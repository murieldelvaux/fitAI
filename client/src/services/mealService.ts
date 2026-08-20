import { api } from './api';
import { Meal, CreateMealDto, MealType } from '../types/meal';

export async function fetchMeals(params?: { date?: string; mealType?: MealType }): Promise<Meal[]> {
  const response = await api.get<{ success: boolean; data: Meal[] }>('/meals', { params });
  return response.data.data;
}

export async function createMeal(dto: CreateMealDto): Promise<Meal> {
  const response = await api.post<{ success: boolean; data: Meal }>('/meals', dto);
  return response.data.data;
}

export async function deleteMeal(id: string): Promise<{ id: string }> {
  const response = await api.delete<{ success: boolean; id: string }>(`/meals/${id}`);
  return { id: response.data.id };
}
