'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { Lock, Loader2, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Check if we have an active session from the recovery link
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          console.warn('[Reset Password] No active session found. The token might be expired or invalid.');
          setIsError(true);
        }
      } catch (err) {
        console.error('[Reset Password] Session check error:', err);
        setIsError(true);
      } finally {
        setSessionLoading(false);
      }
    };
    
    // Supabase handles the hash fragment automatically and creates a session.
    // We just wait a bit for the onAuthStateChange to process the hash.
    setTimeout(checkSession, 500);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
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

      toast.success('Password successfully reset! Please log in.');
      // Sign out immediately so they have to log in with new password
      await supabase.auth.signOut();
      router.replace('/login');
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-rose-100 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 mb-6">
            <ShieldAlert className="h-8 w-8 text-rose-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid or Expired Link</h2>
          <p className="text-gray-600 mb-8 text-sm">
            The password reset link is invalid or has expired. For security reasons, these links expire after 24 hours.
          </p>
          <Link href="/forgot-password">
            <Button className="w-full py-3">Request New Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
        
        {/* Background Decorative blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Create new password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your new password must be different from previous used passwords.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`block w-full rounded-xl border ${
                    errors.password ? 'border-red-300 ring-red-100' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
                  } bg-gray-50 py-2.5 pl-10 pr-10 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition-all`}
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className={`block w-full rounded-xl border ${
                    errors.confirmPassword ? 'border-red-300 ring-red-100' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
                  } bg-gray-50 py-2.5 pl-10 pr-10 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition-all`}
                  placeholder="Must match new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting password...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
