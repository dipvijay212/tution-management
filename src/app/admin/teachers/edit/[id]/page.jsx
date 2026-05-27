'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { teachersService } from '@/services/teachers.service';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ArrowLeft, User, Mail, Phone, GraduationCap, Award, Calendar, DollarSign, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const editTeacherSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  experience_years: z.coerce.number().min(0, 'Experience years must be 0 or greater').default(0),
  salary: z.coerce.number().min(0, 'Salary must be 0 or greater').default(0),
});

export default function EditTeacherPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teacher, setTeacher] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editTeacherSchema),
  });

  // Load teacher data on mount
  useEffect(() => {
    async function loadTeacher() {
      try {
        setLoading(true);
        console.log(`[Edit Teacher] Fetching teacher details for id: ${id}`);
        const data = await teachersService.getById(id);
        
        if (!data) {
          throw new Error('Teacher record not found');
        }

        setTeacher(data);
        
        // Reset form with fetched values
        reset({
          full_name: data.full_name || '',
          phone: data.phone || '',
          qualification: data.qualification || '',
          specialization: data.specialization || '',
          experience_years: data.experience_years || 0,
          salary: data.salary || 0,
        });
      } catch (err) {
        console.error('[Edit Teacher] Failed to load teacher data:', err);
        toast.error('Failed to load teacher details.');
        router.push('/admin/teachers');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadTeacher();
    }
  }, [id, reset, router]);

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      console.log('[Edit Teacher] Saving changes:', data);

      // 1. Update teacher metadata in public.teachers
      await teachersService.update(id, {
        full_name: data.full_name,
        phone: data.phone || null,
        qualification: data.qualification || null,
        specialization: data.specialization || null,
        experience_years: parseInt(data.experience_years) || 0,
        salary: parseFloat(data.salary) || 0,
      });

      // 2. Synchronize changes to public.users parent table
      if (teacher && teacher.user_id) {
        console.log('[Edit Teacher] Synchronizing update to public.users for user_id:', teacher.user_id);
        const { error: userUpdateError } = await supabase
          .from('users')
          .update({
            full_name: data.full_name,
            phone: data.phone || null,
          })
          .eq('id', teacher.user_id);

        if (userUpdateError) {
          console.error('[Edit Teacher] Failed to synchronize profile to public.users:', userUpdateError);
          throw userUpdateError;
        }
      }

      toast.success('Teacher profile updated successfully!');
      router.push('/admin/teachers');
      router.refresh();
    } catch (err) {
      console.error('[Edit Teacher] Update failed:', err);
      toast.error(err.message || 'An error occurred while updating the teacher profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-500 font-medium text-sm">Loading teacher details...</p>
      </div>
    );
  }

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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Teacher Profile</h1>
          <p className="text-slate-500 text-sm mt-0.5">Modify teacher profile data, specialization, and employment metadata.</p>
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
              disabled={saving}
            />

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
                  value={teacher?.email || ''}
                  disabled
                />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">To modify account logins, please contact system administration.</p>
            </div>

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

            {/* Qualification */}
            <Input
              id="qualification"
              label="Qualification"
              error={errors.qualification?.message}
              icon={GraduationCap}
              {...register('qualification')}
              placeholder="e.g. Ph.D. in Mathematics"
              disabled={saving}
            />

            {/* Specialization */}
            <Input
              id="specialization"
              label="Specialization"
              error={errors.specialization?.message}
              icon={Award}
              {...register('specialization')}
              placeholder="e.g. Algebra & Calculus"
              disabled={saving}
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
              disabled={saving}
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
              disabled={saving}
            />

          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
            <Link href="/admin/teachers">
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
