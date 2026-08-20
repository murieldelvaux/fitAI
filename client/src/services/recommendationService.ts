import { api } from './api';
import { RecommendationsResponse } from '../types/recommendation';
import { MacroGoals } from '../types/nutrition';

export async function fetchRecommendations(
  date?: string,
  customGoals?: MacroGoals
): Promise<RecommendationsResponse> {
  const params: Record<string, string | number | undefined> = {
    date,
    ...(customGoals ? {
      calories: customGoals.calories,
      protein: customGoals.protein,
      carbs: customGoals.carbs,
      fat: customGoals.fat,
    } : {}),
  };

  const response = await api.get<{ success: boolean; data: RecommendationsResponse }>('/recommendations', {
    params,
  });
  return response.data.data;
}
