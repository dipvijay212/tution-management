'use client';

import React from 'react';
import Sidebar from './Sidebar';
import DashboardNavbar from './DashboardNavbar';
import { useAuth } from '@/hooks/use-auth';

/**
 * Common dashboard wrapper for all roles
 */
const DashboardLayout = ({ children }) => {
  const { profile } = useAuth();
  const role = profile?.role || 'student';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar - Fixed/Collapsible */}
      <Sidebar role={role} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <DashboardNavbar />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
