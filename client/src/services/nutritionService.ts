import { api } from './api';
import { DailyNutritionSummary, MacroGoals } from '../types/nutrition';

export async function fetchDailyNutrition(
  date?: string,
  customGoals?: MacroGoals
): Promise<DailyNutritionSummary> {
  const params: Record<string, string | number | undefined> = {
    date,
    ...(customGoals ? {
      calories: customGoals.calories,
      protein: customGoals.protein,
      carbs: customGoals.carbs,
      fat: customGoals.fat,
    } : {}),
  };

  const response = await api.get<{ success: boolean; data: DailyNutritionSummary }>('/nutrition/daily', { params });
  return response.data.data;
}
