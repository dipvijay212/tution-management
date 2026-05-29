"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  
  const isDashboardRoute = pathname?.startsWith('/admin') || 
                           pathname?.startsWith('/student') || 
                           pathname?.startsWith('/teacher');

  if (isDashboardRoute) return null;

  return (
    <footer className="border-t border-gray-200 bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} TuitionPro. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
