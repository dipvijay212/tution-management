'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { 
  Loader2, 
  Search, 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  BookOpen,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherStudentsPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (profile) {
      fetchStudents();
    }
  }, [profile]);

  const fetchStudents = async () => {
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

      // 2. Fetch teacher batches
      const { data: batches, error: batchesError } = await supabase
        .from('batches')
        .select('id, batch_name')
        .eq('teacher_id', tId);

      if (batchesError) throw batchesError;
      const batchIds = batches?.map(b => b.id) || [];

      let roster = [];
      if (batchIds.length > 0) {
        // 3. Fetch student mappings
        const { data: studentBatches, error: sbError } = await supabase
          .from('student_batches')
          .select('student:students(*), batch:batches(batch_name)')
          .in('batch_id', batchIds);

        if (sbError) throw sbError;
        
        roster = studentBatches
          ?.filter(sb => sb.student)
          .map(sb => ({
            ...sb.student,
            batch_name: sb.batch?.batch_name
          })) || [];
      }

      if (roster.length > 0) {
        setStudents(roster);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Failed to load student directory.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => 
    student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.batch_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Student Directory</h1>
          <p className="text-gray-500 text-sm mt-1">Directory of students registered in your assigned learning batches.</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or code..."
            className="block w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="p-6 relative hover:shadow-md transition-all group border-gray-100/80">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                {student.full_name?.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                  {student.full_name}
                </h3>
                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 tracking-wide uppercase mt-1">
                  {student.student_code || 'STUDENT'}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-50 text-sm">
              <div className="flex items-center gap-2.5 text-gray-600">
                <BookOpen size={15} className="text-indigo-500 flex-shrink-0" />
                <span className="font-semibold truncate">{student.batch_name || 'Unassigned Batch'}</span>
              </div>

              {student.email && (
                <div className="flex items-center gap-2.5 text-gray-600">
                  <Mail size={15} className="text-indigo-500 flex-shrink-0" />
                  <span className="truncate">{student.email}</span>
                </div>
              )}

              {student.phone && (
                <div className="flex items-center gap-2.5 text-gray-600">
                  <Phone size={15} className="text-indigo-500 flex-shrink-0" />
                  <span>{student.phone}</span>
                </div>
              )}

              {student.school_name && (
                <div className="flex items-center gap-2.5 text-gray-500 text-xs mt-1">
                  <MapPin size={13} className="text-indigo-400 flex-shrink-0" />
                  <span className="truncate italic">{student.school_name}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center">
          <EmptyState
            icon={GraduationCap}
            title="No Students Found"
            description={searchQuery ? "No search results match your criteria." : "You have no registered students in your classes yet."}
          />
        </div>
      )}
    </div>
  );
}
