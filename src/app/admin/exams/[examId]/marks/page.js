'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Loader2, 
  Award, 
  BookOpen, 
  Users, 
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import MarksEntryTable from '@/features/exams/components/MarksEntryTable';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function ExamMarksPage() {
  const { examId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exam, setExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Exam Details with batch info
        const { data: examData, error: examError } = await supabase
          .from('exams')
          .select('*, batch:batches(batch_name)')
          .eq('id', examId)
          .maybeSingle();

        if (examError) throw examError;
        if (!examData) {
          setExam(null);
          return;
        }
        
        const formattedExam = {
          ...examData,
          batch_name: examData.batch?.batch_name || 'N/A'
        };
        setExam(formattedExam);

        // 2. Fetch Students
        // Note: In a production app, we would fetch students associated with the specific batch.
        // If there's no junction table, we fetch all students for now.
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .order('full_name', { ascending: true });

        if (studentError) throw studentError;
        setStudents(studentData);

        // 3. Fetch existing marks for this exam
        const { data: resultsData, error: resultsError } = await supabase
          .from('exam_results')
          .select('*')
          .eq('exam_id', examId);

        if (resultsError) throw resultsError;
        
        const marksMap = {};
        resultsData.forEach(res => {
          marksMap[res.student_id] = res.marks.toString();
        });
        setMarks(marksMap);

      } catch (error) {
        console.error('Error loading marks data:', error);
        toast.error('Failed to load exam data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (examId) {
      loadData();
    }
  }, [examId]);

  const handleMarkChange = (studentId, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const handleSave = async () => {
    if (!exam) return;
    
    try {
      setSaving(true);
      
      const payload = Object.entries(marks)
        .filter(([_, score]) => score !== '')
        .map(([studentId, score]) => ({
          exam_id: examId,
          student_id: studentId,
          marks: parseFloat(score)
        }));

      if (payload.length === 0) {
        toast.error('No marks to save');
        return;
      }

      // Upsert marks to exam_results table
      const { error } = await supabase
        .from('exam_results')
        .upsert(payload, { onConflict: 'exam_id,student_id' });

      if (error) throw error;
      
      toast.success('Marks saved successfully!');
      router.push('/admin/exams');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save marks: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
        <AlertCircle size={48} className="mx-auto text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Exam not found</h2>
        <p className="text-gray-500 mt-2">The assessment you are looking for does not exist or has been removed.</p>
        <Link href="/admin/exams" className="mt-6 inline-block">
          <Button variant="secondary">Go back to Exams</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/exams" className="p-2 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-indigo-600 hover:border-indigo-100 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enter Exam Marks</h1>
            <p className="text-gray-500 text-sm mt-0.5">Record and update student performance for this assessment.</p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none border-gray-200">
             Export Result
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 sm:flex-none gap-2 shadow-lg shadow-indigo-100">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save All
          </Button>
        </div>
      </div>

      {/* Exam Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8">
           <div className="flex-1 flex items-start gap-4">
              <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600">
                 <Award size={32} />
              </div>
              <div>
                 <h2 className="text-xl font-bold text-gray-900">{exam.title}</h2>
                 <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase">
                       <BookOpen size={14} className="text-gray-400" /> {exam.subject}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase">
                       <Users size={14} className="text-gray-400" /> {exam.batch_name}
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="flex gap-8 border-l border-gray-100 pl-8">
              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Exam Date</p>
                 <p className="text-sm font-bold text-gray-900 mt-1 flex items-center gap-1.5">
                    <Calendar size={14} className="text-indigo-500" /> {exam.date}
                 </p>
              </div>
              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Max Marks</p>
                 <p className="text-lg font-black text-indigo-600 mt-0.5">{exam.max_marks}</p>
              </div>
           </div>
        </div>

        <div className="bg-emerald-600 p-6 rounded-3xl shadow-lg shadow-emerald-100 text-white flex flex-col justify-between">
           <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Status</p>
           <div className="mt-2 flex items-center gap-2">
              <CheckCircle2 size={24} />
              <span className="text-lg font-bold">Ready to publish</span>
           </div>
           <p className="mt-4 text-[10px] text-emerald-100">All student records fetched</p>
        </div>
      </div>

      {/* Marks Table */}
      <MarksEntryTable 
        students={students}
        marks={marks}
        maxMarks={parseFloat(exam.max_marks)}
        onMarkChange={handleMarkChange}
        onSave={handleSave}
        isLoading={saving}
      />
    </div>
  );
}
