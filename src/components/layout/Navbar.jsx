"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, User as UserIcon, Loader2 } from 'lucide-react';

const Navbar = () => {
  const { user, profile, logout, loading, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const isDashboardRoute = pathname?.startsWith('/admin') || 
                           pathname?.startsWith('/student') || 
                           pathname?.startsWith('/teacher');

  if (isDashboardRoute) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                TuitionPro
              </span>
            </Link>
            
            {isAuthenticated && (
              <div className="hidden md:ml-10 md:flex md:items-baseline md:space-x-8">
                <Link 
                  href={profile?.role ? `/${profile.role}` : '/dashboard'} 
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-sm font-semibold text-gray-900">{profile?.full_name || user?.email}</span>
                  <span className="text-xs text-gray-500 capitalize">{profile?.role}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Button size="sm">Get Started</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};


export default Navbar;
