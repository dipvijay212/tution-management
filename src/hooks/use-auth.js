"use client";

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { setAuth, setLoading, setAuthError, clearAuth } from '@/store/slices/authSlice';
import toast from 'react-hot-toast';

/**
 * useAuth Hook
 * Provides access to global auth state and login/logout methods.
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, profile, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser?.id) return null;
    try {
      console.log('[useAuth] Fetching profile for:', authUser.id);
      const { data, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();

      if (profileError) {
        console.error('[useAuth] Profile fetch error:', profileError);
        return null;
      }
      return data;
    } catch (err) {
      console.error('[useAuth] Exception in fetchProfile:', err);
      return null;
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log('[useAuth] Attempting login for:', email);
      dispatch(setLoading(true));
      
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        console.error('[useAuth] Login error:', loginError.message);
        dispatch(setAuthError(loginError.message));
        toast.error(loginError.message);
        return { error: loginError };
      }

      console.log('[useAuth] Auth success, fetching profile...');
      const profileData = await fetchProfile(data.user);
      
      if (!profileData) {
        toast.error('User profile not found. Please contact admin.');
        dispatch(clearAuth());
        return { error: new Error('Profile not found') };
      }

      dispatch(setAuth({ user: data.user, profile: profileData }));
      toast.success('Logged in successfully!');
      
      // Detailed logging for redirect
      let target = '/login';
      if (profileData.role === 'admin') target = '/admin';
      else if (profileData.role === 'teacher') target = '/teacher';
      else if (profileData.role === 'student') target = '/student';
      
      console.log(`[useAuth] Login complete. Role: ${profileData.role}, Redirecting to: ${target}`);
      router.replace(target);

      return { data };
    } catch (err) {
      console.error('[useAuth] Unexpected login error:', err);
      toast.error('An unexpected error occurred during login');
      return { error: err };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async () => {
    try {
      console.log('[useAuth] Logging out...');
      dispatch(setLoading(true));
      const { error: logoutError } = await supabase.auth.signOut();
      
      if (logoutError) {
        toast.error(logoutError.message);
      } else {
        dispatch(clearAuth());
        toast.success('Logged out successfully');
        router.replace('/login');
      }
    } catch (err) {
      console.error('[useAuth] Logout error:', err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    user,
    profile,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    fetchProfile,
  };
};
