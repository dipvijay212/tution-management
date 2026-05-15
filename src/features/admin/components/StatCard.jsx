'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'indigo', isLoading }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-2xl", colors[color])}>
          <Icon size={24} />
        </div>
        {trend && !isLoading && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
            trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {isLoading ? (
          <div className="mt-2 flex items-center gap-2">
            <Loader2 className="animate-spin text-gray-300" size={24} />
            <div className="h-8 w-24 bg-gray-100 animate-pulse rounded-lg" />
          </div>
        ) : (
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
