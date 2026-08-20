import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'protein' | 'carbs' | 'fat' | 'calories' | 'outline' | 'secondary';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-slate-800 text-slate-200 border-slate-700',
    primary: 'bg-green-500/15 text-green-400 border-green-500/30',
    protein: 'bg-blue-500/15 text-blue-400 border-blue-500/30 font-semibold',
    carbs: 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-semibold',
    fat: 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-semibold',
    calories: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold',
    outline: 'text-slate-300 border-slate-700 bg-transparent',
    secondary: 'bg-slate-700/50 text-slate-300 border-slate-600',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium transition-colors select-none',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
