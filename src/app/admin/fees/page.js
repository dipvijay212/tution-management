'use client';

import React, { useState, useEffect } from 'react';
import FeeTable from '@/features/fees/components/FeeTable';
import { supabaseHelpers } from '@/lib/supabase/client';
import { 
  IndianRupee, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Plus, 
  Filter,
  PieChart
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function FeesOverviewPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        setLoading(true);
        // In real app: fetch from Supabase
        // const data = await supabaseHelpers.getAll('fees', { orderBy: 'due_date' });
        
        // Mock data
        setRecords([
          { id: '1', student_name: 'Rahul Sharma', batch_name: 'Grade 10 Maths', month: 'May', year: '2024', total_amount: 2500, paid_amount: 2500, status: 'paid', due_date: '2024-05-05' },
          { id: '2', student_name: 'Priya Singh', batch_name: 'Grade 12 Physics', month: 'May', year: '2024', total_amount: 3000, paid_amount: 1500, status: 'partial', due_date: '2024-05-10' },
          { id: '3', student_name: 'Amit Patel', batch_name: 'Grade 10 Maths', month: 'May', year: '2024', total_amount: 2500, paid_amount: 0, status: 'pending', due_date: '2024-05-05' },
          { id: '4', student_name: 'Suresh Kumar', batch_name: 'Foundation Science', month: 'May', year: '2024', total_amount: 1500, paid_amount: 1500, status: 'paid', due_date: '2024-05-07' },
        ]);
      } catch (error) {
        console.error('Failed to fetch fees');
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fees Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track student payments, invoices, and financial health.</p>
        </div>
        <Link href="/admin/fees/record">
          <Button className="gap-2 shadow-lg shadow-emerald-100 bg-emerald-600 hover:bg-emerald-700">
            <Plus size={18} /> Record Payment
          </Button>
        </Link>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <div className="flex justify-between items-start">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                 <IndianRupee size={20} />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                 <ArrowUpRight size={14} /> 12%
              </span>
           </div>
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">Collected Fees</p>
           <p className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(65400)}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <div className="flex justify-between items-start">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                 <IndianRupee size={20} />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-rose-600">
                 <ArrowDownRight size={14} /> 5%
              </span>
           </div>
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">Outstanding</p>
           <p className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(12500)}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <div className="flex justify-between items-start">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                 <PieChart size={20} />
              </div>
           </div>
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">Collection Rate</p>
           <p className="text-2xl font-black text-gray-900 mt-1">84%</p>
           <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-indigo-600 h-full w-[84%]" />
           </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
           <div className="flex justify-between items-start">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                 <Plus size={20} />
              </div>
           </div>
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">Projected (May)</p>
           <p className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(77900)}</p>
        </div>
      </div>

      {/* Toolbar & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by student or batch..." 
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
          />
        </div>
        <div className="flex gap-2">
           <select className="text-sm border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:ring-indigo-500">
              <option>May 2024</option>
              <option>April 2024</option>
           </select>
          <Button variant="secondary" className="gap-2">
            <Filter size={18} /> Filters
          </Button>
        </div>
      </div>

      {/* Fee Table */}
      <FeeTable records={records} isLoading={loading} />
    </div>
  );
}
