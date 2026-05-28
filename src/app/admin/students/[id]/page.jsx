'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { studentsService } from '@/services/students.service';
import Button from '@/components/ui/Button';
import { ArrowLeft, User, Mail, Phone, Calendar, Hash, Home, Shield, Info, Edit, Heart, Award, CheckCircle2, XCircle, AlertCircle, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

export default function ViewStudentProfilePage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [fees, setFees] = useState([]);

  useEffect(() => {
    async function loadStudentAndAttendance() {
      try {
        setLoading(true);
        console.log(`[View Student Profile] Fetching student details for id: ${id}`);
        const studentData = await studentsService.getById(id);
        
        if (!studentData) {
          throw new Error('Student record not found');
        }
        setStudent(studentData);

        // Fetch student attendance logs, joining batches to get the batch name
        const { data: attendanceData, error: attError } = await supabase
          .from('attendance')
          .select('*, batches(batch_name)')
          .eq('student_id', id)
          .order('attendance_date', { ascending: false });

        if (attError) throw attError;
        setAttendance(attendanceData || []);

        // Fetch student fees history
        const { data: feesData, error: feesError } = await supabase
          .from('fees')
          .select('*')
          .eq('student_id', id)
          .order('created_at', { ascending: false });

        if (feesError) throw feesError;
        setFees(feesData || []);

      } catch (err) {
        console.error('[View Student Profile] Failed to load student/attendance:', err);
        toast.error('Failed to load student profile details.');
        router.push('/admin/students');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadStudentAndAttendance();
    }
  }, [id, router]);

  // Calculate statistics
  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === 'Present').length;
  const lateDays = attendance.filter(a => a.status === 'Late').length;
  const leaveDays = attendance.filter(a => a.status === 'Leave').length;
  const absentDays = attendance.filter(a => a.status === 'Absent').length;

  const attendanceRate = totalDays > 0 
    ? Math.round(((presentDays + (lateDays * 0.75) + (leaveDays * 0.5)) / totalDays) * 100)
    : 0;

  // Calculate fees statistics
  const totalFees = fees.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
  const paidFees = fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);
  const pendingFees = fees.filter(f => f.status === 'Pending' || f.status === 'Partial').reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);

  // Format date of birth beautifully
  const formatBirthDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Format attendance date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Late': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Leave': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-rose-50 text-rose-700 border-rose-100';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 font-medium text-sm">Loading student profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/students" 
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-slate-50 transition-all group"
          >
            <ArrowLeft size={20} className="transform group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Profile</h1>
            <p className="text-slate-500 text-sm mt-0.5">Comprehensive view of academic context, enrollment details, and parent contact.</p>
          </div>
        </div>

        <Link href={`/admin/students/edit/${id}`}>
          <Button className="flex items-center gap-2">
            <Edit size={16} /> Edit Profile
          </Button>
        </Link>
      </div>

      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column - Card Avatar Summary */}
        <div className="bg-white p-8 rounded-3xl premium-shadow border border-slate-100 flex flex-col items-center text-center space-y-6 relative overflow-hidden h-fit">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 to-violet-600"></div>
          
          <div className="h-24 w-24 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-3xl font-black uppercase">
            {student?.full_name?.charAt(0)}
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">{student?.full_name}</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full mt-2">
              <Hash size={12} /> CODE: {student?.student_code || 'N/A'}
            </div>
          </div>

          {/* Dynamic Attendance Percentage Pill */}
          <div className="w-full border-t border-slate-50 pt-4 flex flex-col items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Attendance Rate</span>
            <div className="relative flex items-center justify-center">
              <span className={`text-2xl font-black ${attendanceRate >= 85 ? 'text-emerald-600' : attendanceRate >= 75 ? 'text-amber-500' : 'text-rose-500'}`}>
                {attendanceRate}%
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1">Based on {totalDays} total class days</span>
          </div>

          <div className="w-full border-t border-slate-50 pt-4 space-y-3.5 text-left text-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="text-slate-400 shrink-0" size={16} />
              <span className="truncate">{student?.email || 'No email registered'}</span>
            </div>
            {student?.phone && (
              <div className="flex items-center gap-3 text-slate-600">
                <Phone className="text-slate-400 shrink-0" size={16} />
                <span>{student?.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Comprehensive Academic, Parent & Attendance Reports */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Card Academic Details */}
          <div className="bg-white p-8 rounded-3xl premium-shadow border border-slate-100 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-3 flex items-center gap-2">
              <Award size={18} className="text-indigo-600" /> Academic Context
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Class / Grade</p>
                <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <Shield className="text-indigo-600 shrink-0" size={18} />
                  <span>{student?.class_name || 'Not specified'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">School</p>
                <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <Info className="text-indigo-600 shrink-0" size={18} />
                  <span>{student?.school_name || 'Not specified'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gender</p>
                <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <User className="text-indigo-600 shrink-0" size={18} />
                  <span>{student?.gender || 'Not specified'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date of Birth</p>
                <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <Calendar className="text-indigo-600 shrink-0" size={18} />
                  <span>{formatBirthDate(student?.date_of_birth)}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Attendance Report & Logs Section */}
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Late</span>
                <span className="text-xl font-black text-amber-600">{lateDays}</span>
              </div>
              <div className="bg-blue-50/30 border border-blue-100/50 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Leave</span>
                <span className="text-xl font-black text-blue-600">{leaveDays}</span>
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
                      <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Batch / Class</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium">
                    {attendance.length > 0 ? attendance.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-4 py-3 text-slate-700 font-bold">{formatDate(log.attendance_date)}</td>
                        <td className="px-4 py-3 text-slate-500 font-bold text-xs">
                          {log.batches?.batch_name || 'Individual Session / N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-full border ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs italic">
                          {log.remarks || 'No remarks'}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-slate-400">
                          No attendance logs recorded for this student.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Fees Summary & Logs Section */}
          <div className="bg-white p-8 rounded-3xl premium-shadow border border-slate-100 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-3 flex items-center gap-2">
              <IndianRupee size={18} className="text-emerald-600" /> Fees Invoice & Payments Report
            </h3>

            {/* Fees Stat Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between shadow-inner">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Allocated Fees</span>
                <span className="text-lg font-black text-slate-700 mt-1">{formatCurrency(totalFees)}</span>
              </div>
              <div className="bg-emerald-50/40 border border-emerald-100/50 p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Total Paid Fees</span>
                <span className="text-lg font-black text-emerald-600 mt-1">{formatCurrency(paidFees)}</span>
              </div>
              <div className="bg-rose-50/40 border border-rose-100/50 p-4 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Total Pending / Partial</span>
                <span className="text-lg font-black text-rose-600 mt-1">{formatCurrency(pendingFees)}</span>
              </div>
            </div>

            {/* Fees Logs Table */}
            <div className="overflow-hidden border border-slate-100 rounded-2xl">
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 sticky top-0">
                      <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Due Date</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Amount</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Method / Txn ID</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Payment Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium">
                    {fees.length > 0 ? fees.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-4 py-3 text-slate-700 font-bold">{formatDate(invoice.due_date)}</td>
                        <td className="px-4 py-3 text-slate-900 font-bold">{formatCurrency(invoice.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                            invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            invoice.status === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {invoice.payment_method ? (
                            <span>{invoice.payment_method} {invoice.transaction_id ? `(${invoice.transaction_id})` : ''}</span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {invoice.payment_date ? formatDate(invoice.payment_date) : '-'}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                          No fee records generated for this student.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Parent & Contact Information */}
          <div className="bg-white p-8 rounded-3xl premium-shadow border border-slate-100 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-3 flex items-center gap-2">
              <Heart size={18} className="text-rose-500" /> Parent / Guardian & Home Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Parent Name</p>
                <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <User className="text-rose-500 shrink-0" size={18} />
                  <span>{student?.parent_name || 'Not specified'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Parent Phone</p>
                <div className="flex items-center gap-2.5 text-slate-700 font-bold text-sm bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <Phone className="text-rose-500 shrink-0" size={18} />
                  <span>{student?.parent_phone || 'Not specified'}</span>
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Residential Address</p>
                <div className="flex items-start gap-2.5 text-slate-700 font-medium text-sm bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <Home className="text-indigo-600 shrink-0 mt-0.5" size={18} />
                  <span>{student?.address || 'No address registered'}</span>
                </div>
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
                {student?.id}
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 break-all">
                <span className="font-bold text-slate-400 block mb-1">AUTH CORRESPONDENT ID</span>
                {student?.user_id || 'N/A'}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
