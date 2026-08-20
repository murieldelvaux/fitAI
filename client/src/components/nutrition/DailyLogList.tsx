import * as React from 'react';
import { Meal } from '../../types/meal';
import { MealCard } from './MealCard';
import { Skeleton } from '../ui/Skeleton';
import { UtensilsCrossed, PlusCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface DailyLogListProps {
  meals: Meal[];
  isLoading?: boolean;
  onDeleteMeal?: (id: string) => void;
  isDeletingMeal?: boolean;
  onOpenQuickAdd?: () => void;
}

export function DailyLogList({
  meals,
  isLoading,
  onDeleteMeal,
  isDeletingMeal,
  onOpenQuickAdd,
}: DailyLogListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-44 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 text-center">
        <div className="p-4 rounded-2xl bg-slate-800/80 text-green-400 mb-3 border border-slate-700">
          <UtensilsCrossed className="w-8 h-8" />
        </div>
        <h4 className="text-base font-bold text-slate-200">Nenhuma refeição registrada hoje</h4>
        <p className="mt-1 text-xs text-slate-400 max-w-sm">
          Use o campo de IA acima para descrever sua refeição em linguagem natural ou clique abaixo para começar.
        </p>
        {onOpenQuickAdd && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenQuickAdd}
            className="mt-4 gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Registrar primeira refeição
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {meals.map((meal) => (
        <MealCard
          key={meal.id}
          meal={meal}
          onDelete={onDeleteMeal}
          isDeleting={isDeletingMeal}
        />
      ))}
    </div>
  );
}
