import { Meal, CreateMealDto, MealType, MealFoodItem } from '../types/meal';
import { searchFood } from './foodsService';

// In-memory store for meals
let mealsStore: Meal[] = [];

// Helper to calculate exact macros for a food item given quantity and unit
function calculateItemMacros(
  quantity: number,
  unit: string,
  nutrition: { calories: number; protein: number; carbs: number; fat: number; servingSize: number }
) {
  let multiplier = 1;
  const normalizedUnit = unit.toLowerCase();

  if (normalizedUnit === 'g' || normalizedUnit === 'gr' || normalizedUnit === 'gramas' || normalizedUnit === 'ml') {
    multiplier = quantity / (nutrition.servingSize || 100);
  } else if (normalizedUnit === 'unit' || normalizedUnit === 'unidade' || normalizedUnit === 'medium' || normalizedUnit === 'large' || normalizedUnit === 'small') {
    multiplier = quantity;
  } else if (normalizedUnit === 'tbsp' || normalizedUnit === 'colher') {
    // Approx 15g
    multiplier = (quantity * 15) / (nutrition.servingSize || 100);
  } else if (normalizedUnit === 'scoop') {
    multiplier = quantity;
  } else if (normalizedUnit === 'slice' || normalizedUnit === 'fatia') {
    multiplier = quantity;
  } else {
    multiplier = quantity / (nutrition.servingSize || 100);
  }

  return {
    calculatedCalories: Math.round(nutrition.calories * multiplier),
    calculatedProtein: parseFloat((nutrition.protein * multiplier).toFixed(1)),
    calculatedCarbs: parseFloat((nutrition.carbs * multiplier).toFixed(1)),
    calculatedFat: parseFloat((nutrition.fat * multiplier).toFixed(1)),
  };
}

// Seed initial mock meals for today
function seedInitialMeals() {
  const now = new Date();
  const todayStr = now.toISOString();

  // Breakfast: Eggs + Whole Wheat Bread + Avocado
  const breakfastItems: MealFoodItem[] = [
    {
      name: 'Whole Large Egg',
      quantity: 2,
      unit: 'unit',
      nutrition: {
        name: 'Whole Large Egg',
        calories: 72,
        protein: 6.3,
        carbs: 0.4,
        fat: 4.8,
        servingSize: 50,
        servingUnit: 'unit',
      },
      calculatedCalories: 144,
      calculatedProtein: 12.6,
      calculatedCarbs: 0.8,
      calculatedFat: 9.6,
    },
    {
      name: 'Whole Wheat Bread',
      quantity: 2,
      unit: 'slice',
      nutrition: {
        name: 'Whole Wheat Bread',
        calories: 69,
        protein: 3.6,
        carbs: 11.6,
        fat: 0.9,
        servingSize: 30,
        servingUnit: 'slice',
      },
      calculatedCalories: 138,
      calculatedProtein: 7.2,
      calculatedCarbs: 23.2,
      calculatedFat: 1.8,
    },
    {
      name: 'Avocado',
      quantity: 50,
      unit: 'g',
      nutrition: {
        name: 'Avocado',
        calories: 160,
        protein: 2.0,
        carbs: 8.5,
        fat: 14.7,
        servingSize: 100,
        servingUnit: 'g',
      },
      calculatedCalories: 80,
      calculatedProtein: 1.0,
      calculatedCarbs: 4.3,
      calculatedFat: 7.4,
    },
  ];

  const breakfast: Meal = {
    id: 'seed-meal-1',
    name: 'Breakfast Omelet & Avocado Toast',
    mealType: 'breakfast',
    loggedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 30).toISOString(),
    rawDescription: '2 ovos mexidos com 2 fatias de pão integral e 50g de abacate',
    items: breakfastItems,
    totalCalories: 362,
    totalProtein: 20.8,
    totalCarbs: 28.3,
    totalFat: 18.8,
  };

  // Lunch: Grilled Chicken + Sweet Potato + Broccoli
  const lunchItems: MealFoodItem[] = [
    {
      name: 'Grilled Chicken Breast',
      quantity: 200,
      unit: 'g',
      nutrition: {
        name: 'Grilled Chicken Breast',
        calories: 165,
        protein: 31.0,
        carbs: 0.0,
        fat: 3.6,
        servingSize: 100,
        servingUnit: 'g',
      },
      calculatedCalories: 330,
      calculatedProtein: 62.0,
      calculatedCarbs: 0.0,
      calculatedFat: 7.2,
    },
    {
      name: 'Sweet Potato (Cooked)',
      quantity: 150,
      unit: 'g',
      nutrition: {
        name: 'Sweet Potato (Cooked)',
        calories: 86,
        protein: 1.6,
        carbs: 20.1,
        fat: 0.1,
        servingSize: 100,
        servingUnit: 'g',
      },
      calculatedCalories: 129,
      calculatedProtein: 2.4,
      calculatedCarbs: 30.2,
      calculatedFat: 0.2,
    },
    {
      name: 'Steamed Broccoli',
      quantity: 100,
      unit: 'g',
      nutrition: {
        name: 'Steamed Broccoli',
        calories: 35,
        protein: 2.4,
        carbs: 7.2,
        fat: 0.4,
        servingSize: 100,
        servingUnit: 'g',
      },
      calculatedCalories: 35,
      calculatedProtein: 2.4,
      calculatedCarbs: 7.2,
      calculatedFat: 0.4,
    },
    {
      name: 'Extra Virgin Olive Oil',
      quantity: 10,
      unit: 'ml',
      nutrition: {
        name: 'Extra Virgin Olive Oil',
        calories: 884,
        protein: 0.0,
        carbs: 0.0,
        fat: 100.0,
        servingSize: 100,
        servingUnit: 'g',
      },
      calculatedCalories: 88,
      calculatedProtein: 0.0,
      calculatedCarbs: 0.0,
      calculatedFat: 10.0,
    },
  ];

  const lunch: Meal = {
    id: 'seed-meal-2',
    name: 'Grilled Chicken with Sweet Potato & Broccoli',
    mealType: 'lunch',
    loggedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 0).toISOString(),
    rawDescription: '200g peito de frango grelhado com 150g batata doce, brócolis e azeite',
    items: lunchItems,
    totalCalories: 582,
    totalProtein: 66.8,
    totalCarbs: 37.4,
    totalFat: 17.8,
  };

  mealsStore = [breakfast, lunch];
}

