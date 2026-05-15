'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentForm from '@/features/students/components/StudentForm';
import { supabaseHelpers } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddStudentPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddStudent = async (data) => {
    try {
      setLoading(true);
      await supabaseHelpers.insert('students', data);
      toast.success('Student added successfully!');
      router.push('/admin/students');
    } catch (error) {
      toast.error('Failed to add student. ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/students" className="p-2 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-indigo-600 hover:border-indigo-100 transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
          <p className="text-gray-500 text-sm mt-0.5">Fill in the details to enroll a new student.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <StudentForm onSubmit={handleAddStudent} isLoading={loading} />
      </div>
    </div>
  );
}
