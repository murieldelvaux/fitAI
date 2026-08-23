import { useMutation, useQueryClient } from '@tanstack/react-query';
import { parseMealWithLLM } from '../services/llmService';
import { searchFood } from '../services/foodService';
import { createMeal } from '../services/mealService';
import { ParsedMealResponse } from '../types/llm';
import { CreateMealDto, MealType } from '../types/meal';
import { toast } from 'sonner';

export function useMealParse() {
  const queryClient = useQueryClient();

  // 1. Mutation to just parse natural language into structured items
  const parseOnlyMutation = useMutation({
    mutationFn: (text: string) => parseMealWithLLM(text),
    onError: (err) => {
      toast.error('Erro ao interpretar refeição', {
        description: err.message || 'Verifique o texto digitado e tente novamente.',
      });
    },
  });

  // 2. Full pipeline mutation: Parse natural language -> Enrich with nutritional data -> Save meal
  const parseAndLogMealMutation = useMutation({
    mutationFn: async (payload: string | { input: string; mealType?: MealType }) => {
      const naturalLanguageInput = typeof payload === 'string' ? payload : payload.input;
      const explicitMealType = typeof payload === 'string' ? undefined : payload.mealType;

      // Step A: Call LLM parsing endpoint
      const parsedData: ParsedMealResponse = await parseMealWithLLM(naturalLanguageInput);

      if (!parsedData.parsedItems || parsedData.parsedItems.length === 0) {
        throw new Error('Nenhum alimento identificado no texto.');
      }

      // Step B: Enrich each parsed item via food search
      const enrichedItems = await Promise.all(
        parsedData.parsedItems.map(async (item) => {
          try {
            const nutrition = await searchFood(item.name);
            return {
              name: nutrition.name || item.name,
              quantity: item.quantity,
              unit: item.unit,
              nutrition,
            };
          } catch {
            return {
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
            };
          }
        })
      );

      // Create meal title based on items
      const primaryItem = enrichedItems[0]?.name || 'Refeição';
      const secondaryItem = enrichedItems[1]?.name;
      const mealName = secondaryItem ? `${primaryItem} com ${secondaryItem}` : primaryItem;

      const dto: CreateMealDto = {
        name: mealName,
        mealType: explicitMealType || parsedData.detectedMealType || 'lunch',
        rawDescription: naturalLanguageInput,
        items: enrichedItems,
      };

      // Step C: Save meal to backend
      const savedMeal = await createMeal(dto);
      return { savedMeal, parsedData };
    },
    onSuccess: (result) => {
      toast.success('Refeição interpretada e registrada pela IA!', {
        description: `${result.savedMeal.name} — ${result.savedMeal.totalCalories} kcal (${result.savedMeal.totalProtein}g proteína)`,
      });
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['dailyNutrition'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
    onError: (err) => {
      toast.error('Falha ao processar refeição com IA', {
        description: err.message || 'Tente descrever a refeição com mais detalhes.',
      });
    },
  });

  return {
    parseOnly: parseOnlyMutation.mutate,
    parseOnlyAsync: parseOnlyMutation.mutateAsync,
    isParsingOnly: parseOnlyMutation.isPending,
    parsedResult: parseOnlyMutation.data,

    parseAndLog: parseAndLogMealMutation.mutate,
    parseAndLogAsync: parseAndLogMealMutation.mutateAsync,
    isParsingAndLogging: parseAndLogMealMutation.isPending,
  };
}
