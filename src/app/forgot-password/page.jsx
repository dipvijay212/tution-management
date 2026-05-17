'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast.success('Password reset link sent to your email');
    } catch (err) {
      console.error('Forgot password error:', err);
      toast.error(err.message || 'An error occurred while sending the reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
        
        {/* Background Decorative blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        {!isSuccess ? (
          <>
            <div>
              <Link href="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors mb-6">
                <ArrowLeft size={16} className="mr-2" />
                Back to login
              </Link>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Forgot Password
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className={`block w-full rounded-xl border ${
                      errors.email ? 'border-red-300 ring-red-100' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
                    } bg-gray-50 py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition-all`}
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full py-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
              Check your inbox
            </h2>
            <p className="text-sm text-gray-600 mb-8">
              We have sent a password reset link to your email address. Please click the link to create a new password.
            </p>
            <Link 
              href="/login"
              className="inline-flex w-full justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
            >
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
