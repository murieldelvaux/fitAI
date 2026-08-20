import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0 to 100
  indicatorColor?: string;
}

export function Progress({ className, value = 0, indicatorColor = 'bg-green-500', ...props }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-slate-800 border border-slate-700/50', className)}
      {...props}
    >
      <div
        className={cn('h-full w-full flex-1 transition-all duration-500 ease-out', indicatorColor)}
        style={{ transform: `translateX(-${100 - clampedValue}%)` }}
      />
    </div>
  );
}
