import { useQuery } from '@tanstack/react-query';
import { fetchRecommendations } from '../services/recommendationService';
import { useGoalsStore } from '../store/useGoalsStore';
import { useDailyStore } from '../store/useDailyStore';

export function useRecommendations() {
  const goals = useGoalsStore((state) => state.goals);
  const selectedDate = useDailyStore((state) => state.selectedDate);

  const query = useQuery({
    queryKey: ['recommendations', selectedDate, goals],
    queryFn: () => fetchRecommendations(selectedDate, goals),
  });

  return {
    recommendations: query.data?.recommendations || [],
    macroDeficit: query.data?.macroDeficit,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
