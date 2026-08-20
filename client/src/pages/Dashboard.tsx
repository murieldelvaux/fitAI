import * as React from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import { NutritionSummary } from '../components/nutrition/NutritionSummary';
import { MealInputCard } from '../components/nutrition/MealInputCard';
import { DailyLogList } from '../components/nutrition/DailyLogList';
import { MacroBarChart } from '../components/charts/MacroBarChart';
import { CalorieProgressChart } from '../components/charts/CalorieProgressChart';
import { useGoalsStore } from '../store/useGoalsStore';
import { Utensils, Sparkles, BarChart2 } from 'lucide-react';

export function Dashboard() {
  const { nutrition, meals, isLoadingNutrition, isLoadingMeals, deleteMeal, isDeletingMeal } =
    useDailyLog();
  const goals = useGoalsStore((state) => state.goals);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Macro Progress Rings Summary */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-green-400" />
            Balanço Nutricional de Hoje
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Atualizado em tempo real
          </span>
        </div>
        <NutritionSummary nutrition={nutrition} isLoading={isLoadingNutrition} />
      </section>

      {/* 2. Natural Language AI Meal Input Card */}
      <section>
        <MealInputCard />
      </section>

      {/* 3. Today's Registered Meals & Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Registered Meals (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Utensils className="w-4 h-4 text-green-400" />
              Refeições Registradas Hoje ({meals.length})
            </h3>
          </div>
          <DailyLogList
            meals={meals}
            isLoading={isLoadingMeals}
            onDeleteMeal={deleteMeal}
            isDeletingMeal={isDeletingMeal}
          />
        </div>

        {/* Right Column: Visual Charts (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-green-400" />
            <h3 className="text-base font-bold text-white">Análise Gráfica</h3>
          </div>
          <MacroBarChart meals={meals} />
          <CalorieProgressChart meals={meals} targetCalories={goals.calories} />
        </div>
      </section>
    </div>
  );
}
