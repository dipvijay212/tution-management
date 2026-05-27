'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { studentsService } from '@/services/students.service';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ArrowLeft, User, Mail, Phone, Calendar, Hash, Home, Shield } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const editStudentSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
  gender: z.string().optional(),
  date_of_birth: z.string().optional(),
  class_name: z.string().optional(),
  school_name: z.string().optional(),
  parent_name: z.string().optional(),
  parent_phone: z.string().optional(),
  address: z.string().optional(),
});

export default function EditStudentPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [student, setStudent] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editStudentSchema),
  });

  // Load student data on mount
  useEffect(() => {
    async function loadStudent() {
      try {
        setLoading(true);
        console.log(`[Edit Student] Fetching student details for id: ${id}`);
        const data = await studentsService.getById(id);
        
        if (!data) {
          throw new Error('Student record not found');
        }

        setStudent(data);
        
        // Reset form with fetched values
        reset({
          full_name: data.full_name || '',
          phone: data.phone || '',
          gender: data.gender || '',
          date_of_birth: data.date_of_birth || '',
          class_name: data.class_name || '',
          school_name: data.school_name || '',
          parent_name: data.parent_name || '',
          parent_phone: data.parent_phone || '',
          address: data.address || '',
        });
      } catch (err) {
        console.error('[Edit Student] Failed to load student data:', err);
        toast.error('Failed to load student details.');
        router.push('/admin/students');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadStudent();
    }
  }, [id, reset, router]);

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      console.log('[Edit Student] Saving changes:', data);

      // 1. Update student metadata in public.students
      await studentsService.update(id, {
        full_name: data.full_name,
        phone: data.phone || null,
        gender: data.gender || null,
        date_of_birth: data.date_of_birth || null,
        class_name: data.class_name || null,
        school_name: data.school_name || null,
        parent_name: data.parent_name || null,
        parent_phone: data.parent_phone || null,
        address: data.address || null,
      });

      // 2. Synchronize changes to public.users parent table
      if (student && student.user_id) {
        console.log('[Edit Student] Synchronizing update to public.users for user_id:', student.user_id);
        const { error: userUpdateError } = await supabase
          .from('users')
          .update({
            full_name: data.full_name,
            phone: data.phone || null,
          })
          .eq('id', student.user_id);

        if (userUpdateError) {
          console.error('[Edit Student] Failed to synchronize profile to public.users:', userUpdateError);
          throw userUpdateError;
        }
      }

      toast.success('Student profile updated successfully!');
      router.push('/admin/students');
      router.refresh();
    } catch (err) {
      console.error('[Edit Student] Update failed:', err);
      toast.error(err.message || 'An error occurred while updating the student profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-500 font-medium text-sm">Loading student details...</p>
      </div>
    );
  }

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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Student Profile</h1>
          <p className="text-slate-500 text-sm mt-0.5">Modify student profile data, academic details, and parent contact info.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white p-8 rounded-3xl premium-shadow border border-slate-100 relative overflow-hidden">
        
        {/* Background gradient blob */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none"></div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10" noValidate>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Student Code (Read-only) */}
            <div className="w-full space-y-1.5">
              <label className="text-sm font-semibold text-slate-500">Student Code (Permanent ID)</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Hash size={18} />
                </div>
                <input
                  type="text"
                  className="flex w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-500 cursor-not-allowed outline-none"
                  value={student?.student_code || ''}
                  disabled
                />
              </div>
            </div>

            {/* Email Address (Read-only for integrity checks) */}
            <div className="w-full space-y-1.5">
              <label className="text-sm font-semibold text-slate-500">Email Address (System ID)</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  className="flex w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-500 cursor-not-allowed outline-none"
                  value={student?.email || ''}
                  disabled
                />
              </div>
            </div>

            {/* Full Name */}
            <Input
              id="full_name"
              label="Full Name *"
              error={errors.full_name?.message}
              icon={User}
              {...register('full_name')}
              placeholder="e.g. John Doe"
              disabled={saving}
            />

            {/* Phone Number */}
            <Input
              id="phone"
              label="Phone Number"
              error={errors.phone?.message}
              icon={Phone}
              {...register('phone')}
              placeholder="e.g. +1 (555) 019-2834"
              disabled={saving}
            />

            {/* Gender */}
            <div className="w-full space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Gender</label>
              <select
                id="gender"
                className="flex w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                disabled={saving}
                {...register('gender')}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <Input
              id="date_of_birth"
              type="date"
              label="Date of Birth"
              error={errors.date_of_birth?.message}
              icon={Calendar}
              {...register('date_of_birth')}
              disabled={saving}
            />

            {/* Class Name */}
            <Input
              id="class_name"
              label="Class / Grade"
              error={errors.class_name?.message}
              icon={Shield}
              {...register('class_name')}
              placeholder="e.g. 10th Grade"
              disabled={saving}
            />

            {/* School Name */}
            <Input
              id="school_name"
              label="School Name"
              error={errors.school_name?.message}
              icon={Shield}
              {...register('school_name')}
              placeholder="e.g. St. Xavier High School"
              disabled={saving}
            />

            {/* Parent Name */}
            <Input
              id="parent_name"
              label="Parent / Guardian Name"
              error={errors.parent_name?.message}
              icon={User}
              {...register('parent_name')}
              placeholder="e.g. Robert Doe"
              disabled={saving}
            />

            {/* Parent Phone */}
            <Input
              id="parent_phone"
              label="Parent Phone Number"
              error={errors.parent_phone?.message}
              icon={Phone}
              {...register('parent_phone')}
              placeholder="e.g. +1 (555) 987-6543"
              disabled={saving}
            />

            {/* Address */}
            <div className="w-full space-y-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Residential Address</label>
              <div className="relative group">
                <div className="absolute left-3 top-3 text-gray-400">
                  <Home size={18} />
                </div>
                <textarea
                  id="address"
                  rows={3}
                  className="flex w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all resize-none"
                  placeholder="Street Address, City, Zipcode..."
                  disabled={saving}
                  {...register('address')}
                />
              </div>
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
            <Link href="/admin/students">
              <Button type="button" variant="secondary" disabled={saving}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={saving}>
              Save Changes
            </Button>
          </div>

        </form>
      </div>

    </div>
  );
}

// Add simple Loader2 wrapper
function Loader2(props) {
  return (
    <svg
      className={`animate-spin ${props.className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={props.size || 24}
      height={props.size || 24}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
