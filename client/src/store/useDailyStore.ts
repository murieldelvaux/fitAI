import { create } from 'zustand';
import { getLocalDateString } from '../lib/utils';

interface DailyState {
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  isQuickInputOpen: boolean;
  setQuickInputOpen: (open: boolean) => void;
  searchFilter: string;
  setSearchFilter: (filter: string) => void;
}

export const useDailyStore = create<DailyState>((set) => ({
  selectedDate: getLocalDateString(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  isQuickInputOpen: false,
  setQuickInputOpen: (open) => set({ isQuickInputOpen: open }),
  searchFilter: '',
  setSearchFilter: (filter) => set({ searchFilter: filter }),
}));
