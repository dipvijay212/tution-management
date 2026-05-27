'use client';

import React, { useState, useEffect } from 'react';
import FeeTable from '@/features/fees/components/FeeTable';
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
import { feesService } from '@/services/fees.service';
import toast from 'react-hot-toast';

export default function FeesOverviewPage() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('All');

  const fetchFees = async () => {
    try {
      setLoading(true);
      console.log('[Fees Overview] Querying live database for fee payments...');
      const data = await feesService.getAllRecords();
      setRecords(data || []);
      setFilteredRecords(data || []);
    } catch (error) {
      console.error('[Fees Overview] Failed to fetch fees:', error);
      toast.error('Failed to load live fee records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  // Filter & Search Records
  useEffect(() => {
    let result = records;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.student?.full_name?.toLowerCase().includes(query) ||
        r.batch?.batch_name?.toLowerCase().includes(query) ||
        r.transaction_id?.toLowerCase().includes(query) ||
        r.payment_method?.toLowerCase().includes(query)
      );
    }

    if (filterMonth !== 'All') {
      result = result.filter(r => {
        if (!r.due_date) return false;
        const date = new Date(r.due_date);
        const monthYearStr = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        return monthYearStr.includes(filterMonth);
      });
    }

    setFilteredRecords(result);
  }, [searchQuery, filterMonth, records]);

  // Handle record deletion
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment record? This action cannot be undone.')) {
      return;
    }

    try {
      console.log(`[Fees Overview] Deleting fee record ID: ${id}`);
      await feesService.deleteRecord(id);
      toast.success('Fee record deleted successfully!');
      
      // Optimistic state update
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('[Fees Overview] Delete error:', err);
      toast.error('Failed to delete fee record.');
    }
  };

  // Dynamic Metrics Calculations
  const totalCollected = records.reduce((sum, r) => sum + (Number(r.paid_amount) || 0), 0);

  const outstandingFees = records.reduce((sum, r) => sum + (Math.max(0, Number(r.total_amount) - Number(r.paid_amount)) || 0), 0);
  
  // Total projected = All total_amounts expected
  const totalProjected = records.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0);
  
  // Collection rate = (Total Collected / Total Projected) * 100
  const collectionRate = totalProjected > 0 
    ? Math.round((totalCollected / totalProjected) * 100) 
    : 100;

  // Extract unique month options from records for filter
  const monthOptions = Array.from(
    new Set(
      records
        .map(r => {
          if (!r.due_date) return null;
          const date = new Date(r.due_date);
          return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        })
        .filter(Boolean)
    )
  );

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
        {/* Collected Fees Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
           <div className="flex justify-between items-start">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                 <IndianRupee size={20} />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                 <ArrowUpRight size={14} /> Collected
              </span>
           </div>
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">Collected Fees</p>
           <p className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(totalCollected)}</p>
        </div>

        {/* Outstanding Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500"></div>
           <div className="flex justify-between items-start">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                 <IndianRupee size={20} />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-rose-600">
                 <ArrowDownRight size={14} /> Outstanding
              </span>
           </div>
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">Outstanding (Pending)</p>
           <p className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(outstandingFees)}</p>
        </div>

        {/* Collection Rate Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>
           <div className="flex justify-between items-start">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                 <PieChart size={20} />
              </div>
           </div>
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">Collection Rate</p>
           <p className="text-2xl font-black text-gray-900 mt-1">{collectionRate}%</p>
           <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${collectionRate}%` }} />
           </div>
        </div>

        {/* Projected Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
           <div className="flex justify-between items-start">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                 <Plus size={20} />
              </div>
           </div>
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">Total Amount Recorded</p>
           <p className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(totalProjected)}</p>
        </div>
      </div>

      {/* Toolbar & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by student, batch, txn, or payment method..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
          />
        </div>
        <div className="flex gap-2">
           <select 
             value={filterMonth}
             onChange={(e) => setFilterMonth(e.target.value)}
             className="text-sm border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 focus:ring-indigo-500 outline-none text-gray-700 font-semibold"
           >
              <option value="All">All Months</option>
              {monthOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
           </select>
          <Button variant="secondary" className="gap-2" onClick={() => { setSearchQuery(''); setFilterMonth('All'); }}>
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Fee Table */}
      <FeeTable records={filteredRecords} onDelete={handleDelete} isLoading={loading} />
    </div>
  );
}
