'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabaseHelpers } from '@/lib/supabase/client';
import { Calendar as CalendarIcon, Users, ArrowRight, BarChart3 } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

export default function AttendanceOverviewPage() {
  const [batches, setBatches] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const data = await supabaseHelpers.getAll('batches', { orderBy: 'batch_name' });
        setBatches(data);
      } catch (error) {
        console.error('Failed to fetch batches');
        // Mock fallback
        setBatches([
          { id: '1', name: 'Grade 10 Maths - Morning', subject: 'Mathematics', student_count: 24 },
          { id: '2', name: 'Grade 12 Physics - Evening', subject: 'Physics', student_count: 18 },
          { id: '3', name: 'Foundation Science', subject: 'Science', student_count: 32 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-500 text-sm mt-1">Select a batch to mark or view attendance.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
           <CalendarIcon size={18} className="ml-2 text-indigo-600" />
           <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-none focus:ring-0 text-sm font-bold text-gray-700 bg-transparent cursor-pointer"
           />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Average Attendance</p>
           <p className="text-3xl font-black text-emerald-600 mt-2">88.5%</p>
           <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 font-medium">
              <span className="text-emerald-600">+2.4%</span> from last week
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Marked Today</p>
           <p className="text-3xl font-black text-indigo-600 mt-2">2 / 8 Batches</p>
           <div className="w-full bg-gray-100 h-1.5 rounded-full mt-5 overflow-hidden">
              <div className="bg-indigo-600 h-full w-[25%] transition-all" />
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending Reports</p>
           <p className="text-3xl font-black text-amber-600 mt-2">6</p>
           <p className="mt-4 text-xs text-gray-500 font-medium">Requires attention today</p>
        </div>
      </div>

      {/* Batch List for Attendance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map(batch => (
          <div key={batch.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BarChart3 size={20} />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 border border-slate-100">
                PENDING
              </span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{batch.batch_name}</h3>
            <p className="text-xs text-gray-500 font-medium uppercase mt-1">{batch.subject?.name || batch.subject}</p>
            
            <div className="mt-6 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Users size={16} />
                <span>{batch.student_count} Students</span>
              </div>
              <Link href={`/admin/attendance/${batch.id}?date=${selectedDate}`}>
                <button className="flex items-center gap-1 font-bold text-indigo-600 hover:gap-2 transition-all">
                  Mark <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
