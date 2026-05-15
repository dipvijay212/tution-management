'use client';

import React from 'react';
import { UserPlus, BookCheck, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const RecentActivities = ({ activities = [], isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-gray-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
              <div className="h-2 w-full bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="py-10 text-center text-gray-400 text-sm">
        No recent activity found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-4 group">
          <div className={cn("flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", activity.color)}>
            <activity.icon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{activity.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
          </div>
          <div className="flex-shrink-0 text-[10px] font-medium text-gray-400 uppercase">
            {activity.time}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivities;
