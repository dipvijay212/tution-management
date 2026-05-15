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
  School, 
  MapPin, 
  Calendar, 
  Heart,
  Smartphone
} from 'lucide-react';

const studentSchema = z.object({
  full_name: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Please select gender' }),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  class_name: z.string().min(1, 'Class name is required'),
  school_name: z.string().min(1, 'School name is required'),
  parent_name: z.string().min(3, 'Parent name is required'),
  parent_phone: z.string().min(10, 'Parent phone must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
});

const StudentForm = ({ initialData, onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData || {
      gender: 'male',
      date_of_birth: '2010-01-01',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Student Full Name</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              {...register('full_name')}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
              placeholder="Rahul Singh"
            />
          </div>
          {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Heart size={18} className="text-gray-400" />
            </div>
            <select
              {...register('gender')}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm appearance-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>}
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
              placeholder="rahul@example.com"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Student Phone</label>
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

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={18} className="text-gray-400" />
            </div>
            <input
              type="date"
              {...register('date_of_birth')}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
          {errors.date_of_birth && <p className="mt-1 text-xs text-red-500">{errors.date_of_birth.message}</p>}
        </div>

        {/* Class Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Class/Grade</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Book size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              {...register('class_name')}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
              placeholder="Grade 10"
            />
          </div>
          {errors.class_name && <p className="mt-1 text-xs text-red-500">{errors.class_name.message}</p>}
        </div>

        {/* School Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">School Name</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <School size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              {...register('school_name')}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
              placeholder="St. Xavier's High School"
            />
          </div>
          {errors.school_name && <p className="mt-1 text-xs text-red-500">{errors.school_name.message}</p>}
        </div>

        {/* Parent Details */}
        <div className="md:col-span-2 py-2">
           <h3 className="text-md font-bold text-gray-800 border-b pb-2">Parent/Guardian Information</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Parent Name</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              {...register('parent_name')}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
              placeholder="Mr. Vikram Singh"
            />
          </div>
          {errors.parent_name && <p className="mt-1 text-xs text-red-500">{errors.parent_name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Parent Phone</label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Smartphone size={18} className="text-gray-400" />
            </div>
            <input
              type="tel"
              {...register('parent_phone')}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
              placeholder="9876543210"
            />
          </div>
          {errors.parent_phone && <p className="mt-1 text-xs text-red-500">{errors.parent_phone.message}</p>}
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <div className="mt-1 relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <MapPin size={18} className="text-gray-400" />
            </div>
            <textarea
              {...register('address')}
              rows={3}
              className="block w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
              placeholder="House No, Street, Landmark, City, State, ZIP"
            />
          </div>
          {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
        <Button variant="ghost" type="button" onClick={() => window.history.back()} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading} className="px-8">
          {isLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
          {initialData ? 'Update Student' : 'Add Student'}
        </Button>
      </div>
    </form>
  );
};

export default StudentForm;
