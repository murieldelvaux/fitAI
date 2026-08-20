import { z } from 'zod';

export const parseMealRequestSchema = z.object({
  input: z.string().min(2, 'Meal description must have at least 2 characters'),
});

export const parsedFoodItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
});

export const parsedMealResponseSchema = z.object({
  parsedItems: z.array(parsedFoodItemSchema).min(1, 'At least one food item must be parsed'),
  rawInput: z.string(),
  detectedMealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
});

export type ParseMealRequestSchema = z.infer<typeof parseMealRequestSchema>;
export type ParsedMealResponseSchema = z.infer<typeof parsedMealResponseSchema>;
