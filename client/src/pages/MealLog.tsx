import * as React from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import { MealCard } from '../components/nutrition/MealCard';
import { Input } from '../components/ui/Input';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Skeleton } from '../components/ui/Skeleton';
import { UtensilsCrossed, Search, Filter } from 'lucide-react';
import { MealType } from '../types/meal';

export function MealLog() {
  const { meals, isLoadingMeals, deleteMeal, isDeletingMeal } = useDailyLog();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedType, setSelectedType] = React.useState<string>('all');

  const filteredMeals = React.useMemo(() => {
    return meals.filter((meal) => {
      const matchesSearch =
        meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.items.some((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (meal.rawDescription && meal.rawDescription.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = selectedType === 'all' || meal.mealType === selectedType;

      return matchesSearch && matchesType;
    });
  }, [meals, searchTerm, selectedType]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <UtensilsCrossed className="w-6 h-6 text-green-400" />
          Histórico Completo de Refeições
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Visualize, filtre e gerencie todas as refeições registradas no seu dia.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#1E293B] border border-slate-800">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por alimento ou refeição (ex: frango, salmão, ovos)..."
            className="pl-10 bg-slate-900 border-slate-700"
          />
        </div>

        {/* Meal type filter tabs */}
        <Tabs defaultValue="all" value={selectedType} onValueChange={setSelectedType}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="all">Todas ({meals.length})</TabsTrigger>
            <TabsTrigger value="breakfast">Café</TabsTrigger>
            <TabsTrigger value="lunch">Almoço</TabsTrigger>
            <TabsTrigger value="dinner">Jantar</TabsTrigger>
            <TabsTrigger value="snack">Lanches</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Meals List */}
      {isLoadingMeals ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredMeals.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
          <Filter className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-300">Nenhuma refeição encontrada</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `Nenhuma refeição corresponde ao termo "${searchTerm}". Tente outro filtro.`
              : 'Nenhuma refeição registrada para esta categoria hoje.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onDelete={deleteMeal}
              isDeleting={isDeletingMeal}
            />
          ))}
        </div>
      )}
    </div>
  );
}
