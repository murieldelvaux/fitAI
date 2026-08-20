import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MacroGoals } from '../types/nutrition';

interface GoalsState {
  goals: MacroGoals;
  setGoals: (goals: MacroGoals) => void;
  resetToDefaults: () => void;
}

const DEFAULT_GOALS: MacroGoals = {
  calories: 2200,
  protein: 160,
  carbs: 220,
  fat: 70,
};

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      goals: DEFAULT_GOALS,
      setGoals: (newGoals) => set({ goals: newGoals }),
      resetToDefaults: () => set({ goals: DEFAULT_GOALS }),
    }),
    {
      name: 'fitai-macro-goals-storage',
    }
  )
);
