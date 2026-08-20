import { MealRecommendation, RecommendationsResponse } from '../types/recommendation';
import { MacroGoals } from '../types/nutrition';
import { getDailyNutrition, DEFAULT_GOALS } from './nutritionService';
import { mockFoods } from '../data/mockFoods';

// Catalog of potential smart meal recommendations
const recommendationCatalog: Omit<MealRecommendation, 'whyItFits'>[] = [
  {
    id: 'rec-salmon-bowl',
    name: 'Grilled Salmon Quinoa Power Bowl',
    category: 'high_protein',
    description: 'Fresh grilled salmon over warm quinoa, steamed broccoli, and avocado slices.',
    calories: 520,
    protein: 42,
    carbs: 38,
    fat: 22,
    prepTimeMinutes: 20,
    ingredients: [
      { name: 'salmon', quantity: 180, unit: 'g', nutrition: mockFoods['salmon'] },
      { name: 'broccoli', quantity: 120, unit: 'g', nutrition: mockFoods['broccoli'] },
      { name: 'avocado', quantity: 40, unit: 'g', nutrition: mockFoods['avocado'] },
      { name: 'brown rice', quantity: 100, unit: 'g', nutrition: mockFoods['brown rice'] },
    ],
  },
  {
    id: 'rec-greek-yogurt-parfait',
    name: 'High-Protein Greek Yogurt Parfait',
    category: 'quick_snack',
    description: 'Thick non-fat Greek yogurt layered with sliced banana, rolled oats, and raw almonds.',
    calories: 340,
    protein: 28,
    carbs: 42,
    fat: 8,
    prepTimeMinutes: 5,
    ingredients: [
      { name: 'greek yogurt', quantity: 200, unit: 'g', nutrition: mockFoods['greek yogurt'] },
      { name: 'banana', quantity: 1, unit: 'medium', nutrition: mockFoods['banana'] },
      { name: 'oats', quantity: 30, unit: 'g', nutrition: mockFoods['oats'] },
      { name: 'almonds', quantity: 15, unit: 'g', nutrition: mockFoods['almonds'] },
    ],
  },
  {
    id: 'rec-post-workout-shake',
    name: 'Anabolic Peanut Butter Whey Shake',
    category: 'post_workout',
    description: 'Whey protein isolate blended with oat flour, banana, and natural peanut butter.',
    calories: 410,
    protein: 38,
    carbs: 45,
    fat: 10,
    prepTimeMinutes: 3,
    ingredients: [
      { name: 'whey protein', quantity: 1, unit: 'scoop', nutrition: mockFoods['whey protein'] },
      { name: 'banana', quantity: 1, unit: 'medium', nutrition: mockFoods['banana'] },
      { name: 'oats', quantity: 40, unit: 'g', nutrition: mockFoods['oats'] },
      { name: 'peanut butter', quantity: 15, unit: 'g', nutrition: mockFoods['peanut butter'] },
    ],
  },
  {
    id: 'rec-lean-beef-sweet-potato',
    name: 'Lean Beef & Roasted Sweet Potato Hash',
    category: 'balanced',
    description: 'Extra-lean sautéed beef hash served with cubed sweet potatoes and steamed greens.',
    calories: 480,
    protein: 46,
    carbs: 44,
    fat: 14,
    prepTimeMinutes: 25,
    ingredients: [
      { name: 'lean beef', quantity: 160, unit: 'g', nutrition: mockFoods['lean beef'] },
      { name: 'sweet potato', quantity: 200, unit: 'g', nutrition: mockFoods['sweet potato'] },
      { name: 'broccoli', quantity: 100, unit: 'g', nutrition: mockFoods['broccoli'] },
      { name: 'olive oil', quantity: 5, unit: 'ml', nutrition: mockFoods['olive oil'] },
    ],
  },
  {
    id: 'rec-egg-white-avocado-toast',
    name: 'Egg & Avocado Artisan Toast',
    category: 'balanced',
    description: 'Two poached eggs over toasted artisan whole wheat bread with mashed Hass avocado.',
    calories: 320,
    protein: 18,
    carbs: 26,
    fat: 16,
    prepTimeMinutes: 10,
    ingredients: [
      { name: 'egg', quantity: 2, unit: 'unit', nutrition: mockFoods['egg'] },
      { name: 'whole wheat bread', quantity: 2, unit: 'slice', nutrition: mockFoods['whole wheat bread'] },
      { name: 'avocado', quantity: 50, unit: 'g', nutrition: mockFoods['avocado'] },
    ],
  },
];

export async function getRecommendations(
  dateStr?: string,
  customGoals: MacroGoals = DEFAULT_GOALS
): Promise<RecommendationsResponse> {
  const dailyNutrition = await getDailyNutrition(dateStr, customGoals);

  const deficit = {
    calories: dailyNutrition.calories.remaining,
    protein: dailyNutrition.protein.remaining,
    carbs: dailyNutrition.carbs.remaining,
    fat: dailyNutrition.fat.remaining,
  };

  const recommendationsWithWhy: MealRecommendation[] = recommendationCatalog.map(meal => {
    let why = '';
    if (deficit.protein > 30 && meal.protein >= 35) {
      why = `Fills ${Math.round((meal.protein / (deficit.protein || 1)) * 100)}% of your remaining ${deficit.protein}g protein target with lean sources.`;
    } else if (deficit.calories < 400 && meal.calories <= 350) {
      why = `Light and calorie-conscious (${meal.calories} kcal) to fit perfectly within your remaining budget.`;
    } else if (deficit.carbs > 40 && meal.carbs >= 35) {
      why = `Provides quality complex carbohydrates (${meal.carbs}g) to replenish glycogen stores.`;
    } else {
      why = `Balanced macro distribution (${meal.protein}g P / ${meal.carbs}g C / ${meal.fat}g F) to help reach your daily targets.`;
    }

    return {
      ...meal,
      whyItFits: why,
    };
  });

  return {
    recommendations: recommendationsWithWhy,
    macroDeficit: deficit,
  };
}
