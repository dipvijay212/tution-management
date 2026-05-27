'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
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
    defaultValues: {
      email: '',
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Ensure the redirect URL matches Supabase settings
      const redirectToUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : "http://localhost:3000/reset-password";
        
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: redirectToUrl,
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
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl premium-shadow border border-slate-100 relative overflow-hidden transition-all duration-300">
        
        {/* Background Decorative Gradient Blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-100 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        {!isSuccess ? (
          <div className="relative z-10 space-y-6">
            <div>
              <Link 
                href="/login" 
                className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors group mb-6"
              >
                <ArrowLeft size={16} className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
                Back to login
              </Link>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Forgot Password
              </h2>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Enter your registered email address below, and we will email you a secure link to reset your password.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Input
                id="email"
                type="email"
                label="Email Address"
                error={errors.email?.message}
                icon={Mail}
                {...register('email')}
                placeholder="name@example.com"
                disabled={loading}
                autoComplete="email"
              />

              <Button
                type="submit"
                className="w-full py-3.5 mt-2"
                isLoading={loading}
              >
                Send Reset Link
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
                Check your inbox
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                Password reset link sent to your email. Click the link inside the email to securely choose a new password.
              </p>
            </div>
            
            <Link 
              href="/login"
              className="inline-flex w-full justify-center items-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            >
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

