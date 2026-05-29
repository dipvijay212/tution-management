'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, ShieldAlert } from 'lucide-react';

/**
 * Higher-Order Component/Wrapper for protecting routes based on authentication and roles
 * Implements a strict "loading -> session -> profile -> role check" sequence.
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { profile, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Synchronously calculate initial authorization to avoid layout flickers
  const [isAuthorized, setIsAuthorized] = useState(() => {
    if (loading) return false;
    if (!isAuthenticated) return false;
    if (allowedRoles.length > 0) {
      if (!profile) return false;
      return allowedRoles.includes(profile.role);
    }
    return true;
  });

  useEffect(() => {
    // Only proceed once loading is complete
    if (loading) return;

    if (!isAuthenticated) {
      console.log('[ProtectedRoute] Not authenticated, redirecting to login');
      setIsAuthorized(false);
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Wait for profile to load if we need to check roles
    if (allowedRoles.length > 0) {
      if (!profile) {
         // If loading is finished but profile is still null, 
         // it means the user exists in Auth but not in our public.users table.
         console.warn('[ProtectedRoute] Profile not found for authenticated user');
         setIsAuthorized(false);
         router.replace('/login?error=profile_not_found');
         return;
      }

      const hasRequiredRole = allowedRoles.includes(profile.role);
      
      if (!hasRequiredRole) {
        console.warn(`[ProtectedRoute] Access denied. Required: [${allowedRoles}], Actual: ${profile.role}`);
        setIsAuthorized(false);
        
        // Determine redirect target based on actual role to avoid loops
        let target = '/login';
        if (profile.role === 'admin') target = '/admin';
        else if (profile.role === 'teacher') target = '/teacher';
        else if (profile.role === 'student') target = '/student';

        // ONLY redirect if we aren't already there!
        if (pathname !== target) {
          router.replace(target);
        } else {
          // If we are already on the target path but still not authorized, we have a configuration mismatch
          console.error('[ProtectedRoute] Configuration mismatch: User is on their dashboard but not authorized for it.');
        }
        return;
      }
    }

    // If we reach here, user is authenticated and (if applicable) authorized
    setIsAuthorized(true);
  }, [isAuthenticated, loading, profile, router, allowedRoles, pathname]);

  // 1. Initial/Ongoing Loading state
  if (loading || (!isAuthorized && isAuthenticated && allowedRoles.length > 0 && !profile)) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
        </div>
        <p className="text-gray-500 font-medium animate-pulse text-sm">Verifying access permissions...</p>
      </div>
    );
  }

  // 2. Not authorized fallback (prevents flickering children while redirecting)
  if (!isAuthorized) {
    return (
       <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 gap-4">
        <ShieldAlert className="h-12 w-12 text-amber-500" />
        <p className="text-gray-900 font-bold">Access Restricted</p>
        <p className="text-gray-500 text-sm">Redirecting to your dashboard...</p>
      </div>
    );
  }

  // 3. Authorized - render content
  return children;
};

export default ProtectedRoute;
