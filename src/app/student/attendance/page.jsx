'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { 
  Loader2, 
  ClipboardCheck, 
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentAttendancePage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    rate: 0
  });

  useEffect(() => {
    if (profile) {
      fetchAttendance();
    }
  }, [profile]);

  const fetchAttendance = async () => {
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
        setAttendanceRecords([]);
        return;
      }

      // 2. Fetch attendance history
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          id,
          attendance_date,
          status,
          remarks,
          batch:batches(
            batch_name
          )
        `)
        .eq('student_id', studentData.id)
        .order('attendance_date', { ascending: false });

      if (error) throw error;
      setAttendanceRecords(data || []);

      // 3. Compute stats
      if (data && data.length > 0) {
        let p = 0, a = 0, l = 0, le = 0;
        data.forEach(rec => {
          const statusLower = rec.status?.toLowerCase();
          if (statusLower === 'present') p++;
          else if (statusLower === 'absent') a++;
          else if (statusLower === 'late') l++;
          else if (statusLower === 'leave') le++;
        });
        const total = data.length;
        const rate = Math.round(((p + l * 0.5 + le) / total) * 100);
        setStats({ present: p, absent: a, late: l, leave: le, rate });
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      toast.error('Failed to load attendance history.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return <Badge variant="emerald">Present</Badge>;
      case 'absent':
        return <Badge variant="rose">Absent</Badge>;
      case 'late':
        return <Badge variant="amber">Late</Badge>;
      case 'leave':
        return <Badge variant="violet">Leave</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-rose-500" />;
      case 'late':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'leave':
        return <Info className="h-5 w-5 text-indigo-500" />;
      default:
        return null;
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
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Attendance Tracking</h1>
        <p className="text-gray-500 text-sm">Review your marked daily attendance percentage, statistics, and monthly calendar logs.</p>
      </div>

      {attendanceRecords.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-6 md:col-span-2 flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-0 shadow-lg shadow-indigo-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-100">Overall Attendance</h3>
            <p className="text-6xl font-black mt-2">{stats.rate}%</p>
            <div className="mt-4 w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${stats.rate}%` }}></div>
            </div>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 md:col-span-3 gap-4">
            <Card className="p-4 flex flex-col justify-between hover:shadow-sm">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wide">Present</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-black text-emerald-600">{stats.present}</span>
                <CheckCircle className="h-6 w-6 text-emerald-100" />
              </div>
            </Card>

            <Card className="p-4 flex flex-col justify-between hover:shadow-sm">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wide">Absent</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-black text-rose-600">{stats.absent}</span>
                <XCircle className="h-6 w-6 text-rose-100" />
              </div>
            </Card>

            <Card className="p-4 flex flex-col justify-between hover:shadow-sm">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wide">Late</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-black text-amber-600">{stats.late}</span>
                <AlertTriangle className="h-6 w-6 text-amber-100" />
              </div>
            </Card>

            <Card className="p-4 flex flex-col justify-between hover:shadow-sm">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wide">Leave</span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-black text-violet-600">{stats.leave}</span>
                <Info className="h-6 w-6 text-violet-100" />
              </div>
            </Card>
          </div>
        </div>
      )}

      {attendanceRecords.length > 0 ? (
        <Card className="overflow-hidden">
          <CardHeader>
            <h3 className="text-lg font-black text-gray-900">Attendance History</h3>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-gray-400 font-bold border-b border-gray-100">
                  <th className="py-4 px-6 uppercase tracking-wider text-xs">Date</th>
                  <th className="py-4 px-6 uppercase tracking-wider text-xs">Batch</th>
                  <th className="py-4 px-6 uppercase tracking-wider text-xs">Status</th>
                  <th className="py-4 px-6 uppercase tracking-wider text-xs">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {attendanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-700 flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-indigo-500" />
                      {new Date(record.attendance_date).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-800">
                      {record.batch?.batch_name || 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(record.status)}
                        {getStatusBadge(record.status)}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-500 italic max-w-xs truncate">
                      {record.remarks || 'No remarks'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="bg-white p-12 text-center">
          <EmptyState
            icon={ClipboardCheck}
            title="No Attendance Logs"
            description="There are currently no attendance logs recorded for your account. Once your instructor marks attendance, it will show up here."
          />
        </Card>
      )}
    </div>
  );
}
