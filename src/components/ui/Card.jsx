'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-indigo-100/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className, ...props }) => (
  <div className={cn("p-6 border-b border-gray-50", className)} {...props}>
    {children}
  </div>
);

const CardContent = ({ children, className, ...props }) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className, ...props }) => (
  <div className={cn("p-6 border-t border-gray-50 bg-gray-50/30", className)} {...props}>
    {children}
  </div>
);

export { Card, CardHeader, CardContent, CardFooter };
