import * as React from 'react';
import { Meal } from '../../types/meal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { formatTime } from '../../lib/utils';

interface CalorieProgressChartProps {
  meals: Meal[];
  targetCalories: number;
}

export function CalorieProgressChart({ meals, targetCalories }: CalorieProgressChartProps) {
  const chartData = React.useMemo(() => {
    if (meals.length === 0) return [];

    // Sort chronologically
    const sorted = [...meals].sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());

    let runningTotal = 0;
    const points = [
      {
        time: 'Início',
        calories: 0,
        mealName: 'Início do dia',
      },
    ];

    sorted.forEach((meal) => {
      runningTotal += meal.totalCalories;
      points.push({
        time: formatTime(meal.loggedAt),
        calories: runningTotal,
        mealName: meal.name,
      });
    });

    return points;
  }, [meals]);

  if (meals.length === 0) {
    return (
      <Card className="p-6 text-center border-slate-800 bg-[#1E293B]">
        <div className="flex flex-col items-center justify-center h-52 text-slate-400">
          <TrendingUp className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-sm font-medium">Sem dados para curva de calorias</p>
          <p className="text-xs text-slate-500 mt-1">O progresso acumulado aparecerá aqui após registrar refeições.</p>
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
              <TrendingUp className="w-4 h-4 text-green-400" />
              Progressão Acumulada de Calorias
            </CardTitle>
            <CardDescription className="text-xs">
              Evolução do consumo calórico ao longo do dia em direção à meta diária ({targetCalories} kcal)
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="time"
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
                domain={[0, Math.max(targetCalories * 1.1, 2500)]}
                unit=" kcal"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-sm text-xs">
                        <p className="font-bold text-white mb-1">{item.mealName}</p>
                        <p className="text-slate-400 mb-1">Horário: {item.time}</p>
                        <p className="text-green-400 font-extrabold text-sm">
                          {item.calories} kcal acumuladas
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={targetCalories}
                label={{
                  value: `Meta (${targetCalories} kcal)`,
                  fill: '#22C55E',
                  fontSize: 11,
                  position: 'insideTopRight',
                }}
                stroke="#22C55E"
                strokeDasharray="4 4"
              />
              <Area
                type="monotone"
                dataKey="calories"
                stroke="#22C55E"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#calorieGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
