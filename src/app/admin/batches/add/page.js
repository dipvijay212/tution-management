'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BatchForm from '@/features/batches/components/BatchForm';
import { batchesService } from '@/services/batches.service';
import { teachersService } from '@/services/teachers.service';
import { subjectsService } from '@/services/subjects.service';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AddBatchPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);
        const [teachersData, subjectsData] = await Promise.all([
          teachersService.getAll(),
          subjectsService.getAll()
        ]);
        setTeachers(teachersData);
        setSubjects(subjectsData);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        toast.error('Failed to load teachers or subjects');
      } finally {
        setInitialLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleCreateBatch = async (data) => {
    try {
      setLoading(true);
      await batchesService.create(data);
      toast.success('Batch created successfully!');
      router.push('/admin/batches');
    } catch (error) {
      toast.error('Failed to create batch: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/batches" className="p-2 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-indigo-600 hover:border-indigo-100 transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Batch</h1>
          <p className="text-gray-500 text-sm mt-0.5">Configure schedule, subject, and teacher for a new tuition batch.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <BatchForm 
          onSubmit={handleCreateBatch} 
          isLoading={loading} 
          teachers={teachers}
          subjects={subjects}
        />
      </div>
    </div>
  );
}
