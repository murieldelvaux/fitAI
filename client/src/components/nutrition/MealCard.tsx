import * as React from 'react';
import { Meal } from '../../types/meal';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatTime, formatCalories, formatGrams } from '../../lib/utils';
import { Trash2, Utensils, Coffee, Sun, Moon, Apple, MoonStar } from 'lucide-react';

interface MealCardProps {
  meal: Meal;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function MealCard({ meal, onDelete, isDeleting }: MealCardProps) {
  const getMealTypeBadge = (type: Meal['mealType']) => {
    switch (type) {
      case 'breakfast':
        return { label: 'Café da Manhã', icon: <Coffee className="w-3.5 h-3.5" />, color: 'border-amber-500/30 text-amber-300 bg-amber-500/10' };
      case 'lunch':
        return { label: 'Almoço', icon: <Sun className="w-3.5 h-3.5" />, color: 'border-blue-500/30 text-blue-300 bg-blue-500/10' };
      case 'snack':
        return { label: 'Lanche da Tarde', icon: <Apple className="w-3.5 h-3.5" />, color: 'border-green-500/30 text-green-300 bg-green-500/10' };
      case 'dinner':
        return { label: 'Jantar', icon: <Moon className="w-3.5 h-3.5" />, color: 'border-indigo-500/30 text-indigo-300 bg-indigo-500/10' };
      case 'supper':
        return { label: 'Ceia', icon: <MoonStar className="w-3.5 h-3.5" />, color: 'border-purple-500/30 text-purple-300 bg-purple-500/10' };
      default:
        return { label: 'Refeição', icon: <Utensils className="w-3.5 h-3.5" />, color: 'border-slate-600 text-slate-300 bg-slate-800' };
    }
  };

  const typeConfig = getMealTypeBadge(meal.mealType);

  return (
    <Card className="p-4 sm:p-5 border-slate-800 hover:border-slate-700/80 transition-all duration-200 group bg-[#1E293B]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${typeConfig.color}`}>
            {typeConfig.icon}
          </div>
          <div>
            <h4 className="text-base font-bold text-white group-hover:text-green-400 transition-colors">
              {meal.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-400">{formatTime(meal.loggedAt)}</span>
              <span className="text-xs text-slate-600">•</span>
              <span className="text-xs text-slate-400">{typeConfig.label}</span>
            </div>
          </div>
        </div>

        {/* Action button */}
        {onDelete && (
          <div className="flex items-center self-end sm:self-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(meal.id)}
              disabled={isDeleting}
              className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg h-8 px-2.5"
              title="Excluir refeição"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Raw natural language description if present */}
      {meal.rawDescription && (
        <p className="mt-3 text-xs italic text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
          "{meal.rawDescription}"
        </p>
      )}

      {/* Food items breakdown list */}
      <div className="mt-3.5 space-y-1.5">
        {meal.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-900/40 text-slate-300"
          >
            <span className="font-medium text-slate-200">
              {item.name}{' '}
              <span className="text-slate-400 font-normal">
                ({item.quantity} {item.unit})
              </span>
            </span>
            <div className="flex items-center gap-3 text-slate-400">
              <span>{item.calculatedCalories} kcal</span>
              <span className="text-blue-400">{item.calculatedProtein}g P</span>
            </div>
          </div>
        ))}
      </div>

      {/* Macro Pills footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="calories">{formatCalories(meal.totalCalories)} kcal</Badge>
          <Badge variant="protein">{formatGrams(meal.totalProtein)} P</Badge>
          <Badge variant="carbs">{formatGrams(meal.totalCarbs)} C</Badge>
          <Badge variant="fat">{formatGrams(meal.totalFat)} G</Badge>
        </div>
      </div>
    </Card>
  );
}
