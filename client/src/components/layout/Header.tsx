import * as React from 'react';
import { useDailyStore } from '../../store/useDailyStore';
import { formatDate, getLocalDateString } from '../../lib/utils';
import { Calendar, Flame, Sparkles, CheckCircle2 } from 'lucide-react';

export function Header() {
  const { selectedDate, setSelectedDate } = useDailyStore();

  // Dynamic greeting based on hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const today = getLocalDateString();
  const isToday = selectedDate === today;

  return (
    <header className="h-20 border-b border-slate-800/80 bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {getGreeting()}, Atleta! 👋
          </h1>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircle2 className="w-3 h-3" /> Metas Ativas
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 capitalize">
          {formatDate(selectedDate)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Date Selector */}
        <div className="relative flex items-center">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {!isToday && (
            <button
              onClick={() => setSelectedDate(today)}
              className="ml-2 text-xs font-medium text-green-400 hover:text-green-300 underline"
            >
              Hoje
            </button>
          )}
        </div>

        {/* Streak Counter */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-sm">
          <Flame className="w-4 h-4 fill-amber-400" />
          <span>7 dias seguidos</span>
        </div>
      </div>
    </header>
  );
}
