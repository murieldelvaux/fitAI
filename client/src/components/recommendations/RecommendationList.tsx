import * as React from 'react';
import { MealRecommendation } from '../../types/recommendation';
import { RecommendationCard } from './RecommendationCard';
import { Skeleton } from '../ui/Skeleton';
import { Tabs, TabsList, TabsTrigger } from '../ui/Tabs';
import { Sparkles, Target } from 'lucide-react';
import { formatGrams, formatCalories } from '../../lib/utils';

interface RecommendationListProps {
  recommendations: MealRecommendation[];
  macroDeficit?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  isLoading?: boolean;
}

export function RecommendationList({
  recommendations,
  macroDeficit,
  isLoading,
}: RecommendationListProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const filtered = React.useMemo(() => {
    if (selectedCategory === 'all') return recommendations;
    return recommendations.filter((r) => r.category === selectedCategory);
  }, [recommendations, selectedCategory]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deficit Banner */}
      {macroDeficit && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Déficit Restante Para Suas Metas</h4>
              <p className="text-xs text-slate-400">
                Sugestões geradas sob medida para bater seus macros diários sem ultrapassar as calorias.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-semibold">
              {formatCalories(macroDeficit.calories)} kcal restantes
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 font-semibold">
              {formatGrams(macroDeficit.protein)} P
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
              {formatGrams(macroDeficit.carbs)} C
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 font-semibold">
              {formatGrams(macroDeficit.fat)} G
            </span>
          </div>
        </div>
      )}

      {/* Category filter tabs */}
      <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="all">Todas ({recommendations.length})</TabsTrigger>
          <TabsTrigger value="high_protein">Alto Teor Proteico</TabsTrigger>
          <TabsTrigger value="balanced">Balanceadas</TabsTrigger>
          <TabsTrigger value="quick_snack">Lanches Rápidos</TabsTrigger>
          <TabsTrigger value="post_workout">Pós-Treino</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Grid of recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
          />
        ))}
      </div>
    </div>
  );
}
