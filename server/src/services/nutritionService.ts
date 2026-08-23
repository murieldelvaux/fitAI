import { DailyNutritionSummary, MacroGoals } from '../types/nutrition';
import { getMeals } from './mealsService';

export const DEFAULT_GOALS: MacroGoals = {
  calories: 2200,
  protein: 160,
  carbs: 220,
  fat: 70,
};

export async function getDailyNutrition(
  dateStr?: string,
  customGoals: MacroGoals = DEFAULT_GOALS
): Promise<DailyNutritionSummary> {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  const meals = await getMeals({ date: targetDate });

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  const mealTypeBreakdown = {
    breakfast: { calories: 0, count: 0 },
    lunch: { calories: 0, count: 0 },
    dinner: { calories: 0, count: 0 },
    snack: { calories: 0, count: 0 },
    supper: { calories: 0, count: 0 },
  };

  for (const meal of meals) {
    totalCalories += meal.totalCalories;
    totalProtein += meal.totalProtein;
    totalCarbs += meal.totalCarbs;
    totalFat += meal.totalFat;

    if (mealTypeBreakdown[meal.mealType]) {
      mealTypeBreakdown[meal.mealType].calories += meal.totalCalories;
      mealTypeBreakdown[meal.mealType].count += 1;
    }
  }

  const roundedProtein = parseFloat(totalProtein.toFixed(1));
  const roundedCarbs = parseFloat(totalCarbs.toFixed(1));
  const roundedFat = parseFloat(totalFat.toFixed(1));

  return {
    date: targetDate,
    calories: {
      consumed: totalCalories,
      target: customGoals.calories,
      remaining: Math.max(0, customGoals.calories - totalCalories),
      percentage: Math.min(100, Math.round((totalCalories / customGoals.calories) * 100)),
    },
    protein: {
      consumed: roundedProtein,
      target: customGoals.protein,
      remaining: Math.max(0, parseFloat((customGoals.protein - roundedProtein).toFixed(1))),
      percentage: Math.min(100, Math.round((roundedProtein / customGoals.protein) * 100)),
    },
    carbs: {
      consumed: roundedCarbs,
      target: customGoals.carbs,
      remaining: Math.max(0, parseFloat((customGoals.carbs - roundedCarbs).toFixed(1))),
      percentage: Math.min(100, Math.round((roundedCarbs / customGoals.carbs) * 100)),
    },
    fat: {
      consumed: roundedFat,
      target: customGoals.fat,
      remaining: Math.max(0, parseFloat((customGoals.fat - roundedFat).toFixed(1))),
      percentage: Math.min(100, Math.round((roundedFat / customGoals.fat) * 100)),
    },
    mealsCount: meals.length,
    meals,
    mealTypeBreakdown,
  };
}
