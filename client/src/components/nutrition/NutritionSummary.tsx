import * as React from 'react';
import { MacroProgressRing } from './MacroProgressRing';
import { DailyNutritionSummary } from '../../types/nutrition';
import { Skeleton } from '../ui/Skeleton';
import { Flame, Dumbbell, Wheat, Droplets } from 'lucide-react';

interface NutritionSummaryProps {
  nutrition?: DailyNutritionSummary;
  isLoading?: boolean;
}

export function NutritionSummary({ nutrition, isLoading }: NutritionSummaryProps) {
  if (isLoading || !nutrition) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-56 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 4 Macro Progress Rings */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MacroProgressRing
          label="Calorias"
          consumed={nutrition.calories.consumed}
          target={nutrition.calories.target}
          unit="kcal"
          color="calories"
          icon={<Flame className="w-4 h-4 text-green-400" />}
        />

        <MacroProgressRing
          label="Proteínas"
          consumed={nutrition.protein.consumed}
          target={nutrition.protein.target}
          unit="g"
          color="protein"
          icon={<Dumbbell className="w-4 h-4 text-blue-400" />}
        />

        <MacroProgressRing
          label="Carboidratos"
          consumed={nutrition.carbs.consumed}
          target={nutrition.carbs.target}
          unit="g"
          color="carbs"
          icon={<Wheat className="w-4 h-4 text-amber-400" />}
        />

        <MacroProgressRing
          label="Gorduras"
          consumed={nutrition.fat.consumed}
          target={nutrition.fat.target}
          unit="g"
          color="fat"
          icon={<Droplets className="w-4 h-4 text-rose-400" />}
        />
      </div>
    </div>
  );
}
