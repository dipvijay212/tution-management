'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MarksEntryTable from '@/features/exams/components/MarksEntryTable';
import { supabaseHelpers } from '@/lib/supabase/client';
import { ArrowLeft, Award, TrendingUp, Info } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ExamMarksPage() {
  const { examId } = useParams();
  const router = useRouter();

  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [examInfo, setExamInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadExamData = async () => {
      try {
        setLoading(true);
        // Mock data
        setExamInfo({ 
          title: 'Mid-Term Mathematics', 
          subject: 'Mathematics', 
          max_marks: 100, 
          batch_name: 'Batch A' 
        });
        
        setStudents([
          { id: '1', full_name: 'Rahul Sharma' },
          { id: '2', full_name: 'Priya Singh' },
          { id: '3', full_name: 'Amit Patel' },
          { id: '4', full_name: 'Suresh Kumar' },
          { id: '5', full_name: 'Anjali Gupta' },
        ]);
        
        // Simulating some existing marks
        setMarks({
          '1': '92',
          '2': '85',
          '3': '78',
        });
      } catch (error) {
        toast.error('Failed to load exam data');
      } finally {
        setLoading(false);
      }
    };
    loadExamData();
  }, [examId]);

  const handleMarkChange = (studentId, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const handleSaveResults = async () => {
    try {
      setSaving(true);
      // Simulate API call
      console.log('Saving marks:', marks);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Results published successfully!');
      router.push('/admin/exams');
    } catch (error) {
      toast.error('Failed to save results');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/exams" className="p-2 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-indigo-600 hover:border-indigo-100 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{examInfo?.title}</h1>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
               {examInfo?.subject} • {examInfo?.batch_name}
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
               <TrendingUp size={24} />
            </div>
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Average Marks</p>
               <p className="text-xl font-black text-gray-900">85.0 / 100</p>
            </div>
         </div>
         <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
               <Award size={24} />
            </div>
            <div>
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Passing Rate</p>
               <p className="text-xl font-black text-gray-900">100%</p>
            </div>
         </div>
         <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 text-amber-600">
            <Info size={24} className="flex-shrink-0" />
            <p className="text-xs font-medium leading-relaxed">
               Marks are automatically calculated into percentages and ranks. Ensure accuracy before publishing.
            </p>
         </div>
      </div>

      <MarksEntryTable 
        students={students} 
        marks={marks} 
        maxMarks={examInfo?.max_marks || 100}
        onMarkChange={handleMarkChange} 
        onSave={handleSaveResults}
        isLoading={saving} 
      />
    </div>
  );
}
