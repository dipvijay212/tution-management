'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabaseHelpers } from '@/lib/supabase/client';
import { Plus, Search, Filter, Calendar, BookOpen, UserCheck, Trash2, Edit, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import ExamForm from '@/features/exams/components/ExamForm';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function AdminExamsPage() {
  const [exams, setExams] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch batches for form
        const batchData = await supabaseHelpers.getAll('batches', { orderBy: 'batch_name' });
        setBatches(batchData);
        
        // Fetch exams
        // const examData = await supabaseHelpers.getAll('exams', { orderBy: 'date', ascending: false });
        // setExams(examData);
        
        // Mock data
        setExams([
          { id: '1', title: 'Mid-Term Mathematics', subject: 'Mathematics', batch_name: 'Batch A', date: '2024-05-15', max_marks: 100, status: 'published' },
          { id: '2', title: 'Physics Quiz 1', subject: 'Physics', batch_name: 'Batch C', date: '2024-05-20', max_marks: 50, status: 'draft' },
        ]);
      } catch (error) {
        console.error('Failed to load exams');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleCreateExam = async (data) => {
    try {
      setLoading(true);
      // await supabaseHelpers.insert('exams', data);
      toast.success('Exam created successfully!');
      setShowAdd(false);
    } catch (error) {
      toast.error('Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams & Results</h1>
          <p className="text-gray-500 text-sm mt-1">Schedule assessments, enter marks, and generate performance reports.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 shadow-lg shadow-indigo-100">
          <Plus size={18} /> Schedule Exam
        </Button>
      </div>

      {showAdd && (
        <div className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-xl animate-in fade-in zoom-in-95 duration-300">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">New Assessment</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
           </div>
           <ExamForm batches={batches} onSubmit={handleCreateExam} isLoading={loading} />
        </div>
      )}

      {/* Exam Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map(exam => (
          <div key={exam.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                  <BookOpen size={24} />
               </div>
               <span className={cn(
                 "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                 exam.status === 'published' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
               )}>
                 {exam.status}
               </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{exam.title}</h3>
            <p className="text-xs text-gray-500 font-medium uppercase mt-1">{exam.subject} • {exam.batch_name}</p>
            
            <div className="mt-6 flex flex-col gap-3">
               <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  <span>{exam.date}</span>
               </div>
               <div className="flex items-center gap-3 text-sm text-gray-600">
                  <UserCheck size={16} className="text-gray-400" />
                  <span>Max Marks: {exam.max_marks}</span>
               </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 flex gap-2">
               <Link href={`/admin/exams/${exam.id}/marks`} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-none">
                     Enter Marks
                  </Button>
               </Link>
               <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 size={18} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
