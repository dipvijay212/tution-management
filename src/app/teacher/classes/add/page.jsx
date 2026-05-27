'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  ArrowLeft, 
  Loader2, 
  LayoutGrid, 
  Book, 
  Clock, 
  IndianRupee, 
  MapPin, 
  Users,
  Calendar as CalendarIcon
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function TeacherAddBatchPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [teacherId, setTeacherId] = useState(null);
  const [subjects, setSubjects] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    batch_name: '',
    subject_id: '',
    start_time: '',
    end_time: '',
    room_number: '',
    capacity: '30',
    fees: '1500',
    days: 'Mon, Wed, Fri'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile) {
      loadInitialData();
    }
  }, [profile]);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      
      // 1. Fetch teacher record
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (teacherError) throw teacherError;
      
      if (!teacherData) {
        toast.error('Could not find teacher profile');
        router.push('/teacher/classes');
        return;
      }
      
      setTeacherId(teacherData.id);

      // 2. Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true });

      if (subjectsError) throw subjectsError;
      setSubjects(subjectsData || []);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      toast.error('Failed to load subjects list');
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.batch_name.trim()) newErrors.batch_name = 'Batch name is required';
    if (!formData.subject_id) newErrors.subject_id = 'Subject is required';
    if (!formData.start_time) newErrors.start_time = 'Start time is required';
    if (!formData.end_time) newErrors.end_time = 'End time is required';
    if (!formData.room_number.trim()) newErrors.room_number = 'Room number is required';
    if (!formData.capacity || parseInt(formData.capacity) <= 0) newErrors.capacity = 'Valid capacity is required';
    if (!formData.fees || parseFloat(formData.fees) < 0) newErrors.fees = 'Valid fees is required';
    if (!formData.days.trim()) newErrors.days = 'Days scheduled (e.g. Mon, Wed) are required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!teacherId) return toast.error('Teacher profile not fully loaded yet');

    try {
      setLoading(true);
      const payload = {
        batch_name: formData.batch_name.trim(),
        teacher_id: teacherId, // Bound directly to this logged-in teacher!
        subject_id: formData.subject_id,
        start_time: formData.start_time,
        end_time: formData.end_time,
        room_number: formData.room_number.trim(),
        capacity: parseInt(formData.capacity, 10),
        fees: parseFloat(formData.fees),
        days: formData.days.trim()
      };

      const { data, error } = await supabase
        .from('batches')
        .insert([payload])
        .select();

      if (error) throw error;

      toast.success('Batch created successfully!');
      router.push('/teacher/classes');
    } catch (error) {
      console.error('Error creating batch:', error);
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
        <Link href="/teacher/classes" className="p-2 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-indigo-600 hover:border-indigo-100 transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create My Batch</h1>
          <p className="text-gray-500 text-sm mt-0.5">Schedule, name, and configure a new class under your instruction.</p>
        </div>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Batch Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">Batch Name</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <LayoutGrid size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="batch_name"
                  value={formData.batch_name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                  placeholder="Grade 10 Mathematics - Morning Batch"
                />
              </div>
              {errors.batch_name && <p className="mt-1 text-xs text-red-500 font-medium">{errors.batch_name}</p>}
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Subject</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Book size={18} className="text-gray-400" />
                </div>
                <select
                  name="subject_id"
                  value={formData.subject_id}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium appearance-none"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {errors.subject_id && <p className="mt-1 text-xs text-red-500 font-medium">{errors.subject_id}</p>}
            </div>

            {/* Scheduled Days */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Scheduled Days</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <CalendarIcon size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="days"
                  value={formData.days}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                  placeholder="Mon, Wed, Fri"
                />
              </div>
              {errors.days && <p className="mt-1 text-xs text-red-500 font-medium">{errors.days}</p>}
            </div>

            {/* Time Slots */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Start Time</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Clock size={18} className="text-gray-400" />
                </div>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                />
              </div>
              {errors.start_time && <p className="mt-1 text-xs text-red-500 font-medium">{errors.start_time}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">End Time</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Clock size={18} className="text-gray-400" />
                </div>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                />
              </div>
              {errors.end_time && <p className="mt-1 text-xs text-red-500 font-medium">{errors.end_time}</p>}
            </div>

            {/* Room & Capacity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Room Number</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <MapPin size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                  placeholder="Room 203"
                />
              </div>
              {errors.room_number && <p className="mt-1 text-xs text-red-500 font-medium">{errors.room_number}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Capacity (Students)</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Users size={18} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                  placeholder="30"
                />
              </div>
              {errors.capacity && <p className="mt-1 text-xs text-red-500 font-medium">{errors.capacity}</p>}
            </div>

            {/* Fees */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Monthly Fees (INR)</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <IndianRupee size={18} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  name="fees"
                  value={formData.fees}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                  placeholder="1500"
                />
              </div>
              {errors.fees && <p className="mt-1 text-xs text-red-500 font-medium">{errors.fees}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-100">
            <Link href="/teacher/classes">
              <Button variant="ghost" type="button" disabled={loading}>Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading} className="px-10 bg-indigo-600 hover:bg-indigo-700">
              {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
              Create Batch
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
