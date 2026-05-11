import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Trend } from '../types';
import { cn } from '../lib/utils';

interface TrendIndicatorProps {
  trend: Trend;
  className?: string;
}

export function TrendIndicator({ trend, className }: TrendIndicatorProps) {
  if (trend === 'up') {
    return (
      <div className={cn("p-1.5 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-100/50 dark:border-red-500/20 flex items-center justify-center", className)}>
        <TrendingUp className="text-red-500 w-full h-full" />
      </div>
    );
  }
  if (trend === 'down') {
    return (
      <div className={cn("p-1.5 bg-green-50 dark:bg-green-500/10 rounded-lg border border-green-100/50 dark:border-green-500/20 flex items-center justify-center", className)}>
        <TrendingDown className="text-green-500 w-full h-full" />
      </div>
    );
  }
  return (
    <div className={cn("p-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-100/50 dark:border-white/5 flex items-center justify-center", className)}>
      <Minus className="text-neutral-400 dark:text-neutral-500 w-full h-full" />
    </div>
  );
}
