'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ArrowLeft, User, Mail, Lock, Phone, GraduationCap, Award, Calendar, DollarSign, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const teacherSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  experience_years: z.coerce.number().min(0, 'Experience years must be 0 or greater').default(0),
  salary: z.coerce.number().min(0, 'Salary must be 0 or greater').default(0),
});

export default function CreateTeacherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      phone: '',
      qualification: '',
      specialization: '',
      experience_years: 0,
      salary: 0,
    }
  });

  const onSubmit = async (data) => {
    try {
      console.log('[Create Teacher Frontend] onSubmit started. Form data:', { ...data, password: '***' });
      setLoading(true);

      // 1. Retrieve the authenticated admin user's JWT
      console.log('[Create Teacher Frontend] Retrieving session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[Create Teacher Frontend] Session error:', sessionError);
        throw sessionError;
      }
      
      if (!session) {
        console.error('[Create Teacher Frontend] No session found.');
        throw new Error('Your session has expired. Please log in again.');
      }

      const token = session.access_token;
      console.log('[Create Teacher Frontend] Session retrieved successfully. Token exists:', !!token);

      // 2. Call the secure admin API route
      console.log('[Create Teacher Frontend] Sending fetch request to /api/admin/create-teacher...');
      const response = await fetch('/api/admin/create-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      console.log('[Create Teacher Frontend] Response status received:', response.status);
      const result = await response.json();
      console.log('[Create Teacher Frontend] Response body received:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to enroll teacher member');
      }

      toast.success('Teacher enrolled and credentials created successfully!');
      router.push('/admin/teachers');
      router.refresh();
    } catch (err) {
      console.error('[Create Teacher Frontend] Enrollment failed with error:', err);
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      console.log('[Create Teacher Frontend] onSubmit completed, resetting loading.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/teachers" 
          className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-slate-50 transition-all group"
        >
          <ArrowLeft size={20} className="transform group-hover:-translate-x-0.5 transition-transform" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Add New Teacher</h1>
          <p className="text-slate-500 text-sm mt-0.5">Enroll a new faculty member, set credentials, and assign academic details.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white p-8 rounded-3xl premium-shadow border border-slate-100 relative overflow-hidden">
        
        {/* Background gradient blob */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none"></div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10" noValidate>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <Input
              id="full_name"
              label="Full Name *"
              error={errors.full_name?.message}
              icon={User}
              {...register('full_name')}
              placeholder="e.g. Dr. John Doe"
              disabled={loading}
            />

            {/* Email Address */}
            <Input
              id="email"
              type="email"
              label="Email Address *"
              error={errors.email?.message}
              icon={Mail}
              {...register('email')}
              placeholder="john.doe@example.com"
              disabled={loading}
              autoComplete="email"
            />

            {/* Password */}
            <div className="w-full space-y-1.5 relative">
              <label className="text-sm font-semibold text-slate-700">Account Password *</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`flex w-full bg-slate-50 border ${
                    errors.password ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'
                  } rounded-xl pl-10 pr-10 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all`}
                  placeholder="Minimum 8 characters"
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

            {/* Phone Number */}
            <Input
              id="phone"
              label="Phone Number"
              error={errors.phone?.message}
              icon={Phone}
              {...register('phone')}
              placeholder="e.g. +1 (555) 019-2834"
              disabled={loading}
            />

            {/* Qualification */}
            <Input
              id="qualification"
              label="Qualification"
              error={errors.qualification?.message}
              icon={GraduationCap}
              {...register('qualification')}
              placeholder="e.g. Ph.D. in Mathematics"
              disabled={loading}
            />

            {/* Specialization */}
            <Input
              id="specialization"
              label="Specialization"
              error={errors.specialization?.message}
              icon={Award}
              {...register('specialization')}
              placeholder="e.g. Algebra & Calculus"
              disabled={loading}
            />

            {/* Experience Years */}
            <Input
              id="experience_years"
              type="number"
              label="Experience (Years)"
              error={errors.experience_years?.message}
              icon={Calendar}
              {...register('experience_years')}
              placeholder="e.g. 5"
              disabled={loading}
            />

            {/* Salary */}
            <Input
              id="salary"
              type="number"
              label="Salary (Monthly)"
              error={errors.salary?.message}
              icon={DollarSign}
              {...register('salary')}
              placeholder="e.g. 4500"
              disabled={loading}
            />

          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
            <Link href="/admin/teachers">
              <Button type="button" variant="secondary" disabled={loading}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={loading}>
              Create Teacher
            </Button>
          </div>

        </form>
      </div>

    </div>
  );
}
