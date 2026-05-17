'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { setAuth, setLoading, setAuthError, clearAuth } from '@/store/slices/authSlice';

/**
 * AuthProvider component
 * Handles the global authentication lifecycle once on mount.
 */
export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { loading, isAuthenticated, user, profile } = useSelector((state) => state.auth);
  const isInitialized = useRef(false);
  const [mounted, setMounted] = useState(false);

  // Set mounted state to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser?.id) return null;
    try {
      console.log('[Auth] Fetching profile for auth_id:', authUser.id);
      
      // Using .single() as requested, but with robust error handling
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn('[Auth] No profile found in users table for this auth_id.');
        } else {
          console.error('[Auth] Database error fetching profile:', error);
        }
        return null;
      }

      console.log('[Auth] Profile fetched successfully:', data.full_name, `(${data.role})`);
      return data;
    } catch (err) {
      console.error('[Auth] Exception in fetchProfile:', err);
      return null;
    }
  }, []);

  const handleRedirect = useCallback((userProfile, currentPath) => {
    if (!userProfile) return;
    
    let target = '/login';
    if (userProfile.role === 'admin') target = '/admin';
    else if (userProfile.role === 'teacher') target = '/teacher';
    else if (userProfile.role === 'student') target = '/student';

    console.log(`[Auth] Redirect check: Role=${userProfile.role}, Current=${currentPath}, Target=${target}`);

    // Only redirect if on login or landing page, or if trying to access wrong role area
    // (ProtectedRoute handles the area protection, but this handles the post-login landing)
    if (currentPath === '/login' || currentPath === '/') {
      console.log(`[Auth] Landing redirect to: ${target}`);
      router.replace(target);
    }
  }, [router]);

  useEffect(() => {
    if (!mounted) return;
    if (isInitialized.current) return;
    isInitialized.current = true;

    let isSubscribed = true;

    const initAuth = async () => {
      try {
        console.log('[Auth] Initializing session...');
        dispatch(setLoading(true));
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[Auth] Session error:', sessionError);
          throw sessionError;
        }

        if (!isSubscribed) return;

        if (session?.user) {
          console.log('[Auth] Valid session found:', session.user.email);
          const profileData = await fetchProfile(session.user);
          
          if (!isSubscribed) return;

          if (!profileData) {
            console.warn('[Auth] Authenticated but no profile record. Redirecting to login.');
            dispatch(clearAuth());
            router.replace('/login?error=profile_not_found');
          } else {
            dispatch(setAuth({ user: session.user, profile: profileData }));
            handleRedirect(profileData, window.location.pathname);
          }
        } else {
          console.log('[Auth] No active session found.');
          dispatch(clearAuth());
        }
      } catch (err) {
        if (!isSubscribed) return;
        console.error('[Auth] Initialization fatal error:', err);
        dispatch(setAuthError(err.message));
        dispatch(clearAuth());
      } finally {
        console.log('[Auth] Initialization flow completed.');
        dispatch(setLoading(false));
      }
    };

    initAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Event detected:', event);
      if (!isSubscribed) return;
      
      try {
        // Handle token refresh or sign in or password recovery
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'PASSWORD_RECOVERY') {
          if (session?.user) {
            const profileData = await fetchProfile(session.user);
            if (!isSubscribed) return;
            
            if (profileData) {
              dispatch(setAuth({ user: session.user, profile: profileData }));
              handleRedirect(profileData, window.location.pathname);
            } else {
              dispatch(clearAuth());
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('[Auth] User signed out, clearing state.');
          dispatch(clearAuth());
          router.replace('/login');
        }
      } catch (err) {
        console.error('[Auth] Error in onAuthStateChange handler:', err);
      }
    });

    return () => {
      isSubscribed = false;
      subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Initial initialization loading screen (with hydration protection)
  if (!mounted || (loading && !isAuthenticated)) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Checking Authentication</h2>
          <p className="text-sm text-gray-400 mt-1">Please wait while we secure your session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
