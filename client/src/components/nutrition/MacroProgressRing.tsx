import * as React from 'react';
import { cn } from '../../lib/utils';

export interface MacroProgressRingProps {
  label: string;
  consumed: number;
  target: number;
  unit?: string;
  color: 'protein' | 'carbs' | 'fat' | 'calories';
  size?: number;
  strokeWidth?: number;
  icon?: React.ReactNode;
}

export function MacroProgressRing({
  label,
  consumed,
  target,
  unit = 'g',
  color,
  size = 130,
  strokeWidth = 10,
  icon,
}: MacroProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;
  const remaining = Math.max(0, target - consumed);

  // SVG stroke-dashoffset: full offset is circumference (0%), 0 offset is 100%
  const offset = circumference - (percentage / 100) * circumference;

  const colorConfig = {
    protein: {
      stroke: '#3B82F6',
      bgGlow: 'from-blue-500/10 to-transparent',
      text: 'text-blue-400',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      track: '#1E293B',
    },
    carbs: {
      stroke: '#F59E0B',
      bgGlow: 'from-amber-500/10 to-transparent',
      text: 'text-amber-400',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      track: '#1E293B',
    },
    fat: {
      stroke: '#F43F5E',
      bgGlow: 'from-rose-500/10 to-transparent',
      text: 'text-rose-400',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      track: '#1E293B',
    },
    calories: {
      stroke: '#22C55E',
      bgGlow: 'from-green-500/10 to-transparent',
      text: 'text-green-400',
      badge: 'bg-green-500/10 text-green-400 border-green-500/30',
      track: '#1E293B',
    },
  };

  const currentTheme = colorConfig[color];

  return (
    <div className="relative flex flex-col items-center justify-center p-4 rounded-2xl bg-[#1E293B] border border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-md group">
      {/* Subtle background gradient radial glow */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl bg-gradient-to-b opacity-40 pointer-events-none transition-opacity group-hover:opacity-70',
          currentTheme.bgGlow
        )}
      />

      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={currentTheme.track}
            strokeWidth={strokeWidth}
            fill="none"
            className="stroke-slate-800"
          />

          {/* Animated fill circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={currentTheme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${currentTheme.stroke}66)`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          {icon && <div className={cn('mb-0.5 text-base', currentTheme.text)}>{icon}</div>}
          <span className="text-xl font-extrabold tracking-tight text-white">{consumed}</span>
          <span className="text-[11px] font-medium text-slate-400">
            / {target} {unit}
          </span>
        </div>
      </div>

      {/* Label and remaining details */}
      <div className="mt-3 text-center z-10 w-full">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-sm font-bold tracking-wide text-slate-200 uppercase">{label}</span>
          <span className={cn('text-xs font-semibold px-1.5 py-0.2 rounded border', currentTheme.badge)}>
            {percentage}%
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          {remaining > 0 ? (
            <span>Restam <strong className="text-slate-200">{remaining}{unit}</strong></span>
          ) : (
            <span className="text-green-400 font-semibold">Meta atingida!</span>
          )}
        </p>
      </div>
    </div>
  );
}
