'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import TeacherForm from '@/features/teachers/components/TeacherForm';
import { supabaseHelpers } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddTeacherPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddTeacher = async (data) => {
    try {
      setLoading(true);
      await supabaseHelpers.insert('teachers', data);
      toast.success('Teacher added successfully!');
      router.push('/admin/teachers');
    } catch (error) {
      toast.error('Failed to add teacher. ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/teachers" className="p-2 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-indigo-600 hover:border-indigo-100 transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Teacher</h1>
          <p className="text-gray-500 text-sm mt-0.5">Enroll a new faculty member and assign their specialization.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <TeacherForm onSubmit={handleAddTeacher} isLoading={loading} />
      </div>
    </div>
  );
}
