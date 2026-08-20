import * as React from 'react';
import { Meal } from '../../types/meal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

interface MacroBarChartProps {
  meals: Meal[];
}

export function MacroBarChart({ meals }: MacroBarChartProps) {
  const data = React.useMemo(() => {
    return meals.map((meal) => {
      let shortName = meal.name;
      if (shortName.length > 15) {
        shortName = shortName.substring(0, 13) + '...';
      }

      return {
        name: shortName,
        fullName: meal.name,
        protein: meal.totalProtein,
        carbs: meal.totalCarbs,
        fat: meal.totalFat,
        calories: meal.totalCalories,
      };
    });
  }, [meals]);

  if (meals.length === 0) {
    return (
      <Card className="p-6 text-center border-slate-800 bg-[#1E293B]">
        <div className="flex flex-col items-center justify-center h-52 text-slate-400">
          <BarChart3 className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-sm font-medium">Sem dados para o gráfico de macros</p>
          <p className="text-xs text-slate-500 mt-1">Registre refeições para ver a distribuição de nutrientes.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-800 bg-[#1E293B]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-400" />
              Distribuição de Macros por Refeição
            </CardTitle>
            <CardDescription className="text-xs">
              Gramas de Proteína, Carboidrato e Gordura em cada refeição registrada
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                unit="g"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-sm text-xs">
                        <p className="font-bold text-white mb-2">{item.fullName}</p>
                        <div className="space-y-1">
                          <p className="text-blue-400 flex justify-between gap-4">
                            <span>Proteína:</span>
                            <span className="font-bold">{item.protein}g</span>
                          </p>
                          <p className="text-amber-400 flex justify-between gap-4">
                            <span>Carboidratos:</span>
                            <span className="font-bold">{item.carbs}g</span>
                          </p>
                          <p className="text-rose-400 flex justify-between gap-4">
                            <span>Gorduras:</span>
                            <span className="font-bold">{item.fat}g</span>
                          </p>
                          <div className="pt-1.5 mt-1 border-t border-slate-800 text-slate-300 flex justify-between font-semibold">
                            <span>Calorias:</span>
                            <span>{item.calories} kcal</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => {
                  const names: Record<string, string> = {
                    protein: 'Proteína (g)',
                    carbs: 'Carboidratos (g)',
                    fat: 'Gorduras (g)',
                  };
                  return <span className="text-slate-300">{names[value] || value}</span>;
                }}
              />
              <Bar dataKey="protein" fill="#3B82F6" radius={[4, 4, 0, 0]} name="protein" />
              <Bar dataKey="carbs" fill="#F59E0B" radius={[4, 4, 0, 0]} name="carbs" />
              <Bar dataKey="fat" fill="#F43F5E" radius={[4, 4, 0, 0]} name="fat" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
