'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { 
  Loader2, 
  Calendar as CalendarIcon,
  FileText, 
  BookOpen, 
  Clock, 
  Download,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherAssignmentsPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    if (profile) {
      fetchAssignments();
    }
  }, [profile]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch teacher record
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (teacherError) throw teacherError;
      const tId = teacherData?.id || profile.id;

      // 2. Fetch assigned evaluations
      const { data: assignmentsData, error: assignError } = await supabase
        .from('assignments')
        .select('*, batch:batches(batch_name)')
        .eq('teacher_id', tId);

      if (assignError) throw assignError;

      if (assignmentsData && assignmentsData.length > 0) {
        setAssignments(assignmentsData);
      } else {
        setAssignments([]);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      toast.error('Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments Management</h1>
          <p className="text-gray-500 text-sm mt-1">Publish, evaluate, and track assignment worksheets for your students.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map((assignment) => {
          const isOverdue = new Date(assignment.due_date) < new Date();
          return (
            <Card key={assignment.id} className="p-6 relative hover:shadow-md transition-all group border-gray-100/90 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-105 transition-transform">
                    <FileText size={22} />
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 tracking-wide uppercase">
                    {assignment.batch?.batch_name || 'General Batch'}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {assignment.title}
                </h3>
                
                <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                  {assignment.description || 'No detailed instructions provided.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50 flex flex-wrap gap-4 justify-between items-center text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={14} className="text-indigo-500" />
                  <span>Due: <strong className="font-bold">{formatDate(assignment.due_date)}</strong></span>
                  {isOverdue && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                      <AlertCircle size={10} /> Overdue
                    </span>
                  )}
                </div>

                <div className="text-gray-400">
                  Published: {formatDate(assignment.created_at)}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {assignments.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center">
          <EmptyState
            icon={FileText}
            title="No Assignments Published"
            description="You have not published any student worksheets or homework folders yet."
          />
        </div>
      )}
    </div>
  );
}