// Seed on startup
seedInitialMeals();

export async function createMeal(dto: CreateMealDto): Promise<Meal> {
  const processedItems: MealFoodItem[] = [];

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const item of dto.items) {
    const nutrition = item.nutrition
      ? {
          name: item.nutrition.name || item.name,
          calories: item.nutrition.calories ?? 150,
          protein: item.nutrition.protein ?? 10,
          carbs: item.nutrition.carbs ?? 15,
          fat: item.nutrition.fat ?? 5,
          fiber: item.nutrition.fiber ?? 0,
          servingSize: item.nutrition.servingSize ?? 100,
          servingUnit: item.nutrition.servingUnit ?? 'g',
        }
      : await searchFood(item.name);

    const calculated = calculateItemMacros(item.quantity, item.unit, nutrition);

    processedItems.push({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      nutrition,
      ...calculated,
    });

    totalCalories += calculated.calculatedCalories;
    totalProtein += calculated.calculatedProtein;
    totalCarbs += calculated.calculatedCarbs;
    totalFat += calculated.calculatedFat;
  }

  // Determine meal type automatically if not provided
  let mealType: MealType = dto.mealType || 'lunch';
  if (!dto.mealType) {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) mealType = 'breakfast';
    else if (hour >= 11 && hour < 16) mealType = 'lunch';
    else if (hour >= 16 && hour < 19) mealType = 'snack';
    else mealType = 'dinner';
  }

  const newMeal: Meal = {
    id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: dto.name || 'Logged Meal',
    mealType,
    loggedAt: dto.loggedAt || new Date().toISOString(),
    rawDescription: dto.rawDescription,
    items: processedItems,
    totalCalories: Math.round(totalCalories),
    totalProtein: parseFloat(totalProtein.toFixed(1)),
    totalCarbs: parseFloat(totalCarbs.toFixed(1)),
    totalFat: parseFloat(totalFat.toFixed(1)),
  };

  mealsStore.unshift(newMeal);
  return newMeal;
}

export async function getMeals(filter?: { date?: string; mealType?: MealType }): Promise<Meal[]> {
  let filtered = [...mealsStore];

  if (filter?.date) {
    filtered = filtered.filter(meal => meal.loggedAt.startsWith(filter.date!));
  }

  if (filter?.mealType) {
    filtered = filtered.filter(meal => meal.mealType === filter.mealType);
  }

  return filtered;
}

export async function getMealById(id: string): Promise<Meal | null> {
  const meal = mealsStore.find(m => m.id === id);
  return meal || null;
}

export async function deleteMeal(id: string): Promise<boolean> {
  const initialLength = mealsStore.length;
  mealsStore = mealsStore.filter(m => m.id !== id);
  return mealsStore.length < initialLength;
}

export async function clearAllMeals(): Promise<void> {
  mealsStore = [];
}
