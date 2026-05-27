'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { teachersService } from '@/services/teachers.service';
import Button from '@/components/ui/Button';
import { ArrowLeft, Mail, Phone, GraduationCap, Award, Calendar, DollarSign, Edit, Shield, Info, IndianRupee, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ViewTeacherProfilePage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    async function loadTeacherAndAttendance() {
      try {
        setLoading(true);
        console.log(`[View Teacher Profile] Fetching teacher details for id: ${id}`);
        const teacherData = await teachersService.getById(id);
        
        if (!teacherData) {
          throw new Error('Teacher record not found');
        }
        setTeacher(teacherData);

        // Fetch attendance logs for this teacher
        const { data: attendanceData, error: attError } = await supabase
          .from('teacher_attendance')
          .select('*')
          .eq('teacher_id', id)
          .order('attendance_date', { ascending: false });

        if (attError) throw attError;
        setAttendance(attendanceData || []);

      } catch (err) {
        console.error('[View Teacher Profile] Failed to load profile/attendance:', err);
        toast.error('Failed to load teacher profile details.');
        router.push('/admin/teachers');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadTeacherAndAttendance();
    }
  }, [id, router]);

  // Calculate stats
  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === 'Present').length;
  const halfDays = attendance.filter(a => a.status === 'Half Day').length;
  const absentDays = attendance.filter(a => a.status === 'Absent').length;
  const leaveDays = attendance.filter(a => a.status === 'Leave').length;
  const lateDays = attendance.filter(a => a.status === 'Late').length;

  const attendanceRate = totalDays > 0 
    ? Math.round(((presentDays + (halfDays * 0.5)) / totalDays) * 100) 
    : 0;

  // Format attendance date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Half Day': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Late': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Leave': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-rose-50 text-rose-700 border-rose-100';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 font-medium text-sm">Loading profile details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/teachers" 
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-slate-50 transition-all group"
          >
            <ArrowLeft size={20} className="transform group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Teacher Profile</h1>
            <p className="text-slate-500 text-sm mt-0.5">Comprehensive view of qualifications, specialized context, and database metadata.</p>
          </div>
        </div>

        <Link href={`/admin/teachers/edit/${id}`}>
          <Button className="flex items-center gap-2">
            <Edit size={16} /> Edit Profile
          </Button>
        </Link>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column - Card Avatar Summary */}
        <div className="bg-white p-8 rounded-3xl premium-shadow border border-slate-100 flex flex-col items-center text-center space-y-6 relative overflow-hidden h-fit">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-violet-500 to-indigo-600"></div>
          
          <div className="h-24 w-24 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-3xl font-black uppercase">
            {teacher?.full_name?.charAt(0)}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">{teacher?.full_name}</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full mt-2">
              <Shield size={12} /> Faculty Member
            </div>
          </div>

          {/* Dynamic Attendance Percentage Ring */}
          <div className="w-full border-t border-slate-50 pt-4 flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Attendance Rate</span>
            <div className="relative flex items-center justify-center">
              <span className={`text-2xl font-black ${attendanceRate >= 85 ? 'text-emerald-600' : attendanceRate >= 75 ? 'text-amber-500' : 'text-rose-500'}`}>
                {attendanceRate}%
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1">Based on {totalDays} marked sessions</span>
          </div>

          <div className="w-full border-t border-slate-50 pt-4 space-y-3 text-left text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="text-slate-400 shrink-0" size={16} />
              <span className="truncate">{teacher?.email}</span>
            </div>
            {teacher?.phone && (
              <div className="flex items-center gap-3 text-slate-600">
                <Phone className="text-slate-400 shrink-0" size={16} />
                <span>{teacher?.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Comprehensive Professional & Attendance Reports */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Card Details */}
          <div className="bg-white p-8 rounded-3xl premium-shadow border border-slate-100 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-3 flex items-center gap-2">
              <Info size={18} className="text-indigo-600" /> Academic & Professional Info
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Qualification</p>
                <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <GraduationCap className="text-indigo-600 shrink-0" size={18} />
                  <span>{teacher?.qualification || 'Not specified'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Specialization</p>
                <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <Award className="text-indigo-600 shrink-0" size={18} />
                  <span>{teacher?.specialization || 'Not specified'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Experience (Years)</p>
                <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <Calendar className="text-indigo-600 shrink-0" size={18} />
                  <span>{teacher?.experience_years ?? 0} Years Experience</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Salary (Monthly)</p>
                <div className="flex items-center gap-2.5 text-emerald-700 font-extrabold text-sm bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/50">
                  <IndianRupee className="shrink-0" size={18} />
                  <span>{teacher?.salary?.toLocaleString() || '0'} INR</span>
                </div>
              </div>

            </div>
          </div>

          {/* Attendance Report & Analytics Section */}
          <div className="bg-white p-8 rounded-3xl premium-shadow border border-slate-100 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-3 flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600" /> Attendance Report & Logs
            </h3>

            {/* Attendance Stat Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-emerald-50/30 border border-emerald-100/50 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Present</span>
                <span className="text-xl font-black text-emerald-600">{presentDays}</span>
              </div>
              <div className="bg-amber-50/30 border border-amber-100/50 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Half Days</span>
                <span className="text-xl font-black text-amber-600">{halfDays}</span>
              </div>
              <div className="bg-orange-50/30 border border-orange-100/50 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Late</span>
                <span className="text-xl font-black text-orange-600">{lateDays}</span>
              </div>
              <div className="bg-rose-50/30 border border-rose-100/50 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Absent</span>
                <span className="text-xl font-black text-rose-600">{absentDays}</span>
              </div>
            </div>

            {/* Attendance Logs Table */}
            <div className="overflow-hidden border border-slate-100 rounded-2xl">
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 sticky top-0">
                      <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Date</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Check-In / Out</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium">
                    {attendance.length > 0 ? attendance.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-4 py-3 text-slate-700 font-bold">{formatDate(log.attendance_date)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-full border ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                          {log.check_in || '--:--'} / {log.check_out || '--:--'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs italic">
                          {log.remarks || 'No remarks'}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-slate-400">
                          No attendance records found for this teacher.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Database Administration Metadata */}
          <div className="bg-white p-8 rounded-3xl premium-shadow border border-slate-100 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield size={16} className="text-slate-400" /> Database Administration Metadata
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-500">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 break-all">
                <span className="font-bold text-slate-400 block mb-1">RECORD ID (UUID)</span>
                {teacher?.id}
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 break-all">
                <span className="font-bold text-slate-400 block mb-1">AUTH CORRESPONDENT ID</span>
                {teacher?.user_id || 'N/A'}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
