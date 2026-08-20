import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDailyNutrition } from '../services/nutritionService';
import { fetchMeals, createMeal, deleteMeal } from '../services/mealService';
import { useGoalsStore } from '../store/useGoalsStore';
import { useDailyStore } from '../store/useDailyStore';
import { CreateMealDto, Meal } from '../types/meal';
import { DailyNutritionSummary } from '../types/nutrition';
import { toast } from 'sonner';

export function useDailyLog(dateOverride?: string) {
  const queryClient = useQueryClient();
  const goals = useGoalsStore((state) => state.goals);
  const selectedDate = useDailyStore((state) => state.selectedDate);
  const activeDate = dateOverride || selectedDate;

  // Query for daily nutrition summary
  const nutritionQuery = useQuery({
    queryKey: ['dailyNutrition', activeDate, goals],
    queryFn: () => fetchDailyNutrition(activeDate, goals),
  });

  // Query for meals list
  const mealsQuery = useQuery({
    queryKey: ['meals', activeDate],
    queryFn: () => fetchMeals({ date: activeDate }),
  });

  // Mutation to create a new meal with optimistic update
  const createMealMutation = useMutation({
    mutationFn: (dto: CreateMealDto) => createMeal(dto),
    onMutate: async (newMealDto) => {
      await queryClient.cancelQueries({ queryKey: ['meals', activeDate] });
      await queryClient.cancelQueries({ queryKey: ['dailyNutrition', activeDate, goals] });

      const previousMeals = queryClient.getQueryData<Meal[]>(['meals', activeDate]);
      const previousNutrition = queryClient.getQueryData<DailyNutritionSummary>(['dailyNutrition', activeDate, goals]);

      // Optimistic temporary meal object
      const optimisticMeal: Meal = {
        id: `temp-${Date.now()}`,
        name: newMealDto.name,
        mealType: newMealDto.mealType || 'lunch',
        loggedAt: newMealDto.loggedAt || new Date().toISOString(),
        rawDescription: newMealDto.rawDescription,
        items: newMealDto.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          nutrition: {
            name: item.name,
            calories: item.nutrition?.calories ?? 150,
            protein: item.nutrition?.protein ?? 10,
            carbs: item.nutrition?.carbs ?? 15,
            fat: item.nutrition?.fat ?? 5,
            servingSize: 100,
            servingUnit: 'g',
          },
          calculatedCalories: item.nutrition?.calories ?? 150,
          calculatedProtein: item.nutrition?.protein ?? 10,
          calculatedCarbs: item.nutrition?.carbs ?? 15,
          calculatedFat: item.nutrition?.fat ?? 5,
        })),
        totalCalories: newMealDto.items.reduce((acc, i) => acc + (i.nutrition?.calories ?? 150), 0),
        totalProtein: newMealDto.items.reduce((acc, i) => acc + (i.nutrition?.protein ?? 10), 0),
        totalCarbs: newMealDto.items.reduce((acc, i) => acc + (i.nutrition?.carbs ?? 15), 0),
        totalFat: newMealDto.items.reduce((acc, i) => acc + (i.nutrition?.fat ?? 5), 0),
      };

      if (previousMeals) {
        queryClient.setQueryData<Meal[]>(['meals', activeDate], [optimisticMeal, ...previousMeals]);
      }

      return { previousMeals, previousNutrition };
    },
    onError: (err, newMeal, context) => {
      if (context?.previousMeals) {
        queryClient.setQueryData(['meals', activeDate], context.previousMeals);
      }
      if (context?.previousNutrition) {
        queryClient.setQueryData(['dailyNutrition', activeDate, goals], context.previousNutrition);
      }
      toast.error('Erro ao registrar refeição', {
        description: err.message || 'Por favor, tente novamente.',
      });
    },
    onSuccess: (savedMeal) => {
      toast.success('Refeição registrada com sucesso!', {
        description: `${savedMeal.name} (${savedMeal.totalCalories} kcal, ${savedMeal.totalProtein}g proteína)`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['dailyNutrition'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  // Mutation to delete a meal with optimistic update
  const deleteMealMutation = useMutation({
    mutationFn: (mealId: string) => deleteMeal(mealId),
    onMutate: async (deletedMealId) => {
      await queryClient.cancelQueries({ queryKey: ['meals', activeDate] });
      await queryClient.cancelQueries({ queryKey: ['dailyNutrition', activeDate, goals] });

      const previousMeals = queryClient.getQueryData<Meal[]>(['meals', activeDate]);
      const previousNutrition = queryClient.getQueryData<DailyNutritionSummary>(['dailyNutrition', activeDate, goals]);

      if (previousMeals) {
        queryClient.setQueryData<Meal[]>(
          ['meals', activeDate],
          previousMeals.filter((m) => m.id !== deletedMealId)
        );
      }

      return { previousMeals, previousNutrition };
    },
    onError: (err, deletedMealId, context) => {
      if (context?.previousMeals) {
        queryClient.setQueryData(['meals', activeDate], context.previousMeals);
      }
      if (context?.previousNutrition) {
        queryClient.setQueryData(['dailyNutrition', activeDate, goals], context.previousNutrition);
      }
      toast.error('Erro ao remover refeição', {
        description: err.message || 'Tente novamente.',
      });
    },
    onSuccess: () => {
      toast.info('Refeição removida');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      queryClient.invalidateQueries({ queryKey: ['dailyNutrition'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });

  return {
    nutrition: nutritionQuery.data,
    isLoadingNutrition: nutritionQuery.isLoading,
    meals: mealsQuery.data || [],
    isLoadingMeals: mealsQuery.isLoading,
    isError: nutritionQuery.isError || mealsQuery.isError,
    error: nutritionQuery.error || mealsQuery.error,
    createMeal: createMealMutation.mutate,
    createMealAsync: createMealMutation.mutateAsync,
    isCreatingMeal: createMealMutation.isPending,
    deleteMeal: deleteMealMutation.mutate,
    isDeletingMeal: deleteMealMutation.isPending,
    refetch: () => {
      nutritionQuery.refetch();
      mealsQuery.refetch();
    },
  };
}
