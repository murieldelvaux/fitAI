import { ActivityLevel, BiologicalSex, BiometricCalculation, StrategyMacros, UserProfile } from '../types/biometrics';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, { label: string; factor: number; description: string }> = {
  sedentary: {
    label: 'Sedentário',
    factor: 1.2,
    description: 'Pouco ou nenhum exercício, trabalho de mesa',
  },
  light: {
    label: 'Levemente Ativo',
    factor: 1.375,
    description: 'Exercício leve ou esportes 1 a 3 dias/semana',
  },
  moderate: {
    label: 'Moderadamente Ativo',
    factor: 1.55,
    description: 'Exercício moderado ou esportes 3 a 5 dias/semana',
  },
  very_active: {
    label: 'Muito Ativo',
    factor: 1.725,
    description: 'Treino intenso ou esportes pesados 6 a 7 dias/semana',
  },
};

/**
 * Calcula a idade a partir da data de nascimento no formato YYYY-MM-DD
 */
export function calculateAge(birthDateString: string | null | undefined): number | null {
  if (!birthDateString) return null;
  const parts = birthDateString.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;

  const [year, month, day] = parts;
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  if (isNaN(birthDate.getTime()) || birthDate > today) return null;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 0 && age <= 130 ? age : null;
}

/**
 * Fórmula de Harris-Benedict revisada (Mifflin-St Jeor)
 * Homem:  TMB = (10 × peso) + (6.25 × altura) - (5 × idade) + 5
 * Mulher: TMB = (10 × peso) + (6.25 × altura) - (5 × idade) - 161
 */
export function calculateBMR(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  biologicalSex: BiologicalSex;
}): number {
  const { weightKg, heightCm, age, biologicalSex } = params;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return biologicalSex === 'male' ? Math.round(base + 5) : Math.round(base - 161);
}

/**
 * Calcula o Gasto Energético Total Diário (GET / TDEE)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel]?.factor || 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Calcula o Índice de Massa Corporal (IMC)
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

/**
 * Processa todos os cálculos biométricos a partir do perfil do usuário
 */
export function computeBiometrics(profile: Partial<UserProfile>): BiometricCalculation {
  const { heightCm, weightKg, birthDate, biologicalSex, activityLevel } = profile;
  const age = calculateAge(birthDate);

  const isComplete = Boolean(
    heightCm &&
    heightCm >= 50 &&
    weightKg &&
    weightKg >= 20 &&
    age !== null &&
    age >= 10 &&
    biologicalSex &&
    activityLevel
  );

  if (!isComplete || !heightCm || !weightKg || age === null || !biologicalSex || !activityLevel) {
    return {
      age,
      bmr: null,
      tdee: null,
      bmi: heightCm && weightKg ? calculateBMI(weightKg, heightCm) : null,
      isComplete: false,
    };
  }

  const bmr = calculateBMR({ weightKg, heightCm, age, biologicalSex });
  const tdee = calculateTDEE(bmr, activityLevel);
  const bmi = calculateBMI(weightKg, heightCm);

  return {
    age,
    bmr,
    tdee,
    bmi,
    isComplete: true,
  };
}

/**
 * Padrões estáticos atuais de fallback quando a biometria não está preenchida
 */
export const DEFAULT_PRESET_STRATEGIES: Record<'hypertrophy' | 'cutting' | 'maintenance', StrategyMacros> = {
  hypertrophy: {
    key: 'hypertrophy',
    name: 'Ganho de Massa (Hipertrofia)',
    calories: 2600,
    protein: 180,
    carbs: 320,
    fat: 70,
    desc: 'Alta proteína e carboidratos para suporte ao treino e síntese muscular.',
    isCustomized: false,
  },
  cutting: {
    key: 'cutting',
    name: 'Definição / Perda de Gordura',
    calories: 1800,
    protein: 160,
    carbs: 160,
    fat: 55,
    desc: 'Déficit calórico com alta proteína para preservar massa magra.',
    isCustomized: false,
  },
  maintenance: {
    key: 'maintenance',
    name: 'Manutenção & Equilíbrio',
    calories: 2200,
    protein: 150,
    carbs: 230,
    fat: 75,
    desc: 'Distribuição balanceada para longevidade e energia estável.',
    isCustomized: false,
  },
};

/**
 * Calcula as estratégias de macronutrientes dinamicamente ou retorna os padrões
 */
export function getCalculatedStrategies(
  profile: Partial<UserProfile>,
  biometrics: BiometricCalculation
): StrategyMacros[] {
  if (!biometrics.isComplete || !biometrics.tdee || !profile.weightKg) {
    return Object.values(DEFAULT_PRESET_STRATEGIES);
  }

  const { tdee } = biometrics;
  const weight = profile.weightKg;

  // 1. Hipertrofia: Superávit de ~400 kcal | 2.0g/kg P | 0.9g/kg G | Resto C
  const hypertrophyKcal = Math.round(tdee + 400);
  const hypertrophyP = Math.round(weight * 2.0);
  const hypertrophyF = Math.round(weight * 0.9);
  const hypertrophyC = Math.max(30, Math.round((hypertrophyKcal - (hypertrophyP * 4 + hypertrophyF * 9)) / 4));

  // 2. Definição: Déficit de ~450 kcal | 2.2g/kg P (preservação muscular) | 0.7g/kg G | Resto C
  const cuttingKcal = Math.max(1200, Math.round(tdee - 450));
  const cuttingP = Math.round(weight * 2.2);
  const cuttingF = Math.round(weight * 0.7);
  const cuttingC = Math.max(30, Math.round((cuttingKcal - (cuttingP * 4 + cuttingF * 9)) / 4));

  // 3. Manutenção: 100% GET | 1.8g/kg P | 0.9g/kg G | Resto C
  const maintenanceKcal = Math.round(tdee);
  const maintenanceP = Math.round(weight * 1.8);
  const maintenanceF = Math.round(weight * 0.9);
  const maintenanceC = Math.max(30, Math.round((maintenanceKcal - (maintenanceP * 4 + maintenanceF * 9)) / 4));

  return [
    {
      key: 'hypertrophy',
      name: 'Ganho de Massa (Hipertrofia)',
      calories: hypertrophyKcal,
      protein: hypertrophyP,
      carbs: hypertrophyC,
      fat: hypertrophyF,
      desc: 'Superávit calórico estratégico (+400 kcal) com 2.0g/kg de proteína para síntese proteica máxima.',
      isCustomized: true,
    },
    {
      key: 'cutting',
      name: 'Definição / Perda de Gordura',
      calories: cuttingKcal,
      protein: cuttingP,
      carbs: cuttingC,
      fat: cuttingF,
      desc: 'Déficit calórico moderado (-450 kcal) com 2.2g/kg de proteína para proteger a massa magra.',
      isCustomized: true,
    },
    {
      key: 'maintenance',
      name: 'Manutenção & Equilíbrio',
      calories: maintenanceKcal,
      protein: maintenanceP,
      carbs: maintenanceC,
      fat: maintenanceF,
      desc: 'Equilíbrio energético diário (100% GET) com macronutrientes balanceados para estabilidade de peso.',
      isCustomized: true,
    },
  ];
}
