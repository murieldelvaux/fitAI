import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGoalsStore } from '../store/useGoalsStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import { Target, Sparkles, Dumbbell, Flame, CheckCircle, RotateCcw } from 'lucide-react';

const goalsFormSchema = z.object({
  calories: z.number({ invalid_type_error: 'Informe um número válido' }).min(800, 'Mínimo de 800 kcal').max(10000, 'Máximo de 10000 kcal'),
  protein: z.number({ invalid_type_error: 'Informe um número válido' }).min(10, 'Mínimo de 10g').max(500, 'Máximo de 500g'),
  carbs: z.number({ invalid_type_error: 'Informe um número válido' }).min(10, 'Mínimo de 10g').max(1000, 'Máximo de 1000g'),
  fat: z.number({ invalid_type_error: 'Informe um número válido' }).min(5, 'Mínimo de 5g').max(300, 'Máximo de 300g'),
});

type GoalsFormData = z.infer<typeof goalsFormSchema>;

export function Goals() {
  const { goals, setGoals, resetToDefaults } = useGoalsStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<GoalsFormData>({
    resolver: zodResolver(goalsFormSchema),
    defaultValues: {
      calories: goals.calories,
      protein: goals.protein,
      carbs: goals.carbs,
      fat: goals.fat,
    },
  });

  const watchedValues = watch();

  // Calculate calories from macros: (P * 4) + (C * 4) + (F * 9)
  const calculatedKcal = Math.round(
    (watchedValues.protein || 0) * 4 +
    (watchedValues.carbs || 0) * 4 +
    (watchedValues.fat || 0) * 9
  );

  const onSubmit = (data: GoalsFormData) => {
    setGoals(data);
    toast.success('Metas de macros atualizadas com sucesso!', {
      description: `Novas metas: ${data.calories} kcal | ${data.protein}g P | ${data.carbs}g C | ${data.fat}g G`,
    });
  };

  const applyPreset = (preset: { name: string; calories: number; protein: number; carbs: number; fat: number }) => {
    setValue('calories', preset.calories, { shouldDirty: true, shouldValidate: true });
    setValue('protein', preset.protein, { shouldDirty: true, shouldValidate: true });
    setValue('carbs', preset.carbs, { shouldDirty: true, shouldValidate: true });
    setValue('fat', preset.fat, { shouldDirty: true, shouldValidate: true });
    toast.info(`Preset "${preset.name}" aplicado. Clique em Salvar para confirmar.`);
  };

  const presets = [
    {
      name: 'Ganho de Massa (Hipertrofia)',
      icon: <Dumbbell className="w-4 h-4 text-blue-400" />,
      calories: 2600,
      protein: 180,
      carbs: 320,
      fat: 70,
      desc: 'Alta proteína e carboidratos para suporte ao treino e síntese muscular.',
    },
    {
      name: 'Definição / Perda de Gordura',
      icon: <Flame className="w-4 h-4 text-rose-400" />,
      calories: 1800,
      protein: 160,
      carbs: 160,
      fat: 55,
      desc: 'Déficit calórico com alta proteína para preservar massa magra.',
    },
    {
      name: 'Manutenção & Equilíbrio',
      icon: <Sparkles className="w-4 h-4 text-green-400" />,
      calories: 2200,
      protein: 150,
      carbs: 230,
      fat: 75,
      desc: 'Distribuição balanceada para longevidade e energia estável.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <Target className="w-6 h-6 text-green-400" />
          Configuração de Metas Diárias
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Defina suas metas personalizadas de calorias e macronutrientes. Todos os gráficos, anéis de progresso e recomendações IA sincronizam automaticamente.
        </p>
      </div>

      {/* Preset Strategy Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          Estratégias Rápidas Pré-Configuradas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {presets.map((preset, idx) => (
            <Card
              key={idx}
              className="p-4 border-slate-800 hover:border-green-500/40 cursor-pointer transition-all duration-200 bg-[#1E293B] group"
              onClick={() => applyPreset(preset)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-green-500/30">
                  {preset.icon}
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">
                  {preset.name}
                </h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{preset.desc}</p>
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex justify-between text-xs font-semibold text-slate-300">
                <span>{preset.calories} kcal</span>
                <span className="text-blue-400">{preset.protein}g P</span>
                <span className="text-amber-400">{preset.carbs}g C</span>
                <span className="text-rose-400">{preset.fat}g G</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Goal Form */}
      <Card className="border-slate-800 bg-[#1E293B]">
        <CardHeader>
          <CardTitle>Personalizar Metas de Macronutrientes</CardTitle>
          <CardDescription>
            Insira os valores exatos desejados para cada indicador diário.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Calories Target */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-green-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  Calorias Totais (kcal)
                </label>
                <Input
                  type="number"
                  {...register('calories', { valueAsNumber: true })}
                  error={errors.calories?.message}
                  className="bg-slate-900 text-lg font-bold border-green-500/30 focus-visible:ring-green-500"
                />
              </div>

              {/* Protein Target */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5" />
                  Proteína (g)
                </label>
                <Input
                  type="number"
                  {...register('protein', { valueAsNumber: true })}
                  error={errors.protein?.message}
                  className="bg-slate-900 text-lg font-bold border-blue-500/30 focus-visible:ring-blue-500"
                />
              </div>

              {/* Carbs Target */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Carboidratos (g)
                </label>
                <Input
                  type="number"
                  {...register('carbs', { valueAsNumber: true })}
                  error={errors.carbs?.message}
                  className="bg-slate-900 text-lg font-bold border-amber-500/30 focus-visible:ring-amber-500"
                />
              </div>

              {/* Fat Target */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-rose-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  Gorduras (g)
                </label>
                <Input
                  type="number"
                  {...register('fat', { valueAsNumber: true })}
                  error={errors.fat?.message}
                  className="bg-slate-900 text-lg font-bold border-rose-500/30 focus-visible:ring-rose-500"
                />
              </div>
            </div>

            {/* Macro Balance Validation Bar */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Total calórico calculado pelos macros:</span>
                <span className="font-bold text-white">{calculatedKcal} kcal</span>
              </div>
              <p className="text-[11px] text-slate-500">
                * Calculado com a regra de 4 kcal/g para proteína e carboidrato, e 9 kcal/g para gorduras.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetToDefaults}
              className="text-slate-400 hover:text-white gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Restaurar Padrões
            </Button>

            <Button
              type="submit"
              size="md"
              disabled={isSubmitting}
              className="gap-2 text-slate-950 font-bold"
            >
              <CheckCircle className="w-4 h-4" />
              Salvar Metas
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
