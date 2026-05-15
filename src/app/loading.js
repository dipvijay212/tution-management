'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[400px] w-full flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-gray-900 tracking-tight">Loading content...</p>
        <p className="text-xs text-gray-400 mt-1">Please wait while we fetch the latest data.</p>
      </div>
    </div>
  );
}
