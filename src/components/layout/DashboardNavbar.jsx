'use client';

import React from 'react';
import { Bell, Search, User as UserIcon, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import NotificationCenter from './NotificationCenter';


const DashboardNavbar = () => {
  const { user, profile, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md px-4 sm:px-6">
      <div className="flex h-full items-center justify-between">
        {/* Search Bar - Hidden on Mobile */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search anything..."
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>

        {/* Placeholder for mobile logo space */}
        <div className="lg:hidden w-10" />

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <NotificationCenter />

          {/* Separator */}
          <div className="h-8 w-px bg-gray-200 mx-1"></div>


          {/* User Profile Dropdown Placeholder (Simplified for now) */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-gray-900 leading-tight">
                {profile?.full_name || user?.email?.split('@')[0]}
              </span>
              <span className="text-xs text-indigo-600 font-medium capitalize">
                {profile?.role}
              </span>
            </div>
            
            <button 
              className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-colors"
              onClick={() => {/* Toggle Menu logic */}}
            >
              <UserIcon className="h-5 w-5" />
            </button>

            {/* Logout Button (Quick Action) */}
            <button 
              onClick={logout}
              className="rounded-xl p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
