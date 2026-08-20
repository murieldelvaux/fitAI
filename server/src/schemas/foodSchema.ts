import { z } from 'zod';

export const foodNutritionSchema = z.object({
  name: z.string().min(1, 'Food name is required'),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  fiber: z.number().nonnegative().optional(),
  servingSize: z.number().positive().default(100),
  servingUnit: z.string().default('g'),
});

export const foodSearchQuerySchema = z.object({
  q: z.string().min(1, 'Query param "q" is required'),
});

export type FoodNutritionSchema = z.infer<typeof foodNutritionSchema>;
export type FoodSearchQuerySchema = z.infer<typeof foodSearchQuerySchema>;
