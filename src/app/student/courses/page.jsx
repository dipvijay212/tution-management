'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { 
  Loader2, 
  BookOpen, 
  Clock, 
  Users, 
  MapPin, 
  Calendar as CalendarIcon,
  Tag,
  Mail,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentCoursesPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrolledBatches, setEnrolledBatches] = useState([]);

  useEffect(() => {
    if (profile) {
      fetchEnrolledBatches();
    }
  }, [profile]);

  const fetchEnrolledBatches = async () => {
    try {
      setLoading(true);

      // 1. Fetch student record
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (studentError) throw studentError;
      if (!studentData) {
        setEnrolledBatches([]);
        return;
      }

      // 2. Fetch enrolled batches
      const { data, error } = await supabase
        .from('student_batches')
        .select(`
          id,
          batch:batches(
            id,
            batch_name,
            start_time,
            end_time,
            room_number,
            days,
            fees,
            teacher:teachers(
              full_name,
              email
            ),
            subject:subjects(
              name
            )
          )
        `)
        .eq('student_id', studentData.id);

      if (error) throw error;
      setEnrolledBatches(data || []);
    } catch (err) {
      console.error('Error fetching student batches:', err);
      toast.error('Failed to load your courses.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const [hours, minutes] = timeStr.split(':');
      const hourNum = parseInt(hours, 10);
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const formattedHour = hourNum % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
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
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Courses</h1>
        <p className="text-gray-500 text-sm">View all the classes and subjects you are currently enrolled in.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enrolledBatches.map(({ id, batch }) => {
          if (!batch) return null;
          return (
            <Card key={id} className="p-6 overflow-hidden relative hover:shadow-md transition-all group border-indigo-50/50">
              {/* Premium Gradient Top Border */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-105 transition-transform">
                  <BookOpen size={22} />
                </div>
                <Badge variant="indigo">
                  {batch.subject?.name || 'Subject'}
                </Badge>
              </div>

              <h3 className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                {batch.batch_name}
              </h3>

              {/* Class/Batch Meta Info Grid */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-50 text-sm">
                <div className="flex items-center gap-2.5 text-gray-600">
                  <Clock size={16} className="text-indigo-500 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Timings</p>
                    <p className="font-semibold text-gray-700">{formatTime(batch.start_time)} - {formatTime(batch.end_time)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-gray-600">
                  <CalendarIcon size={16} className="text-indigo-500 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Schedule</p>
                    <p className="font-semibold text-gray-700">{batch.days || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-gray-600">
                  <MapPin size={16} className="text-indigo-500 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Room</p>
                    <p className="font-semibold text-gray-700">{batch.room_number || 'TBD'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-gray-600">
                  <Tag size={16} className="text-indigo-500 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Fees</p>
                    <p className="font-semibold text-gray-700">₹{batch.fees?.toLocaleString() || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Teacher Info Card Block */}
              {batch.teacher && (
                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center gap-3 bg-slate-50/50 p-3 rounded-2xl">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm uppercase">
                    {batch.teacher.full_name?.split(' ').map(n => n[0]).join('') || 'T'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Instructor</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{batch.teacher.full_name}</p>
                  </div>
                  <a 
                    href={`mailto:${batch.teacher.email}`}
                    className="h-8 w-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                    title={`Email ${batch.teacher.full_name}`}
                  >
                    <Mail size={14} />
                  </a>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {enrolledBatches.length === 0 && (
        <Card className="bg-white p-12 text-center">
          <EmptyState
            icon={BookOpen}
            title="No Enrolled Courses"
            description="You are not currently enrolled in any courses or batches. Please contact the administrator to assign batches to you."
          />
        </Card>
      )}
    </div>
  );
}
