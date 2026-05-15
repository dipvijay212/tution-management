'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

const EmptyState = ({ 
  icon: Icon = Search, 
  title = "No results found", 
  description = "Try adjusting your search or filters to find what you're looking for.",
  actionLabel,
  onAction,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-6">
        <Icon size={32} />
      </div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
        {description}
      </p>
      {actionLabel && (
        <Button 
          variant="secondary" 
          className="mt-8"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
