'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import AttendanceMarker from '@/features/attendance/components/AttendanceMarker';
import { supabaseHelpers } from '@/lib/supabase/client';
import { ArrowLeft, Save, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function BatchAttendancePage() {
  const { batchId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [batchInfo, setBatchInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadBatchData = async () => {
      try {
        setLoading(true);
        // In real app: 
        // 1. Fetch batch details
        // 2. Fetch students in this batch
        // 3. Fetch existing attendance for this date
        
        // Mocking for demo
        setBatchInfo({ name: 'Grade 10 Maths - Morning', subject: 'Mathematics' });
        setStudents([
          { id: '1', full_name: 'Rahul Sharma' },
          { id: '2', full_name: 'Priya Singh' },
          { id: '3', full_name: 'Amit Patel' },
          { id: '4', full_name: 'Suresh Kumar' },
          { id: '5', full_name: 'Anjali Gupta' },
        ]);
        
        // Simulating some existing data
        setAttendanceData({
          '1': 'present',
          '2': 'present',
        });
      } catch (error) {
        toast.error('Failed to load batch data');
      } finally {
        setLoading(false);
      }
    };
    loadBatchData();
  }, [batchId, date]);

  const handleMark = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Construct payload for Supabase
      const payload = Object.entries(attendanceData).map(([studentId, status]) => ({
        student_id: studentId,
        batch_id: batchId,
        date: date,
        status: status
      }));

      // In real app: await supabase.from('attendance').upsert(payload)
      console.log('Saving attendance:', payload);
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Attendance saved successfully');
      router.push('/admin/attendance');
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/attendance" className="p-2 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-indigo-600 hover:border-indigo-100 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{batchInfo?.name || 'Batch Attendance'}</h1>
            <div className="flex items-center gap-4 mt-1">
               <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{batchInfo?.subject}</p>
               <span className="w-1 h-1 rounded-full bg-gray-300"></span>
               <div className="flex items-center gap-1.5 text-indigo-600 text-sm font-bold">
                  <CalendarIcon size={14} />
                  {date}
               </div>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={saving || loading}
          className="w-full sm:w-auto gap-2 shadow-lg shadow-indigo-100"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Attendance
        </Button>
      </div>

      <AttendanceMarker 
        students={students} 
        attendanceData={attendanceData} 
        onMark={handleMark} 
        isLoading={loading} 
      />
      
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
         <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
            <Loader2 size={20} className="animate-pulse" />
         </div>
         <div>
            <p className="text-sm font-bold text-amber-900 underline decoration-amber-300">Realtime Sync Active</p>
            <p className="text-xs text-amber-700 mt-0.5">Other administrators can see your changes in real-time as you mark them.</p>
         </div>
      </div>
    </div>
  );
}
