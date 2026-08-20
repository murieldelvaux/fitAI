import { create } from 'zustand';

interface DailyState {
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  isQuickInputOpen: boolean;
  setQuickInputOpen: (open: boolean) => void;
  searchFilter: string;
  setSearchFilter: (filter: string) => void;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

export const useDailyStore = create<DailyState>((set) => ({
  selectedDate: getTodayString(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  isQuickInputOpen: false,
  setQuickInputOpen: (open) => set({ isQuickInputOpen: open }),
  searchFilter: '',
  setSearchFilter: (filter) => set({ searchFilter: filter }),
}));
