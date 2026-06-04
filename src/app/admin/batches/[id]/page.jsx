'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { batchesService } from '@/services/batches.service';
import { supabase } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import { 
  ArrowLeft, Edit, Trash2, Calendar, Clock, 
  Users, MapPin, User, BookOpen, IndianRupee, Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

export default function BatchManagePage() {
  const { id } = useParams();
  const router = useRouter();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  useEffect(() => {
    const fetchBatchAndStudents = async () => {
      try {
        setLoading(true);
        setStudentsLoading(true);
        
        const [batchData, enrollmentRes] = await Promise.all([
          batchesService.getById(id),
          supabase
            .from('student_batches')
            .select('student:students(*)')
            .eq('batch_id', id)
        ]);

        setBatch(batchData);
        
        if (enrollmentRes.error) throw enrollmentRes.error;
        setStudents(enrollmentRes.data?.filter(e => e.student).map(e => e.student) || []);
      } catch (error) {
        console.error('Failed to fetch batch details and students:', error);
        toast.error('Failed to load batch details');
        router.push('/admin/batches');
      } finally {
        setLoading(false);
        setStudentsLoading(false);
      }
    };
    
    if (id) {
      fetchBatchAndStudents();
    }
  }, [id, router]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this batch? This action cannot be undone.')) {
      try {
        await batchesService.delete(id);
        toast.success('Batch deleted successfully');
        router.push('/admin/batches');
      } catch (error) {
        console.error('Failed to delete batch:', error);
        toast.error('Failed to delete batch');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-gray-500 font-medium">Loading batch details...</p>
      </div>
    );
  }

  if (!batch) return null;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Link href="/admin/batches" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-2 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to Batches
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{batch.batch_name}</h1>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider border border-emerald-100">
              Active
            </span>
          </div>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <BookOpen size={16} className="text-gray-400" />
            Subject: <span className="font-medium text-gray-700">{batch.subject?.name || 'N/A'}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleDelete} className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200">
            <Trash2 size={18} /> Delete
          </Button>
          <Link href={`/admin/batches/edit/${batch.id}`}>
            <Button className="gap-2 shadow-lg shadow-indigo-200">
              <Edit size={18} /> Edit Batch
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Calendar size={120} />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-6">Batch Overview</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Assigned Teacher</p>
                  <p className="text-lg font-semibold text-gray-900">{batch.teacher?.full_name || 'Unassigned'}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Schedule</p>
                  <p className="text-lg font-semibold text-gray-900">{batch.start_time} - {batch.end_time}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Room Number</p>
                  <p className="text-lg font-semibold text-gray-900">{batch.room_number || 'TBD'}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <IndianRupee size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Monthly Fees</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(batch.fees)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Enrolled Students</h2>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">
                {students.length} Students
              </span>
            </div>
            
            {studentsLoading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-slate-500 text-sm font-medium">
                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600"></span>
                Loading enrolled students...
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No students enrolled yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto mt-2 text-sm">
                  Students assigned to this batch will appear here. You can manage their enrollments from the Students section.
                </p>
                <Button className="mt-6" variant="secondary" onClick={() => router.push('/admin/students')}>
                  Manage Students
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Class / Grade</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Parent Phone</th>
                      <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm uppercase">
                              {student.full_name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{student.full_name}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{student.student_code || 'No Code'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 font-medium">
                          {student.class_name || 'N/A'}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 font-medium">
                          {student.parent_phone || student.phone || 'N/A'}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right font-semibold">
                          <Link href={`/admin/students/${student.id}`}>
                            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all">
                              View Profile
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Stats & Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200">
            <h3 className="font-semibold text-indigo-100 mb-4">Capacity Status</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-bold">{students.length}</span>
              <span className="text-indigo-200 mb-1">/ {batch.capacity}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-indigo-900/40 rounded-full h-2 mt-4 mb-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(((students.length) / batch.capacity) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-indigo-200 text-right">
              {batch.capacity - students.length} seats remaining
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">Mark Attendance</span>
                <ArrowLeft size={16} className="text-gray-400 rotate-180 group-hover:text-indigo-600 transition-colors" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">View Assignments</span>
                <ArrowLeft size={16} className="text-gray-400 rotate-180 group-hover:text-indigo-600 transition-colors" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">Generate Report</span>
                <ArrowLeft size={16} className="text-gray-400 rotate-180 group-hover:text-indigo-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
