'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';
import { 
  Loader2, 
  BookOpen, 
  Clock, 
  Users, 
  MapPin, 
  Calendar as CalendarIcon,
  Tag,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherClassesPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    if (profile) {
      fetchClasses();
    }
  }, [profile]);

  const fetchClasses = async () => {
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

      // 2. Fetch assigned batches
      const { data: batchesData, error: batchesError } = await supabase
        .from('batches')
        .select('*, subject:subjects(name)')
        .eq('teacher_id', tId);

      if (batchesError) throw batchesError;

      if (batchesData && batchesData.length > 0) {
        setClasses(batchesData);
      } else {
        setClasses([]);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      toast.error('Failed to load classes.');
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Classes & Batches</h1>
          <p className="text-gray-500 text-sm mt-1">View your assigned teaching schedules, subjects, and batch details.</p>
        </div>
        <Link href="/teacher/classes/add">
          <Button className="gap-2 shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700">
            <Plus size={18} /> Create New Batch
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.map((cls) => (
          <Card key={cls.id} className="p-6 overflow-hidden relative hover:shadow-md transition-all group border-indigo-50/50">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-105 transition-transform">
                <BookOpen size={22} />
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 tracking-wide uppercase">
                {cls.subject?.name || 'Subject'}
              </span>
            </div>

            <h3 className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
              {cls.batch_name}
            </h3>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-50 text-sm">
              <div className="flex items-center gap-2.5 text-gray-600">
                <Clock size={16} className="text-indigo-500" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Timings</p>
                  <p className="font-semibold">{formatTime(cls.start_time)} - {formatTime(cls.end_time)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-gray-600">
                <CalendarIcon size={16} className="text-indigo-500" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Days</p>
                  <p className="font-semibold">{cls.days || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-gray-600">
                <MapPin size={16} className="text-indigo-500" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Room</p>
                  <p className="font-semibold">{cls.room_number || 'TBD'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-gray-600">
                <Users size={16} className="text-indigo-500" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Students Limit</p>
                  <p className="font-semibold">{cls.capacity ? `${cls.capacity} Seats` : 'Unlimited'}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center">
          <EmptyState
            icon={BookOpen}
            title="No Assigned Batches"
            description="You are not assigned as a primary teacher for any batches yet."
          />
        </div>
      )}
    </div>
  );
}
