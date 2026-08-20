import * as React from 'react';
import { MealRecommendation } from '../../types/recommendation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useDailyLog } from '../../hooks/useDailyLog';
import { formatCalories, formatGrams } from '../../lib/utils';
import { Sparkles, Clock, Check, Plus } from 'lucide-react';
import { CreateMealDto } from '../../types/meal';

interface RecommendationCardProps {
  recommendation: MealRecommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { createMealAsync, isCreatingMeal } = useDailyLog();
  const [logged, setLogged] = React.useState(false);

  const handleLogMeal = async () => {
    const dto: CreateMealDto = {
      name: recommendation.name,
      mealType: recommendation.category === 'quick_snack' ? 'snack' : 'lunch',
      rawDescription: `Sugestão FitAI: ${recommendation.name}`,
      items: recommendation.ingredients.map((ing) => ({
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        nutrition: ing.nutrition,
      })),
    };

    try {
      await createMealAsync(dto);
      setLogged(true);
      setTimeout(() => setLogged(false), 3000);
    } catch {
      // Handled in hook
    }
  };

  const getCategoryBadge = (category: MealRecommendation['category']) => {
    switch (category) {
      case 'high_protein':
        return { label: 'Alto Teor de Proteína', variant: 'protein' as const };
      case 'low_carb':
        return { label: 'Low Carb', variant: 'carbs' as const };
      case 'quick_snack':
        return { label: 'Lanche Rápido', variant: 'primary' as const };
      case 'post_workout':
        return { label: 'Pós-Treino', variant: 'protein' as const };
      default:
        return { label: 'Balanceado', variant: 'default' as const };
    }
  };

  const catBadge = getCategoryBadge(recommendation.category);

  return (
    <Card className="flex flex-col justify-between border-slate-800 hover:border-slate-700 transition-all duration-300 group bg-[#1E293B] overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge variant={catBadge.variant}>{catBadge.label}</Badge>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{recommendation.prepTimeMinutes} min</span>
          </div>
        </div>

        <CardTitle className="text-base group-hover:text-green-400 transition-colors">
          {recommendation.name}
        </CardTitle>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{recommendation.description}</p>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {/* Why it fits reason banner */}
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-300">
          <Sparkles className="w-4 h-4 shrink-0 text-green-400 mt-0.5" />
          <p className="leading-relaxed">{recommendation.whyItFits}</p>
        </div>

        {/* Macro breakdown pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <Badge variant="calories">{formatCalories(recommendation.calories)} kcal</Badge>
          <Badge variant="protein">{formatGrams(recommendation.protein)} P</Badge>
          <Badge variant="carbs">{formatGrams(recommendation.carbs)} C</Badge>
          <Badge variant="fat">{formatGrams(recommendation.fat)} G</Badge>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-slate-800/80">
        <Button
          variant={logged ? 'secondary' : 'primary'}
          size="sm"
          onClick={handleLogMeal}
          disabled={isCreatingMeal || logged}
          className="w-full justify-center gap-1.5"
        >
          {logged ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              Refeição Registrada!
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Registrar Esta Refeição
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
