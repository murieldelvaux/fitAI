import { z } from 'zod';
import { foodNutritionSchema } from './foodSchema';

export const mealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'supper']);

export const mealItemInputSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required'),
  nutrition: foodNutritionSchema.partial().optional(),
});

export const createMealSchema = z.object({
  name: z.string().min(1, 'Meal name is required'),
  mealType: mealTypeSchema.optional(),
  loggedAt: z.string().datetime().optional(),
  rawDescription: z.string().optional(),
  items: z.array(mealItemInputSchema).min(1, 'Meal must contain at least 1 food item'),
});

export const deleteMealParamsSchema = z.object({
  id: z.string().min(1, 'Meal ID is required'),
});

export const getMealsQuerySchema = z.object({
  date: z.string().optional(), // YYYY-MM-DD
  mealType: mealTypeSchema.optional(),
});

export type CreateMealSchema = z.infer<typeof createMealSchema>;
