import { useQuery } from '@tanstack/react-query';
import { searchFood } from '../services/foodService';

export function useFoodSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ['foodSearch', query],
    queryFn: () => searchFood(query),
    enabled: enabled && query.trim().length > 1,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
}
