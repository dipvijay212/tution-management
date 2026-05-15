'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Button from '@/components/ui/Button';
import { 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Book, 
  GraduationCap, 
  Briefcase, 
  IndianRupee 
} from 'lucide-react';

const teacherSchema = z.object({
  full_name: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  specialization: z.string().min(1, 'Please select a specialization'),
  qualification: z.string().min(2, 'Qualification is required'),
  experience_years: z.string().min(1, 'Experience is required'),
  salary: z.string().min(1, 'Salary is required'),
});

const TeacherForm = ({ initialData, onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teacherSchema),
    defaultValues: initialData || {
      salary: '25000',
      experience_years: '2',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Teacher Full Name</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              {...register('full_name')}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
              placeholder="Dr. Emily Smith"
            />
          </div>
          {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-gray-400" />
            </div>
            <input
              type="email"
              {...register('email')}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
              placeholder="emily@tuitionpro.com"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone size={18} className="text-gray-400" />
            </div>
            <input
              type="tel"
              {...register('phone')}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
              placeholder="9876543210"
            />
          </div>
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
        </div>

        {/* Specialization */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Specialization</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Book size={18} className="text-gray-400" />
            </div>
            <select
              {...register('specialization')}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm appearance-none"
            >
              <option value="">Select Specialization</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="English">English</option>
            </select>
          </div>
          {errors.specialization && <p className="mt-1 text-xs text-red-500">{errors.specialization.message}</p>}
        </div>

        {/* Qualification */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Qualification</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <GraduationCap size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              {...register('qualification')}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
              placeholder="M.Sc. Mathematics, Ph.D."
            />
          </div>
          {errors.qualification && <p className="mt-1 text-xs text-red-500">{errors.qualification.message}</p>}
        </div>

        {/* Experience Years */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase size={18} className="text-gray-400" />
            </div>
            <input
              type="number"
              {...register('experience_years')}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
              placeholder="5"
            />
          </div>
          {errors.experience_years && <p className="mt-1 text-xs text-red-500">{errors.experience_years.message}</p>}
        </div>

        {/* Salary */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Expected Salary (INR)</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IndianRupee size={18} className="text-gray-400" />
            </div>
            <input
              type="number"
              {...register('salary')}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
              placeholder="25000"
            />
          </div>
          {errors.salary && <p className="mt-1 text-xs text-red-500">{errors.salary.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
        <Button variant="ghost" type="button" onClick={() => window.history.back()} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading} className="px-8">
          {isLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
          {initialData ? 'Update Teacher' : 'Add Teacher'}
        </Button>
      </div>
    </form>
  );
};

export default TeacherForm;
