'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { Lock, Eye, EyeOff, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    let authListener = null;

    const checkSession = async () => {
      try {
        // Retrieve current session from the Supabase client
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
          console.log('[Reset Password] Active session confirmed on mount:', session.user.email);
          if (active) {
            setIsError(false);
            setSessionLoading(false);
          }
          return;
        }

        // If no session is found, let's analyze if this is a valid recovery url
        const hasHash = typeof window !== 'undefined' && window.location.hash;
        const hasSearch = typeof window !== 'undefined' && window.location.search;
        const isRecoveryUrl = 
          hasHash?.includes('type=recovery') || 
          hasHash?.includes('access_token=') || 
          hasSearch?.includes('code=');

        if (!isRecoveryUrl) {
          console.warn('[Reset Password] No session found and URL is not a recovery URL.');
          if (active) {
            setIsError(true);
            setSessionLoading(false);
          }
        }
      } catch (err) {
        console.error('[Reset Password] Error verifying session:', err);
        if (active) {
          setIsError(true);
          setSessionLoading(false);
        }
      }
    };

    checkSession();

    // Set up real-time state listener to capture recovery sessions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Reset Password] Auth event observed:', event);
      
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        if (session) {
          console.log('[Reset Password] Recovery session established successfully:', session.user.email);
          if (active) {
            setIsError(false);
            setSessionLoading(false);
          }
        }
      }
    });

    authListener = subscription;

    // Timeout fallback (3 seconds) to prevent permanent loading states
    const timeoutId = setTimeout(() => {
      if (active) {
        setSessionLoading((currLoading) => {
          if (currLoading) {
            console.warn('[Reset Password] Session check timed out. Marking token as invalid.');
            setIsError(true);
            return false;
          }
          return currLoading;
        });
      }
    }, 3000);

    return () => {
      active = false;
      if (authListener) {
        authListener.unsubscribe();
      }
      clearTimeout(timeoutId);
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast.success('Password successfully reset!');
      
      // Force clean logout to ensure they must authenticate with the new credentials
      await supabase.auth.signOut();
      
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } catch (err) {
      console.error('Reset password update error:', err);
      toast.error(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center bg-slate-50/50">
        <div className="text-center space-y-4">
          <div className="relative flex justify-center">
            <div className="h-12 w-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          </div>
          <p className="text-slate-500 font-semibold text-sm animate-pulse">Verifying reset token security...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 bg-slate-50/50">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl premium-shadow border border-rose-100/50 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50/50 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600 premium-shadow">
              <ShieldAlert className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Invalid or Expired Link</h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                The password reset link is invalid, expired, or has already been used. For your security, reset links are single-use and expire quickly.
              </p>
            </div>
            
            <Link href="/forgot-password" className="block">
              <Button className="w-full py-3.5">
                Request New Reset Link
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl premium-shadow border border-slate-100 relative overflow-hidden transition-all duration-300">
        
        {/* Background Decorative Gradient Blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-100 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        {!isSuccess ? (
          <div className="relative z-10 space-y-6">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Reset Password
              </h2>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Create a strong, unique password to secure your tuition management account.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* New Password */}
              <div className="w-full space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">New Password</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`flex w-full bg-slate-50 border ${
                      errors.password ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-xl pl-10 pr-10 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all`}
                    placeholder="At least 8 characters with a capital, lowercase & number"
                    disabled={loading}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-500 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="w-full space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`flex w-full bg-slate-50 border ${
                      errors.confirmPassword ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                    } rounded-xl pl-10 pr-10 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all`}
                    placeholder="Must match new password"
                    disabled={loading}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-500 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full py-3.5 mt-2"
                isLoading={loading}
              >
                Reset Password
              </Button>
            </form>
          </div>
        ) : (
          <div className="relative z-10 text-center py-6 space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 premium-shadow">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Password updated!
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                Your password has been changed successfully. You will be redirected to the login page momentarily.
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-indigo-600 font-semibold text-sm animate-pulse pt-2">
              <span>Redirecting to login</span>
              <ArrowRight size={16} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

