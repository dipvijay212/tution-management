'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { teacherAttendanceService } from '@/services/teacherAttendance.service';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';
import { 
  CheckCircle, 
  LogOut, 
  Clock, 
  Calendar as CalendarIcon,
  Loader2,
  CalendarCheck2,
  CalendarX2,
  Percent,
  BarChart3,
  Users,
  ArrowRight
} from 'lucide-react';

export default function TeacherAttendancePage() {
  const { profile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [teacherId, setTeacherId] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Student attendance integration
  const [activeTab, setActiveTab] = useState('my-attendance');
  const [teacherBatches, setTeacherBatches] = useState([]);
  const [studentCounts, setStudentCounts] = useState({});
  const [studentDate, setStudentDate] = useState(new Date().toISOString().split('T')[0]);
  
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

      const [todayData, historyData, batchesResult, studentCountsResult] = await Promise.all([
        teacherAttendanceService.getTodayAttendance(tId),
        teacherAttendanceService.getTeacherHistory(tId),
        supabase
          .from('batches')
          .select('id, batch_name, start_time, end_time, room_number, subject:subjects(name)')
          .eq('teacher_id', tId)
          .order('batch_name'),
        supabase
          .from('student_batches')
          .select('batch_id')
      ]);
      
      if (batchesResult.error) throw batchesResult.error;
      if (studentCountsResult.error) throw studentCountsResult.error;
      
      setTodayAttendance(todayData);
      setHistory(historyData);
      setTeacherBatches(batchesResult.data || []);
      
      const counts = {};
      if (studentCountsResult.data) {
        studentCountsResult.data.forEach(sb => {
          counts[sb.batch_id] = (counts[sb.batch_id] || 0) + 1;
        });
      }
      setStudentCounts(counts);
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
      {/* Header and Tab Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Attendance Center</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your daily check-in and mark student batch attendance.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50 self-end sm:self-center">
          <button
            onClick={() => setActiveTab('my-attendance')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'my-attendance'
                ? 'bg-[#0b0e14] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Attendance
          </button>
          <button
            onClick={() => setActiveTab('student-attendance')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'student-attendance'
                ? 'bg-[#0b0e14] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Attendance
          </button>
        </div>
      </div>

      {/* Tab 1: Teacher's own attendance */}
      {activeTab === 'my-attendance' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
      )}

      {/* Tab 2: Student Attendance */}
      {activeTab === 'student-attendance' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Mark Student Attendance</h2>
              <p className="text-gray-500 text-sm mt-0.5">Select a batch from your assigned learning classes below.</p>
            </div>
            
            {/* Elegant Glassmorphic Date Picker */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-2.5 rounded-2xl shadow-inner focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
              <CalendarIcon size={18} className="text-indigo-600 ml-1.5" />
              <input 
                type="date" 
                value={studentDate} 
                onChange={(e) => setStudentDate(e.target.value)}
                className="border-none focus:ring-0 text-sm font-bold text-gray-700 bg-transparent cursor-pointer"
              />
            </div>
          </div>

          {/* Batches Grid */}
          {teacherBatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teacherBatches.map(batch => {
                const count = studentCounts[batch.id] || 0;
                return (
                  <div key={batch.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <BarChart3 size={20} />
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-50 text-slate-400 border border-slate-100 uppercase tracking-wider">
                          Class {batch.room_number ? `Room ${batch.room_number}` : 'Active'}
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{batch.batch_name}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">{batch.subject?.name || 'No Subject'}</p>
                      
                      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 w-fit">
                        <Clock size={14} className="text-indigo-500" />
                        <span>{batch.start_time?.slice(0, 5)} - {batch.end_time?.slice(0, 5)}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <Users size={16} className="text-slate-400" />
                        <span>{count} Students</span>
                      </div>
                      <Link href={`/teacher/attendance/${batch.id}?date=${studentDate}`}>
                        <button className="flex items-center gap-1 font-bold text-indigo-600 hover:gap-2 hover:text-indigo-700 transition-all">
                          Mark Attendance <ArrowRight size={16} />
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
              <EmptyState
                icon={BarChart3}
                title="No Batches Assigned"
                description="There are currently no learning batches assigned to your teacher account. Contact the administrator to enroll you in a class batch."
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
