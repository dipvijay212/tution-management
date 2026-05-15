'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Button from '@/components/ui/Button';
import { Loader2, FileText, Calendar, Book, Award } from 'lucide-react';

const examSchema = z.object({
  title: z.string().min(3, 'Exam title must be at least 3 characters'),
  subject: z.string().min(1, 'Please select a subject'),
  batch_id: z.string().min(1, 'Please select a batch'),
  date: z.string().min(1, 'Date is required'),
  max_marks: z.string().min(1, 'Maximum marks is required'),
});

const ExamForm = ({ batches = [], subjects = [], onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(examSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700">Exam Title</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              {...register('title')}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              placeholder="Unit Test 1 - Mathematics"
            />
          </div>
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        {/* Batch */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Target Batch</label>
          <select
            {...register('batch_id')}
            className="mt-1 block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm appearance-none"
          >
            <option value="">Select Batch</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Subject</label>
          <select
            {...register('subject')}
            className="mt-1 block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm appearance-none"
          >
            <option value="">Select Subject</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Exam Date</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={18} className="text-gray-400" />
            </div>
            <input
              type="date"
              {...register('date')}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* Max Marks */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Maximum Marks</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Award size={18} className="text-gray-400" />
            </div>
            <input
              type="number"
              {...register('max_marks')}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
              placeholder="100"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6">
        <Button variant="ghost" type="button">Cancel</Button>
        <Button type="submit" disabled={isLoading} className="px-8 shadow-lg shadow-indigo-100">
          {isLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
          Create Exam
        </Button>
      </div>
    </form>
  );
};

export default ExamForm;
