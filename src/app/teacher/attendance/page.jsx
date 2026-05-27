'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { teacherAttendanceService } from '@/services/teacherAttendance.service';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { 
  CheckCircle, 
  LogOut, 
  Clock, 
  Calendar as CalendarIcon,
  Loader2,
  CalendarCheck2,
  CalendarX2,
  Percent
} from 'lucide-react';

export default function TeacherAttendancePage() {
  const { profile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [teacherId, setTeacherId] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Calculate stats
  const totalDays = history.length;
  const presentDays = history.filter(h => h.status === 'Present').length;
  const absentDays = history.filter(h => h.status === 'Absent').length;
  const percentage = totalDays ? Math.round((presentDays / totalDays) * 100) : 0;

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Query teachers by user_id
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', profile.id)
        .maybeSingle();
        
      if (teacherError) throw teacherError;
      
      // Fallback to profile.id if teacher record not found (to handle cases where profile.id is the teacher_id)
      const tId = teacherData?.id || profile.id;
      setTeacherId(tId);

      const [todayData, historyData] = await Promise.all([
        teacherAttendanceService.getTodayAttendance(tId),
        teacherAttendanceService.getTeacherHistory(tId)
      ]);
      
      setTodayAttendance(todayData);
      setHistory(historyData);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!teacherId) return toast.error('Teacher ID not found');
    
    try {
      setActionLoading(true);
      const now = new Date();
      const payload = {
        teacher_id: teacherId,
        attendance_date: now.toLocaleDateString('en-CA'),
        status: 'Present',
        check_in: now.toLocaleTimeString('en-GB'), // 24hr format HH:mm:ss
        marked_by: profile.id
      };
      
      const newAttendance = await teacherAttendanceService.markAttendance(payload);
      setTodayAttendance(newAttendance);
      setHistory([newAttendance, ...history]);
      toast.success('Checked in successfully!');
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('Failed to check in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance?.id) return;
    
    try {
      setActionLoading(true);
      const checkOutTime = new Date().toLocaleTimeString('en-GB');
      
      const updatedAttendance = await teacherAttendanceService.checkOut(todayAttendance.id, checkOutTime);
      setTodayAttendance(updatedAttendance);
      
      setHistory(history.map(h => h.id === updatedAttendance.id ? updatedAttendance : h));
      toast.success('Checked out successfully!');
    } catch (error) {
      console.error('Check-out error:', error);
      toast.error('Failed to check out');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const hasCheckedIn = !!todayAttendance;
  const hasCheckedOut = hasCheckedIn && !!todayAttendance.check_out;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your daily check-in and check-out</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <CalendarIcon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Days</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalDays}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <CalendarCheck2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Present Days</p>
              <h3 className="text-2xl font-bold text-gray-900">{presentDays}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <CalendarX2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Absent Days</p>
              <h3 className="text-2xl font-bold text-gray-900">{absentDays}</h3>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Percent size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Attendance %</p>
              <h3 className="text-2xl font-bold text-gray-900">{percentage}%</h3>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 md:p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Today&apos;s Status</h2>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-gray-600">
                <CalendarIcon size={16} />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Status:</span>
                {hasCheckedIn ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Present
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Not Marked
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 bg-white/50 backdrop-blur p-4 rounded-2xl border border-gray-100 shadow-sm">
            {!hasCheckedIn ? (
              <Button 
                onClick={handleCheckIn} 
                disabled={actionLoading}
                className="w-full sm:w-auto flex-1 whitespace-nowrap bg-indigo-600 hover:bg-indigo-700"
              >
                {actionLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : <CheckCircle size={18} className="mr-2" />}
                Check In Now
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} />
                    <span>In: {todayAttendance.check_in}</span>
                  </div>
                  {hasCheckedOut && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} />
                      <span>Out: {todayAttendance.check_out}</span>
                    </div>
                  )}
                </div>
                
                {!hasCheckedOut ? (
                  <Button 
                    onClick={handleCheckOut} 
                    disabled={actionLoading}
                    variant="outline"
                    className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    {actionLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : <LogOut size={18} className="mr-2" />}
                    Check Out
                  </Button>
                ) : (
                  <div className="text-center text-sm font-medium text-green-600 bg-green-50 px-4 py-2 rounded-xl">
                    Attendance Completed
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Attendance History</h2>
        </div>
        
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm">
                  <th className="py-4 px-6 font-semibold text-gray-600">Date</th>
                  <th className="py-4 px-6 font-semibold text-gray-600">Status</th>
                  <th className="py-4 px-6 font-semibold text-gray-600">Check In</th>
                  <th className="py-4 px-6 font-semibold text-gray-600">Check Out</th>
                  <th className="py-4 px-6 font-semibold text-gray-600">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                      {new Date(record.attendance_date).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'Present' ? 'bg-green-100 text-green-800' :
                        record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                        record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {record.check_in || '-'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {record.check_out || '-'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {record.remarks || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={CalendarIcon}
              title="No History Found"
              description="You haven't marked any attendance yet."
            />
          </div>
        )}
      </Card>
    </div>
  );
}
