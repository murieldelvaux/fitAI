export type BiologicalSex = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';

export interface UserProfile {
  heightCm: number | null;
  weightKg: number | null;
  birthDate: string; // Formato YYYY-MM-DD
  biologicalSex: BiologicalSex;
  activityLevel: ActivityLevel;
}

export interface BiometricCalculation {
  age: number | null;
  bmr: number | null; // Taxa Metabólica Basal (TMB / Mifflin-St Jeor)
  tdee: number | null; // Gasto Energético Total Diário (GET)
  bmi: number | null; // Índice de Massa Corporal (IMC)
  isComplete: boolean;
}

export interface StrategyMacros {
  name: string;
  key: 'hypertrophy' | 'cutting' | 'maintenance';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  desc: string;
  isCustomized: boolean;
}
