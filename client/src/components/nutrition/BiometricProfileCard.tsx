import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useUserProfileStore } from '../../store/useUserProfileStore';
import { ACTIVITY_MULTIPLIERS, computeBiometrics } from '../../lib/nutritionCalculator';
import { ActivityLevel, BiologicalSex } from '../../types/biometrics';
import {
  User,
  Ruler,
  Scale,
  Calendar,
  Activity,
  Flame,
  Zap,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

export function BiometricProfileCard() {
  const { profile, setProfile, resetProfile } = useUserProfileStore();
  const biometrics = computeBiometrics(profile);

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? null : Number(e.target.value);
    setProfile({ heightCm: val });
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? null : Number(e.target.value);
    setProfile({ weightKg: val });
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ birthDate: e.target.value });
  };

  const handleSexChange = (sex: BiologicalSex) => {
    setProfile({ biologicalSex: sex });
  };

  const handleActivityChange = (activity: ActivityLevel) => {
    setProfile({ activityLevel: activity });
  };

  const handleReset = () => {
    resetProfile();
    toast.info('Dados biométricos restaurados para o padrão.');
  };

  return (
    <Card className="border-slate-800 bg-[#1E293B] shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-white">
                  Perfil Biométrico & Gasto Calórico
                </CardTitle>
                {biometrics.isComplete ? (
                  <Badge variant="primary" className="gap-1 text-[11px] py-0.5 animate-in fade-in">
                    <Sparkles className="w-3 h-3" />
                    Perfil Ativo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] text-slate-400 py-0.5">
                    Preenchimento Opcional
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs text-slate-400 mt-0.5">
                Utilizado para o cálculo de TMB (Mifflin-St Jeor) e Gasto Energético Total (GET).
              </CardDescription>
            </div>
          </div>

          {(profile.heightCm || profile.weightKg || profile.birthDate) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-slate-400 hover:text-slate-200 self-start sm:self-center text-xs h-8 px-2.5 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar Biometria
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-0">
        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sexo Biológico */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              Sexo Biológico
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 h-11 items-center">
              <button
                type="button"
                onClick={() => handleSexChange('male')}
                className={`h-9 rounded-lg text-xs font-bold transition-all ${
                  profile.biologicalSex === 'male'
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Masculino
              </button>
              <button
                type="button"
                onClick={() => handleSexChange('female')}
                className={`h-9 rounded-lg text-xs font-bold transition-all ${
                  profile.biologicalSex === 'female'
                    ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Feminino
              </button>
            </div>
          </div>

          {/* Data de Nascimento + Idade */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-green-400" />
                Nascimento
              </label>
              {biometrics.age !== null && (
                <span className="text-[11px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                  {biometrics.age} anos
                </span>
              )}
            </div>
            <Input
              type="date"
              value={profile.birthDate || ''}
              onChange={handleBirthDateChange}
              max={new Date().toISOString().split('T')[0]}
              className="bg-slate-900 text-sm font-semibold border-slate-700 text-slate-200 focus-visible:ring-green-500"
            />
          </div>

          {/* Altura (cm) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-amber-400" />
              Altura (cm)
            </label>
            <div className="relative">
              <Input
                type="number"
                placeholder="Ex: 175"
                min={50}
                max={250}
                value={profile.heightCm ?? ''}
                onChange={handleHeightChange}
                className="bg-slate-900 text-sm font-semibold border-slate-700 pr-12 focus-visible:ring-green-500"
              />
              <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-500 pointer-events-none">
                cm
              </span>
            </div>
          </div>

          {/* Peso (kg) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              Peso Atual (kg)
            </label>
            <div className="relative">
              <Input
                type="number"
                placeholder="Ex: 75.0"
                step="0.1"
                min={20}
                max={350}
                value={profile.weightKg ?? ''}
                onChange={handleWeightChange}
                className="bg-slate-900 text-sm font-semibold border-slate-700 pr-12 focus-visible:ring-green-500"
              />
              <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-500 pointer-events-none">
                kg
              </span>
            </div>
          </div>
        </div>

        {/* Nível de Atividade */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            Nível de Atividade Física
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((level) => {
              const info = ACTIVITY_MULTIPLIERS[level];
              const isSelected = profile.activityLevel === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleActivityChange(level)}
                  className={`p-3 rounded-xl text-left border transition-all duration-200 ${
                    isSelected
                      ? 'bg-slate-900 border-green-500/60 shadow-md ring-1 ring-green-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-green-400' : 'text-slate-200'
                      }`}
                    >
                      {info.label}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {info.factor}x
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                    {info.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Realtime Biometric Metrics Summary */}
        {biometrics.isComplete ? (
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-900/95 border border-green-500/30 space-y-3 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Cálculo Metabólico em Tempo Real
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Fórmula Mifflin-St Jeor & Fator de Atividade
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* TMB */}
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-400" />
                    TMB (Basal)
                  </span>
                  <p className="text-base font-extrabold text-white mt-0.5">
                    {biometrics.bmr?.toLocaleString('pt-BR')} <span className="text-xs text-slate-400 font-normal">kcal</span>
                  </p>
                </div>
                <div className="text-[10px] text-slate-500 text-right max-w-[90px]">
                  Gasto em repouso absoluto
                </div>
              </div>

              {/* GET / TDEE */}
              <div className="p-3 rounded-lg bg-green-950/20 border border-green-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-green-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-green-400 fill-green-400" />
                    GET / TDEE
                  </span>
                  <p className="text-base font-extrabold text-green-400 mt-0.5">
                    {biometrics.tdee?.toLocaleString('pt-BR')} <span className="text-xs text-green-300/70 font-normal">kcal/dia</span>
                  </p>
                </div>
                <div className="text-[10px] text-green-400/80 text-right max-w-[90px]">
                  Gasto total diário c/ rotina
                </div>
              </div>

              {/* IMC */}
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-blue-400" />
                    IMC Estimado
                  </span>
                  <p className="text-base font-extrabold text-white mt-0.5">
                    {biometrics.bmi} <span className="text-xs text-slate-400 font-normal">kg/m²</span>
                  </p>
                </div>
                <div className="text-[10px] text-slate-400 text-right">
                  {biometrics.bmi && biometrics.bmi < 18.5
                    ? 'Abaixo do peso'
                    : biometrics.bmi && biometrics.bmi < 25
                    ? 'Peso saudável'
                    : biometrics.bmi && biometrics.bmi < 30
                    ? 'Sobrepeso'
                    : 'Obesidade'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-dashed border-slate-800 flex items-center gap-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              Preencha sua <strong>altura</strong>, <strong>peso</strong> e <strong>data de nascimento</strong> para calcular seu gasto calórico exato e destravar as estratégias pré-configuradas personalizadas.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
