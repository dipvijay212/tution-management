'use client';

import React from 'react';
import { Clock, MapPin, Loader2 } from 'lucide-react';

const UpcomingClasses = ({ classes = [], isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-gray-100 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="py-10 text-center text-gray-400 text-sm">
        No classes scheduled for today.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {classes.map((cls) => (
        <div key={cls.id} className="p-4 rounded-2xl bg-slate-50 border border-gray-100 hover:border-indigo-200 transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {cls.subject?.name || 'Subject'}
              </h4>
              <p className="text-xs text-gray-500">{cls.batch_name}</p>
            </div>
            <div className="px-2 py-1 rounded-lg bg-white text-[10px] font-bold text-indigo-600 border border-indigo-50 shadow-sm">
              {cls.room_number || 'TBD'}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock size={14} className="text-indigo-400" />
              {cls.start_time} - {cls.end_time}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {cls.teacher?.full_name || 'Teacher'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UpcomingClasses;
