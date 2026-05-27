'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ArrowLeft, User, Mail, Lock, Phone, Calendar, School, ShieldAlert, Home, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const studentSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  gender: z.string().optional(),
  date_of_birth: z.string().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }).optional(),
  class_name: z.string().optional(),
  school_name: z.string().optional(),
  parent_name: z.string().optional(),
  parent_phone: z.string().optional(),
  address: z.string().optional(),
});

export default function CreateStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      phone: '',
      gender: '',
      date_of_birth: '',
      class_name: '',
      school_name: '',
      parent_name: '',
      parent_phone: '',
      address: '',
    }
  });

  const onSubmit = async (data) => {
    try {
      console.log('[Create Student Frontend] onSubmit started. Form data:', { ...data, password: '***' });
      setLoading(true);

      // 1. Retrieve the authenticated admin user's JWT
      console.log('[Create Student Frontend] Retrieving session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('[Create Student Frontend] Session error:', sessionError);
        throw sessionError;
      }
      
      if (!session) {
        console.error('[Create Student Frontend] No session found.');
        throw new Error('Your session has expired. Please log in again.');
      }

      const token = session.access_token;
      console.log('[Create Student Frontend] Session retrieved successfully. Token exists:', !!token);

      // Make sure empty dates are passed as null rather than empty string for Postgres compatibility
      const payload = {
        ...data,
        date_of_birth: data.date_of_birth || null,
      };
      console.log('[Create Student Frontend] Payload formatted:', payload);

      // 2. Call the secure admin API route
      console.log('[Create Student Frontend] Sending fetch request to /api/admin/create-student...');
      const response = await fetch('/api/admin/create-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('[Create Student Frontend] Response status received:', response.status);
      const result = await response.json();
      console.log('[Create Student Frontend] Response body received:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to enroll student member');
      }

      toast.success('Student enrolled and credentials created successfully!');
      router.push('/admin/students');
      router.refresh();
    } catch (err) {
      console.error('[Create Student Frontend] Enrollment failed with error:', err);
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      console.log('[Create Student Frontend] onSubmit completed, resetting loading.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/students" 
          className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-slate-50 transition-all group"
        >
          <ArrowLeft size={20} className="transform group-hover:-translate-x-0.5 transition-transform" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Add New Student</h1>
          <p className="text-slate-500 text-sm mt-0.5">Fill in the student's personal information, academic context, and parent details.</p>
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
              placeholder="e.g. Alice Smith"
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
              placeholder="alice.smith@example.com"
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
              placeholder="e.g. +1 (555) 091-2839"
              disabled={loading}
            />

            {/* Gender Dropdown */}
            <div className="w-full space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Gender</label>
              <select
                {...register('gender')}
                className="flex w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                disabled={loading}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-xs text-rose-500 font-medium">{errors.gender.message}</p>}
            </div>

            {/* Date of Birth */}
            <Input
              id="date_of_birth"
              type="date"
              label="Date of Birth"
              error={errors.date_of_birth?.message}
              icon={Calendar}
              {...register('date_of_birth')}
              disabled={loading}
            />

            {/* Class Name */}
            <Input
              id="class_name"
              label="Class / Grade"
              error={errors.class_name?.message}
              icon={School}
              {...register('class_name')}
              placeholder="e.g. Grade 10"
              disabled={loading}
            />

            {/* School Name */}
            <Input
              id="school_name"
              label="School Name"
              error={errors.school_name?.message}
              icon={School}
              {...register('school_name')}
              placeholder="e.g. St. Jude High School"
              disabled={loading}
            />

            {/* Parent Name */}
            <Input
              id="parent_name"
              label="Parent / Guardian Name"
              error={errors.parent_name?.message}
              icon={User}
              {...register('parent_name')}
              placeholder="e.g. Robert Smith"
              disabled={loading}
            />

            {/* Parent Phone */}
            <Input
              id="parent_phone"
              label="Parent Phone Number"
              error={errors.parent_phone?.message}
              icon={Phone}
              {...register('parent_phone')}
              placeholder="e.g. +1 (555) 012-3456"
              disabled={loading}
            />

            {/* Address */}
            <div className="w-full md:col-span-2">
              <Input
                id="address"
                label="Residential Address"
                error={errors.address?.message}
                icon={Home}
                {...register('address')}
                placeholder="e.g. 123 Maple Street, Suite 4B, Springfield"
                disabled={loading}
              />
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
            <Link href="/admin/students">
              <Button type="button" variant="secondary" disabled={loading}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={loading}>
              Create Student
            </Button>
          </div>

        </form>
      </div>

    </div>
  );
}
