import * as React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Sparkles,
  Target,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDailyLog } from '../../hooks/useDailyLog';

export function Sidebar() {
  const { nutrition } = useDailyLog();

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      to: '/meals',
      label: 'Histórico de Refeições',
      icon: <UtensilsCrossed className="w-5 h-5" />,
    },
    {
      to: '/recommendations',
      label: 'Sugestões IA',
      icon: <Sparkles className="w-5 h-5" />,
      badge: 'IA',
    },
    {
      to: '/goals',
      label: 'Metas de Macros',
      icon: <Target className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-green-500/20">
            <HeartPulse className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-white">FitAI</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Nutrição Inteligente</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-8 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-green-500/15 text-green-400 font-semibold border border-green-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                )
              }
            >
              <div className="flex items-center gap-3">
                <span className="group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-300 border border-green-500/40">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mini Macro Status Widget */}
      <div className="p-4 m-4 rounded-2xl bg-[#1E293B] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-green-400" />
            Progresso de Hoje
          </span>
          <span className="text-xs font-extrabold text-green-400">
            {nutrition?.calories.percentage ?? 0}%
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Calorias</span>
            <span className="font-semibold text-slate-200">
              {nutrition?.calories.consumed ?? 0} / {nutrition?.calories.target ?? 2200}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${nutrition?.calories.percentage ?? 0}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[10px]">
          <div className="p-1 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-blue-400 font-bold block">{nutrition?.protein.consumed ?? 0}g</span>
            <span className="text-slate-500">Prot</span>
          </div>
          <div className="p-1 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-amber-400 font-bold block">{nutrition?.carbs.consumed ?? 0}g</span>
            <span className="text-slate-500">Carb</span>
          </div>
          <div className="p-1 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-rose-400 font-bold block">{nutrition?.fat.consumed ?? 0}g</span>
            <span className="text-slate-500">Gord</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
