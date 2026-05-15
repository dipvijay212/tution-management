'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Button from '@/components/ui/Button';
import { 
  Loader2, 
  LayoutGrid, 
  User, 
  Book, 
  Clock, 
  IndianRupee, 
  MapPin, 
  Users 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const batchSchema = z.object({
  batch_name: z.string().min(3, 'Batch name must be at least 3 characters'),
  teacher_id: z.string().min(1, 'Please select a teacher'),
  subject_id: z.string().min(1, 'Please select a subject'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  fees: z.string().min(1, 'Fees amount is required'),
  room_number: z.string().min(1, 'Room number is required'),
  capacity: z.string().min(1, 'Capacity is required'),
});

const BatchForm = ({ teachers = [], subjects = [], initialData, onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(batchSchema),
    defaultValues: initialData || {
      capacity: '30',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Batch Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700">Batch Name</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LayoutGrid size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              {...register('batch_name')}
              className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
              placeholder="Grade 10 Mathematics - Morning Batch"
            />
          </div>
          {errors.batch_name && <p className="mt-1 text-xs text-red-500">{errors.batch_name.message}</p>}
        </div>

        {/* Teacher Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Assign Teacher</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} className="text-gray-400" />
            </div>
            <select
              {...register('teacher_id')}
              className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm appearance-none"
            >
              <option value="">Select Teacher</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
            </select>
          </div>
          {errors.teacher_id && <p className="mt-1 text-xs text-red-500">{errors.teacher_id.message}</p>}
        </div>

        {/* Subject Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Subject</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Book size={18} className="text-gray-400" />
            </div>
            <select
              {...register('subject_id')}
              className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm appearance-none"
            >
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          {errors.subject_id && <p className="mt-1 text-xs text-red-500">{errors.subject_id.message}</p>}
        </div>

        {/* Time Slots */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Start Time</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock size={18} className="text-gray-400" />
            </div>
            <input
              type="time"
              {...register('start_time')}
              className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">End Time</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock size={18} className="text-gray-400" />
            </div>
            <input
              type="time"
              {...register('end_time')}
              className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Room & Capacity */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Room Number</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              {...register('room_number')}
              className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
              placeholder="R-101"
            />
          </div>
          {errors.room_number && <p className="mt-1 text-xs text-red-500">{errors.room_number.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Capacity (Students)</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Users size={18} className="text-gray-400" />
            </div>
            <input
              type="number"
              {...register('capacity')}
              className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
              placeholder="30"
            />
          </div>
          {errors.capacity && <p className="mt-1 text-xs text-red-500">{errors.capacity.message}</p>}
        </div>

        {/* Fees */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Monthly Fees (INR)</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IndianRupee size={18} className="text-gray-400" />
            </div>
            <input
              type="number"
              {...register('fees')}
              className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
              placeholder="1500"
            />
          </div>
          {errors.fees && <p className="mt-1 text-xs text-red-500">{errors.fees.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-100">
        <Button variant="ghost" type="button" onClick={() => window.history.back()} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading} className="px-10">
          {isLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
          {initialData ? 'Update Batch' : 'Create Batch'}
        </Button>
      </div>
    </form>
  );
};

export default BatchForm;
